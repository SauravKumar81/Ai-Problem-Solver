// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  apiUsage: {
    totalQueries: {
      type: Number,
      default: 0
    },
    monthlyQueries: {
      type: Number,
      default: 0
    },
    lastResetDate: {
      type: Date,
      default: Date.now
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free'
    },
    queryLimit: {
      type: Number,
      default: 50 // Free tier limit
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date
  },
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    bio: String
  },
  lastLogin: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to reset monthly queries
userSchema.methods.resetMonthlyQueries = function() {
  const now = new Date();
  const lastReset = new Date(this.apiUsage.lastResetDate);
  
  // Check if a month has passed
  if (now.getMonth() !== lastReset.getMonth() || 
      now.getFullYear() !== lastReset.getFullYear()) {
    this.apiUsage.monthlyQueries = 0;
    this.apiUsage.lastResetDate = now;
  }
};

// Method to check if user can make query
userSchema.methods.canMakeQuery = function() {
  this.resetMonthlyQueries();
  return this.apiUsage.monthlyQueries < this.subscription.queryLimit;
};

// Method to increment query count
userSchema.methods.incrementQueryCount = async function() {
  this.apiUsage.totalQueries += 1;
  this.apiUsage.monthlyQueries += 1;
  await this.save();
};

// Remove password from JSON response
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);