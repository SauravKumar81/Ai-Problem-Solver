// server/routes/admin.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { Problem, Solution } = require('../models/Problem');
const { protect, authorize } = require('../middleware/auth');

// All routes require admin authorization
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/stats
// @desc    Get system statistics
// @access  Admin
router.get('/stats', async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });

    // Problem statistics
    const totalProblems = await Problem.countDocuments();
    const solvedProblems = await Problem.countDocuments({ status: 'solved' });
    const pendingProblems = await Problem.countDocuments({ status: 'pending' });
    const failedProblems = await Problem.countDocuments({ status: 'failed' });

    // Category breakdown
    const problemsByCategory = await Problem.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Recent activity
    const recentProblems = await Problem.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'username email')
      .select('title category status createdAt');

    // User growth (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // API usage statistics
    const apiUsageStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalQueries: { $sum: '$apiUsage.totalQueries' },
          avgMonthlyQueries: { $avg: '$apiUsage.monthlyQueries' }
        }
      }
    ]);

    // Subscription distribution
    const subscriptionStats = await User.aggregate([
      {
        $group: {
          _id: '$subscription.plan',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          admins: adminUsers,
          newThisMonth: newUsers
        },
        problems: {
          total: totalProblems,
          solved: solvedProblems,
          pending: pendingProblems,
          failed: failedProblems,
          byCategory: problemsByCategory
        },
        apiUsage: apiUsageStats[0] || { totalQueries: 0, avgMonthlyQueries: 0 },
        subscriptions: subscriptionStats,
        recentActivity: recentProblems
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Admin
router.get('/users', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search,
      role,
      plan,
      isActive 
    } = req.query;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) query.role = role;
    if (plan) query['subscription.plan'] = plan;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // Execute query
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get single user details
// @access  Admin
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's problem statistics
    const problemStats = await Problem.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentProblems = await Problem.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title category status createdAt');

    res.json({
      success: true,
      data: {
        user,
        statistics: {
          problems: problemStats,
          recentActivity: recentProblems
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Admin
router.put('/users/:id', async (req, res) => {
  try {
    const { role, isActive, subscription } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from demoting themselves
    if (user._id.toString() === req.user.id && role === 'user') {
      return res.status(400).json({
        success: false,
        message: 'Cannot demote yourself'
      });
    }

    // Update fields
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    
    if (subscription) {
      if (subscription.plan) user.subscription.plan = subscription.plan;
      if (subscription.queryLimit) user.subscription.queryLimit = subscription.queryLimit;
    }

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Admin
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Delete user's problems and solutions
    const userProblems = await Problem.find({ user: user._id });
    
    for (const problem of userProblems) {
      if (problem.solution) {
        await Solution.findByIdAndDelete(problem.solution);
      }
      await problem.deleteOne();
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
});

// @route   GET /api/admin/problems
// @desc    Get all problems
// @access  Admin
router.get('/problems', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category } = req.query;

    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const problems = await Problem.find(query)
      .populate('user', 'username email')
      .populate('solution')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Problem.countDocuments(query);

    res.json({
      success: true,
      data: {
        problems,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching problems',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/problems/:id
// @desc    Delete any problem
// @access  Admin
router.delete('/problems/:id', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    if (problem.solution) {
      await Solution.findByIdAndDelete(problem.solution);
    }

    await problem.deleteOne();

    res.json({
      success: true,
      message: 'Problem deleted successfully'
    });
  } catch (error) {
    console.error('Delete problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting problem',
      error: error.message
    });
  }
});

module.exports = router;