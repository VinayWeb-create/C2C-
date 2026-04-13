import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a project title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a project description']
  },
  budget: {
    type: Number,
    required: [true, 'Please add a budget']
  },
  skillsRequired: [{
    type: String
  }],
  roles: [{
    type: String
  }],
  requirements: {
    type: String
  },
  timeline: {
    type: String
  },
  category: {
    type: String,
    required: [true, 'Please add a category']
  },
  deadline: {
    type: Date
  },
  postedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'assigned', 'in_progress', 'completed', 'cancelled'],
    default: 'open'
  },
  applications: [{
    provider: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'shortlisted', 'accepted', 'rejected'],
      default: 'pending'
    },
    notes: String,
    contactEmail: String,
    contactPhone: String
  }],
  assignedTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const Project = mongoose.model('Project', projectSchema);

export default Project;
