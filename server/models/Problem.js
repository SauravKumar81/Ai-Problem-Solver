// server/models/Problem.js
const mongoose = require('mongoose');

const solutionSchema = new mongoose.Schema({
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  aiModel: {
    type: String,
    enum: ['gpt-4', 'gpt-3.5-turbo', 'claude-3', 'claude-2'],
    default: 'gpt-4'
  },
  answer: {
    type: String,
    required: true
  },
  explanation: {
    type: String
  },
  code: {
    language: String,
    snippet: String,
    optimizedVersion: String
  },
  steps: [{
    stepNumber: Number,
    description: String,
    code: String
  }],
  executionResult: {
    status: String,
    output: String,
    time: String,
    memory: String,
    error: String
  },
  tokenUsage: {
    prompt: Number,
    completion: Number,
    total: Number
  },
  processingTime: Number, // in milliseconds
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String
  }
}, {
  timestamps: true
});

const problemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  category: {
    type: String,
    required: true,
    enum: [
      'programming',
      'mathematics',
      'writing',
      'debugging',
      'optimization',
      'data-science',
      'algorithm',
      'database',
      'system-design',
      'other'
    ],
    index: true
  },
  language: {
    type: String,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  status: {
    type: String,
    enum: ['pending', 'processing', 'solved', 'failed'],
    default: 'pending',
    index: true
  },
  solution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Solution'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  bookmarked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
problemSchema.index({ user: 1, createdAt: -1 });
problemSchema.index({ category: 1, difficulty: 1 });
problemSchema.index({ tags: 1 });
problemSchema.index({ status: 1, createdAt: -1 });

// Text index for search
problemSchema.index({ 
  title: 'text', 
  description: 'text', 
  tags: 'text' 
});

// Virtual for solution details
problemSchema.virtual('solutionDetails', {
  ref: 'Solution',
  localField: 'solution',
  foreignField: '_id',
  justOne: true
});

// Ensure virtuals are included in JSON
problemSchema.set('toJSON', { virtuals: true });
problemSchema.set('toObject', { virtuals: true });

const Problem = mongoose.model('Problem', problemSchema);
const Solution = mongoose.model('Solution', solutionSchema);

module.exports = { Problem, Solution };