import Service from '../models/Service.js';
import Booking from '../models/Booking.js';

// Score-based recommendation engine
export const getRecommendedServices = async ({
  category, maxPrice, city, userId, limit = 6,
}) => {
  const query = { isActive: true };
  if (category) query.category = new RegExp(category, 'i');
  if (maxPrice)  query['price.amount'] = { $lte: parseFloat(maxPrice) };
  if (city)      query['location.city'] = new RegExp(city, 'i');

  const services = await Service.find(query)
    .populate('provider', 'name avatar phone')
    .limit(100)
    .lean();

  if (!services.length) return [];

  const maxBookings = Math.max(...services.map((s) => s.totalBookings || 0), 1);
  const maxP        = Math.max(...services.map((s) => s.price.amount), 1);

  // Get user booking history for personalization
  let userCategories = [];
  if (userId) {
    const pastBookings = await Booking.find({ user: userId })
      .populate('service', 'category')
      .limit(20)
      .lean();
    userCategories = pastBookings.map((b) => b.service?.category).filter(Boolean);
  }

  const scored = services.map((s) => {
    const ratingScore    = (s.rating.average / 5) * 40;
    const priceScore     = (1 - s.price.amount / maxP) * 25;
    const popularityScore = (s.totalBookings / maxBookings) * 20;
    const personalScore  = userCategories.includes(s.category) ? 15 : 0;

    return {
      ...s,
      _score: Math.round(ratingScore + priceScore + popularityScore + personalScore),
    };
  });

  return scored.sort((a, b) => b._score - a._score).slice(0, limit);
};

// Trending services (most booked in last 7 days)
export const getTrendingServices = async (limit = 8) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const trending = await Booking.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo }, status: { $ne: 'cancelled' } } },
    { $group: { _id: '$service', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'services',
        localField: '_id',
        foreignField: '_id',
        as: 'service',
      },
    },
    { $unwind: '$service' },
    { $match: { 'service.isActive': true } },
    {
      $project: {
        service: 1,
        bookingCount: '$count',
      },
    },
  ]);

  return trending.map((t) => ({ ...t.service, trendingCount: t.bookingCount }));
};
