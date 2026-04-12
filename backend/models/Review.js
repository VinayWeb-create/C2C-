import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
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
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true,
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    maxlength: [500, 'Comment cannot exceed 500 characters'],
  },
  images: [{ type: String }],
  providerResponse: {
    text:      { type: String, maxlength: 300 },
    createdAt: { type: Date },
  },
  isVerified: { type: Boolean, default: true },
  helpfulVotes: { type: Number, default: 0 },
}, { timestamps: true });

// After saving a review, update the service rating average
reviewSchema.post('save', async function () {
  const Service = mongoose.model('Service');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { service: this.service } },
    { $group: { _id: '$service', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Service.findByIdAndUpdate(this.service, {
      'rating.average': Math.round(stats[0].avgRating * 10) / 10,
      'rating.count':   stats[0].count,
    });
  }
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
