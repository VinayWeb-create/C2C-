import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'provider', 'admin'],
    default: 'user',
  },
  // Professional Details (For Providers)
  professionalInfo: {
    education:     { type: String, default: '' },
    skills:        [{ type: String }],
    experience:    { type: String, default: '' },
    currentStatus: { type: String, default: '' }, // e.g., 'Student', 'Freelancer', 'Unstop Member'
    bio:           { type: String, default: '' },
    portfolioUrl:  { type: String, default: '' },
    githubUrl:     { type: String, default: '' },
    linkedInUrl:   { type: String, default: '' },
    resumeUrl:     { type: String, default: '' },
  },
  badges: [{
    name: String,
    issuedAt: { type: Date, default: Date.now },
    role: String // The role they earned the badge for
  }],
  isApproved: { 
    type: Boolean, 
    default: function() {
      return this.role !== 'provider'; // Auto-approve users/admins, providers need manual approval
    }
  },
  phone: {
    type: String,
    trim: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0],
    },
    address: { type: String, default: '' },
    city:    { type: String, default: '' },
    state:   { type: String, default: '' },
  },
  isVerified:  { type: Boolean, default: false },
  isActive:    { type: Boolean, default: true },
  refreshToken: { type: String, select: false },
  resetPasswordToken:   { type: String, select: false },
  resetPasswordExpire:  { type: Date,   select: false },
  resetPasswordOTP:     { type: String, select: false },
  resetPasswordOTPExpire: { type: Date, select: false },
  portfolioSubmittedAt: { type: Date },
  isProfileComplete: { type: Boolean, default: false },
  activeLearningDomain: { type: String, default: null },
  completedVideos: [{ type: String }], // Array of video IDs
  testResults: [{
    category: String,
    examScore: Number,      // Out of 50
    projectScore: Number,   // Out of 50
    githubRepo: String,
    passed: Boolean,
    completedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

userSchema.index({ 'location': '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
