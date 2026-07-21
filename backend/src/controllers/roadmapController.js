import Roadmap from '../models/Roadmap.js';
import RoadmapStep from '../models/RoadmapStep.js';
import RoadmapProgress from '../models/RoadmapProgress.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get roadmap detail by slug
// @route   GET /api/roadmaps/:slug
// @access  Public
export const getRoadmapDetail = asyncHandler(async (req, res, next) => {
  const roadmap = await Roadmap.findOne({ slug: req.params.slug });

  if (!roadmap) {
    return next(new ErrorResponse('Roadmap not found', 404));
  }

  // Fetch all steps for this roadmap, sorted by order
  const steps = await RoadmapStep.find({ roadmapId: roadmap._id })
    .sort({ order: 1 })
    .populate('resources');

  res.json({
    success: true,
    data: {
      roadmap,
      steps
    }
  });
});

// @desc    Get current user progress for a roadmap
// @route   GET /api/roadmaps/:id/progress
// @access  Private
export const getRoadmapProgress = asyncHandler(async (req, res, next) => {
  const roadmapId = req.params.id;
  const userId = req.user.id;

  let progress = await RoadmapProgress.findOne({ userId, roadmapId });

  if (!progress) {
    // Return empty tracker if no progress yet
    progress = {
      roadmapId,
      userId,
      completedSteps: []
    };
  }

  res.json({
    success: true,
    data: progress
  });
});

// @desc    Toggle roadmap step completion status
// @route   POST /api/roadmaps/:id/steps/:stepId/toggle
// @access  Private
export const toggleStepProgress = asyncHandler(async (req, res, next) => {
  const { id: roadmapId, stepId } = req.params;
  const userId = req.user.id;

  // Verify step exists
  const step = await RoadmapStep.findById(stepId);
  if (!step) {
    return next(new ErrorResponse('Roadmap step not found', 404));
  }

  let progress = await RoadmapProgress.findOne({ userId, roadmapId });

  if (!progress) {
    progress = await RoadmapProgress.create({
      userId,
      roadmapId,
      completedSteps: [stepId]
    });
  } else {
    const isCompleted = progress.completedSteps.includes(stepId);
    if (isCompleted) {
      // Pull
      progress.completedSteps = progress.completedSteps.filter(id => id.toString() !== stepId);
    } else {
      // Push
      progress.completedSteps.push(stepId);
    }
    progress.lastActive = Date.now();
    await progress.save();
  }

  res.json({
    success: true,
    data: progress
  });
});
