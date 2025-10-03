// server/routes/problems.js
const express = require('express');
const router = express.Router();
const { Problem, Solution } = require('../models/Problem');
const { protect, checkQueryLimit } = require('../middleware/auth');
const aiService = require('../services/aiService');
const codeExecutor = require('../services/codeExecutor');

// @route   POST /api/problems
// @desc    Create and solve a problem
// @access  Private
router.post('/', protect, checkQueryLimit, async (req, res) => {
  try {
    const { title, description, category, language, difficulty, tags } = req.body;

    // Validation
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and category'
      });
    }

    // Create problem
    const problem = await Problem.create({
      user: req.user.id,
      title,
      description,
      category,
      language,
      difficulty: difficulty || 'medium',
      tags: tags || [],
      status: 'processing'
    });

    // Generate AI solution
    try {
      const aiResult = await aiService.generateSolution({
        title,
        description,
        category,
        language,
        difficulty
      });

      // Create solution
      const solution = await Solution.create({
        problem: problem._id,
        aiModel: aiResult.aiModel,
        answer: aiResult.answer,
        explanation: aiResult.explanation,
        code: aiResult.code,
        steps: aiResult.steps,
        tokenUsage: aiResult.tokenUsage,
        processingTime: aiResult.processingTime
      });

      // Execute code if available
      if (aiResult.code && aiResult.code.snippet && language) {
        try {
          const executionResult = await codeExecutor.executeCode(
            aiResult.code.snippet,
            language
          );
          solution.executionResult = executionResult;
          await solution.save();
        } catch (execError) {
          console.error('Code execution error:', execError);
          solution.executionResult = {
            status: 'Execution Failed',
            error: execError.message
          };
          await solution.save();
        }
      }

      // Update problem with solution
      problem.solution = solution._id;
      problem.status = 'solved';
      await problem.save();

      // Increment user query count
      await req.user.incrementQueryCount();

      // Populate solution details
      const populatedProblem = await Problem.findById(problem._id)
        .populate('solution')
        .populate('user', 'username email');

      res.status(201).json({
        success: true,
        message: 'Problem solved successfully',
        data: {
          problem: populatedProblem
        }
      });
    } catch (aiError) {
      console.error('AI service error:', aiError);
      problem.status = 'failed';
      await problem.save();

      return res.status(500).json({
        success: false,
        message: 'Failed to generate solution',
        error: aiError.message,
        data: { problem }
      });
    }
  } catch (error) {
    console.error('Create problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating problem',
      error: error.message
    });
  }
});

// @route   GET /api/problems
// @desc    Get user's problems
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      status, 
      difficulty,
      search,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query
    const query = { user: req.user.id };

    if (category) query.category = category;
    if (status) query.status = status;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$text = { $search: search };
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    // Execute query with pagination
    const problems = await Problem.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('solution')
      .exec();

    // Get total count
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

// @route   GET /api/problems/:id
// @desc    Get single problem
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id)
      .populate('solution')
      .populate('user', 'username email');

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Check if user owns the problem or is admin
    if (problem.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this problem'
      });
    }

    // Increment views
    problem.views += 1;
    await problem.save();

    res.json({
      success: true,
      data: { problem }
    });
  } catch (error) {
    console.error('Get problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching problem',
      error: error.message
    });
  }
});

// @route   DELETE /api/problems/:id
// @desc    Delete problem
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Check if user owns the problem or is admin
    if (problem.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this problem'
      });
    }

    // Delete associated solution
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

// @route   PUT /api/problems/:id/bookmark
// @desc    Toggle bookmark status
// @access  Private
router.put('/:id/bookmark', protect, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    if (problem.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    problem.bookmarked = !problem.bookmarked;
    await problem.save();

    res.json({
      success: true,
      message: `Problem ${problem.bookmarked ? 'bookmarked' : 'unbookmarked'}`,
      data: { problem }
    });
  } catch (error) {
    console.error('Bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating bookmark',
      error: error.message
    });
  }
});

// @route   GET /api/problems/stats/summary
// @desc    Get user's problem statistics
// @access  Private
router.get('/stats/summary', protect, async (req, res) => {
  try {
    const stats = await Problem.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          solved: {
            $sum: { $cond: [{ $eq: ['$status', 'solved'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          }
        }
      }
    ]);

    const categoryStats = await Problem.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        summary: stats[0] || { total: 0, solved: 0, pending: 0, failed: 0 },
        byCategory: categoryStats
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

module.exports = router;