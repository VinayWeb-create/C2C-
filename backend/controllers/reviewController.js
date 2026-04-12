import asyncHandler from '../utils/asyncHandler.js';
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';

// @desc    Add review
// @route   POST /api/reviews
// @access  Private/User
export const addReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, comment } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) { res.status(404); throw new Error('Booking not found'); }
  if (booking.user.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized');
  }
  if (booking.status !== 'completed') {
    res.status(400); throw new Error('Can only review completed bookings');
  }
  if (booking.reviewSubmitted) {
    res.status(400); throw new Error('Review already submitted for this booking');
  }

  const review = await Review.create({
    user:    req.user._id,
    service: booking.service,
    booking: bookingId,
    rating,
    comment,
  });

  await Booking.findByIdAndUpdate(bookingId, { reviewSubmitted: true });

  const populated = await review.populate('user', 'name avatar');
  res.status(201).json({ success: true, review: populated });
});

// @desc    Get reviews for a service
// @route   GET /api/reviews/service/:serviceId
// @access  Public
export const getServiceReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const query = { service: req.params.serviceId };

  const reviews = await Review.find(query)
    .populate('user', 'name avatar')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Review.countDocuments(query);

  const stats = await Review.aggregate([
    { $match: { service: reviews[0]?.service || null } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        total:     { $sum: 1 },
        fiveStar:  { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
        fourStar:  { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
        threeStar: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
        twoStar:   { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
        oneStar:   { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
      },
    },
  ]);

  res.json({ success: true, total, reviews, stats: stats[0] || {} });
});

// @desc    Provider response to review
// @route   PUT /api/reviews/:id/respond
// @access  Private/Provider
export const respondToReview = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const review = await Review.findById(req.params.id).populate('service');

  if (!review) { res.status(404); throw new Error('Review not found'); }
  if (review.service.provider.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized');
  }

  review.providerResponse = { text, createdAt: new Date() };
  await review.save();

  res.json({ success: true, review });
});

// @desc    Delete review (admin only)
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) { res.status(404); throw new Error('Review not found'); }
  await review.deleteOne();
  res.json({ success: true, message: 'Review removed' });
});
