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
  const { name, phone, location, avatar, professionalInfo } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, location, avatar, professionalInfo },
    { new: true, runValidators: true }
  );

  res.json({ success: true, user });
});

// @desc    Add badge to user (Earned via learning)
// @route   PUT /api/auth/add-badge
// @access  Private
export const addBadge = asyncHandler(async (req, res) => {
  const { name, role } = req.body;
  const user = await User.findById(req.user._id);

  // Check if badge already exists
  const hasBadge = user.badges.find(b => b.name === name);
  if (hasBadge) {
    return res.json({ success: true, message: 'Badge already earned', user });
  }

  user.badges.push({ name, role });
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
      return res.json({ success: true, message: 'If your email is registered, an OTP will be sent.' });
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpire = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    // HTML Message
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #4f46e5; text-align: center;">Smart Local Life</h2>
        <p>Hello ${user.name},</p>
        <p>You requested to reset your password. Please use the following <strong>4-digit OTP</strong> to complete the process:</p>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #1f2937; border-radius: 8px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #6b7280; font-size: 14px;">This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">&copy; ${new Date().getFullYear()} Smart Local Life</p>
      </div>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Password Reset OTP - Smart Local Life',
      message: `Your password reset OTP is ${otp}`,
      html
    });
    
    res.json({ success: true, message: 'OTP sent to your registered email.' });
  } catch (err) {
    console.error('Forgot Password Error:', err);
    res.status(500);
    throw new Error('Could not send the password reset email. Please try again later.');
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
  if (!user.badges || user.badges.length === 0) {
    res.status(403);
    throw new Error('You must earn a Professional Merit Badge in the Learning Hub before becoming a provider.');
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
