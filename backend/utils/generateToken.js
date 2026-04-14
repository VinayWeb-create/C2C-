import jwt from 'jsonwebtoken';

export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

export const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '90d' });
};

export const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      user: {
        _id:      user._id,
        name:     user.name,
        email:    user.email,
        role:     user.role,
        avatar:   user.avatar,
        phone:    user.phone,
        location: user.location,
        isApproved: user.isApproved,
        badges:     user.badges,
        professionalInfo: user.professionalInfo,
        portfolioSubmittedAt: user.portfolioSubmittedAt,
        isProfileComplete: user.isProfileComplete,
        activeLearningDomain: user.activeLearningDomain,
        completedVideos: user.completedVideos
      },
    });
};
