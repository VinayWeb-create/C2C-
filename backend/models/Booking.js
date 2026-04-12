import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bookingDate: {
    type: Date,
    required: [true, 'Booking date is required'],
  },
  timeSlot: {
    start: { type: String, required: true },
    end:   { type: String, required: true },
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected'],
    default: 'pending',
  },
  address: {
    street:  { type: String, required: true },
    city:    { type: String, required: true },
    state:   { type: String, required: true },
    pincode: { type: String, required: true },
  },
  pricing: {
    baseAmount:   { type: Number, required: true },
    taxAmount:    { type: Number, default: 0 },
    totalAmount:  { type: Number, required: true },
    currency:     { type: String, default: 'INR' },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'failed'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'card', 'netbanking'],
      default: 'cash',
    },
  },
  notes:           { type: String, maxlength: 500 },
  cancellationReason: { type: String },
  completedAt:     { type: Date },
  reviewSubmitted: { type: Boolean, default: false },
}, { timestamps: true });

bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ provider: 1, status: 1 });
bookingSchema.index({ bookingDate: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
