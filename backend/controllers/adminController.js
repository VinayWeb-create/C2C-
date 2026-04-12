import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';

// @desc    Get admin statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = asyncHandler(async (req, res) => {
  const userCount = await User.countDocuments({ role: 'user' });
  const providerCount = await User.countDocuments({ role: 'provider' });
  
  const totalEarnings = await Booking.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$pricing.totalAmount' } } }
  ]);

  const recentBookings = await Booking.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user', 'name email')
    .populate('provider', 'name email')
    .populate('service', 'title');

  res.json({
    success: true,
    stats: {
      users: userCount,
      providers: providerCount,
      earnings: totalEarnings[0]?.total || 0,
    },
    recentBookings
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: 'user' }).select('-password');
  res.json({ success: true, users });
});

// @desc    Get all providers
// @route   GET /api/admin/providers
// @access  Private/Admin
export const getAllProviders = asyncHandler(async (req, res) => {
  const providers = await User.find({ role: 'provider' }).select('-password');
  res.json({ success: true, providers });
});

// @desc    Get detailed earnings report
// @route   GET /api/admin/earnings
// @access  Private/Admin
export const getEarningsReport = asyncHandler(async (req, res) => {
  const earningsByMonth = await Booking.aggregate([
    { $match: { status: 'completed' } },
    {
      $group: {
        _id: { $month: '$createdAt' },
        total: { $sum: '$pricing.totalAmount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  res.json({ success: true, earningsByMonth });
});
