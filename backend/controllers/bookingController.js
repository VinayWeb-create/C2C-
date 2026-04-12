import asyncHandler from '../utils/asyncHandler.js';
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private/User
export const createBooking = asyncHandler(async (req, res) => {
  const { serviceId, bookingDate, timeSlot, address, notes, paymentMethod } = req.body;

  const service = await Service.findById(serviceId);
  if (!service) { res.status(404); throw new Error('Service not found'); }
  if (!service.isActive) { res.status(400); throw new Error('Service is not available'); }

  const taxAmount   = service.price.amount * 0.18;
  const totalAmount = service.price.amount + taxAmount;

  const booking = await Booking.create({
    user:        req.user._id,
    service:     serviceId,
    provider:    service.provider,
    bookingDate,
    timeSlot,
    address,
    notes,
    pricing: {
      baseAmount:   service.price.amount,
      taxAmount:    Math.round(taxAmount),
      totalAmount:  Math.round(totalAmount),
      paymentMethod: paymentMethod || 'cash',
    },
  });

  await Service.findByIdAndUpdate(serviceId, { $inc: { totalBookings: 1 } });

  const populated = await booking.populate([
    { path: 'service', select: 'title category price' },
    { path: 'provider', select: 'name phone avatar' },
  ]);

  res.status(201).json({ success: true, booking: populated });
});

// @desc    Get user's bookings
// @route   GET /api/bookings/my
// @access  Private
export const getMyBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const query = { user: req.user._id };
  if (status) query.status = status;

  const bookings = await Booking.find(query)
    .populate('service', 'title category images price')
    .populate('provider', 'name phone avatar')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Booking.countDocuments(query);
  res.json({ success: true, total, bookings });
});

// @desc    Get provider's bookings
// @route   GET /api/bookings/provider
// @access  Private/Provider
export const getProviderBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const query = { provider: req.user._id };
  if (status) query.status = status;

  const bookings = await Booking.find(query)
    .populate('service', 'title category')
    .populate('user', 'name phone avatar')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Booking.countDocuments(query);
  res.json({ success: true, total, bookings });
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status, cancellationReason } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) { res.status(404); throw new Error('Booking not found'); }

  const isUser     = booking.user.toString()     === req.user._id.toString();
  const isProvider = booking.provider.toString() === req.user._id.toString();

  if (!isUser && !isProvider && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }

  // Business rules
  if (isUser && !['cancelled'].includes(status)) {
    res.status(403); throw new Error('Users can only cancel bookings');
  }
  if (isProvider && !['confirmed', 'rejected', 'in_progress', 'completed'].includes(status)) {
    res.status(403); throw new Error('Invalid status transition for provider');
  }

  booking.status = status;
  if (cancellationReason) booking.cancellationReason = cancellationReason;
  if (status === 'completed') booking.completedAt = new Date();
  await booking.save();

  res.json({ success: true, booking });
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('service', 'title category images price location')
    .populate('user',     'name phone avatar email')
    .populate('provider', 'name phone avatar email');

  if (!booking) { res.status(404); throw new Error('Booking not found'); }

  const authorized =
    booking.user._id.toString()     === req.user._id.toString() ||
    booking.provider._id.toString() === req.user._id.toString() ||
    req.user.role === 'admin';

  if (!authorized) { res.status(403); throw new Error('Not authorized'); }

  res.json({ success: true, booking });
});
