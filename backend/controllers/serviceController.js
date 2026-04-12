import asyncHandler from '../utils/asyncHandler.js';
import Service from '../models/Service.js';

/* ── Geocode city using Nominatim (OpenStreetMap) ── FREE, no API key needed */
const geocodeCity = async (city, state) => {
  try {
    if (!city) return null;
    const q = encodeURIComponent(`${city}${state ? ', ' + state : ''}, India`);
    const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&addressdetails=1`;
    const res  = await fetch(url, {
      headers: {
        'User-Agent': 'SmartLocalLife/1.0 (smart-local-life@dev)',
        'Accept-Language': 'en',
      },
    });
    const data = await res.json();
    if (data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      return [lng, lat]; // GeoJSON order: [longitude, latitude]
    }
  } catch { /* silent */ }
  return null;
};

// @desc    Get all services (with filters, pagination, geo)
// @route   GET /api/services
// @access  Public
export const getServices = asyncHandler(async (req, res) => {
  const {
    category, minPrice, maxPrice, rating, city,
    search, lat, lng, radius = 50,
    page = 1, limit = 12, sort = '-rating.average',
  } = req.query;

  const query = { isActive: true };

  if (category)  query.category = category;
  if (city)      query['location.city'] = new RegExp(city, 'i');
  if (rating)    query['rating.average'] = { $gte: parseFloat(rating) };
  if (minPrice || maxPrice) {
    query['price.amount'] = {};
    if (minPrice) query['price.amount'].$gte = parseFloat(minPrice);
    if (maxPrice) query['price.amount'].$lte = parseFloat(maxPrice);
  }
  if (search) {
    query.$text = { $search: search };
  }

  // Geo query — find within radius (km)
  if (lat && lng) {
    query['location'] = {
      $near: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: parseFloat(radius) * 1000,
      },
    };
  }

  const skip  = (parseInt(page) - 1) * parseInt(limit);
  const total = await Service.countDocuments(query);
  const services = await Service.find(query)
    .populate('provider', 'name avatar phone rating')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    services,
  });
});

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
export const getServiceById = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id)
    .populate('provider', 'name avatar phone email location createdAt');

  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  res.json({ success: true, service });
});

// @desc    Create service
// @route   POST /api/services
// @access  Private/Provider
export const createService = asyncHandler(async (req, res) => {
  req.body.provider = req.user._id;

  // Auto-geocode
  const coords = await geocodeCity(
    req.body.location?.city,
    req.body.location?.state
  );
  if (coords) {
    req.body.location = {
      ...req.body.location,
      type: 'Point',
      coordinates: coords,
    };
  }

  const service = await Service.create(req.body);
  res.status(201).json({ success: true, service });
});

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private/Provider
export const updateService = asyncHandler(async (req, res) => {
  let service = await Service.findById(req.params.id);

  if (!service) { res.status(404); throw new Error('Service not found'); }
  if (service.provider.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized to update this service');
  }

  // Re-geocode if city changed
  if (req.body.location?.city) {
    const coords = await geocodeCity(req.body.location.city, req.body.location.state);
    if (coords) {
      req.body.location = {
        ...req.body.location,
        type: 'Point',
        coordinates: coords,
      };
    }
  }

  service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ success: true, service });
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private/Provider
export const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) { res.status(404); throw new Error('Service not found'); }
  if (service.provider.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }

  await service.deleteOne();
  res.json({ success: true, message: 'Service removed' });
});

// @desc    Get provider's own services
// @route   GET /api/services/my
// @access  Private/Provider
export const getMyServices = asyncHandler(async (req, res) => {
  const services = await Service.find({ provider: req.user._id }).sort('-createdAt');
  res.json({ success: true, services });
});

// @desc    Get services by category
// @route   GET /api/services/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Service.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 }, avgRating: { $avg: '$rating.average' } } },
    { $sort: { count: -1 } },
  ]);
  res.json({ success: true, categories });
});
