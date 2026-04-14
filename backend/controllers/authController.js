import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import { sendTokenResponse } from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('Email already registered');
  }

  const user = await User.create({ name, email, password, role: role || 'user', phone });
  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('Account has been deactivated');
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
});

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, location, avatar, professionalInfo, isProfileComplete } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const updateData = {
    name: name || user.name,
    phone: phone || user.phone,
    avatar: avatar || user.avatar,
    location: location || user.location,
  };

  if (isProfileComplete !== undefined) {
    updateData.isProfileComplete = !!isProfileComplete;
  }

  if (professionalInfo) {
    updateData.professionalInfo = {
      ...user.professionalInfo.toObject(),
      ...professionalInfo
    };
    
    if (professionalInfo.portfolioUrl || (professionalInfo.skills && professionalInfo.skills.length > 0)) {
      updateData.portfolioSubmittedAt = Date.now();
    }
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    console.log(`Backend: Profile updated via findByIdAndUpdate: ${updatedUser.email}, isComplete: ${updatedUser.isProfileComplete}`);
    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error('Backend: Profile Update CRITICAL Error:', err);
    res.status(400);
    throw new Error(err.message || 'Profile update failed validation');
  }
});

// @desc    Add badge to user (Earned via learning)
// @route   PUT /api/auth/add-badge
// @access  Private
export const setActiveDomain = asyncHandler(async (req, res) => {
  const { domain } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // If already has an active domain and not completed, don't allow change
  const hasBadge = user.badges?.some(b => b.role === user.activeLearningDomain);
  
  if (user.activeLearningDomain && !hasBadge && user.activeLearningDomain !== domain) {
    res.status(400);
    throw new Error(`You must complete your current specialization (${user.activeLearningDomain}) before switching.`);
  }

  user.activeLearningDomain = domain;
  await user.save();

  res.json({ success: true, user });
});

export const completeVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (!user.completedVideos.includes(videoId)) {
    user.completedVideos.push(videoId);
    await user.save();
  }

  res.json({ success: true, user });
});

export const addBadge = asyncHandler(async (req, res) => {
  const { name, role, testResult } = req.body;
  const user = await User.findById(req.user._id);

  // Check if badge already exists
  const hasBadge = user.badges.find(b => b.name === name);
  if (!hasBadge) {
    user.badges.push({ name, role });
  }

  // Save the formal test result for admin audit
  if (testResult) {
    user.testResults.push(testResult);
  }

  await user.save();
  res.json({ success: true, user });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.json({ success: true, message: 'Logged out successfully' });
});

// @desc    Forgot Password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    res.status(400);
    throw new Error('Please provide an email address');
  }

  try {
    const emailLower = email.toLowerCase();
    const user = await User.findOne({ email: emailLower });

    if (!user) {
      // For security, do not disclose if email exists. Still log it for dev.
      console.log(`Forgot password requested for non-existent email: ${emailLower}`);
      return res.json({ success: true, message: 'If your account exists, an OTP has been sent.' });
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpire = Date.now() + 15 * 60 * 1000; // Increased to 15 mins for better UX
    await user.save();

    console.log(`OTP generated for ${user.email}: ${otp}`);

    // HTML Message
    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 24px; background: #ffffff; color: #1e293b;">
        <div style="text-align: center; mb: 30px;">
          <h2 style="color: #4f46e5; font-weight: 800; font-size: 28px; margin-bottom: 8px;">C2C Academy</h2>
          <p style="color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Secure Access Portal</p>
        </div>
        <div style="padding: 20px 0; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; margin: 30px 0;">
          <p style="font-size: 16px; line-height: 1.6;">Hello <strong>${user.name}</strong>,</p>
          <p style="font-size: 16px; line-height: 1.6;">A password reset was requested for your account. Please use the following verification code to proceed:</p>
          <div style="background: #f8fafc; padding: 30px; text-align: center; font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #4f46e5; border-radius: 16px; margin: 24px 0; border: 1px solid #e2e8f0;">
            ${otp}
          </div>
          <p style="color: #ef4444; font-size: 14px; text-align: center; font-weight: 600;">Valid for 15 minutes only.</p>
        </div>
        <p style="color: #94a3b8; font-size: 13px; text-align: center;">If you did not request this reset, your account is still secure. No further action is required.</p>
        <p style="font-size: 11px; color: #cbd5e1; text-align: center; margin-top: 40px;">&copy; ${new Date().getFullYear()} Campus to Corporate Platform. All rights reserved.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: `[C2C] ${otp} is your verification code`,
        message: `Your password reset OTP is ${otp}`,
        html
      });
      console.log(`Email successfully sent to ${user.email}`);
    } catch (emailErr) {
      console.error('Email Dispatch Error Details:', emailErr);
      res.status(500);
      throw new Error(`Email delivery failed. This usually happens if SMTP is misconfigured.`);
    }
    
    res.json({ success: true, message: 'Verification code sent to your email.' });
  } catch (err) {
    console.error('Recover Password Exception:', err);
    res.status(res.statusCode || 500);
    throw new Error(err.message || 'Server error occurred during password recovery.');
  }
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const emailLower = email.toLowerCase();
  const user = await User.findOne({ 
    email: emailLower, 
    resetPasswordOTP: otp,
    resetPasswordOTPExpire: { $gt: Date.now() }
  }).select('+resetPasswordOTP +resetPasswordOTPExpire');

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired OTP');
  }

  res.json({ success: true, message: 'OTP verified successfully.' });
});

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const emailLower = email.toLowerCase();
  const user = await User.findOne({ 
    email: emailLower, 
    resetPasswordOTP: otp,
    resetPasswordOTPExpire: { $gt: Date.now() }
  }).select('+resetPasswordOTP +resetPasswordOTPExpire');

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired OTP session');
  }

  user.password = newPassword;
  user.resetPasswordOTP = undefined;
  user.resetPasswordOTPExpire = undefined;
  await user.save();

  res.json({ success: true, message: 'Password reset successfully. You can now login.' });
});

// @desc    Switch user role to provider (Requires merit badge)
// @route   PUT /api/auth/become-provider
// @access  Private
export const becomeProvider = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  // Requirement: User must have at least one professional badge
  const hasProfessionalBadge = user.badges?.some(b => b.name.includes('Professional'));
  
  if (!hasProfessionalBadge) {
    res.status(403);
    throw new Error('You must earn a Professional Merit Badge in the Learning Academy before transitioning to a Provider role.');
  }

  user.role = 'provider';
  user.isApproved = false; // Reset approval status for admin to re-review their professional info
  await user.save();

  res.json({ 
    success: true, 
    message: 'Congratulations! You are now a Provider. Please complete your professional profile for Admin approval.',
    user 
  });
});
