import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Service title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Web Development',
      'Graphic Design',
      'Digital Marketing & SEO',
      'Video & Photo Editing',
      'PPT Presentations',
      'Content Writing',
      'UI/UX Design',
      'Data Science',
      'IT Support',
      'Business Consulting',
      'Translation',
      'Voice Over',
      'Other',
    ],
  },
  subCategory: { type: String, trim: true },
  price: {
    amount: { type: Number, required: true, min: 0 },
    unit:   { type: String, enum: ['per_hour', 'per_day', 'fixed'], default: 'per_hour' },
    currency: { type: String, default: 'INR' },
  },
  images: [{ type: String }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: { type: [Number], default: [0, 0] },
    address: { type: String, default: '' },
    city:    { type: String, default: '' },
    state:   { type: String, default: '' },
    pincode: { type: String, default: '' },
  },
  availability: {
    days: {
      type: [String],
      enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    },
    startTime: { type: String, default: '09:00' },
    endTime:   { type: String, default: '18:00' },
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count:   { type: Number, default: 0 },
  },
  tags:       [{ type: String }],
  isActive:   { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  totalBookings: { type: Number, default: 0 },
}, { timestamps: true });

serviceSchema.index({ location: '2dsphere' });
serviceSchema.index({ category: 1, 'price.amount': 1 });
serviceSchema.index({ 'rating.average': -1 });
serviceSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Service = mongoose.model('Service', serviceSchema);
export default Service;
