import User from '../models/User.js';
import Report from '../models/Report.js';
import Post from '../models/Post.js';
import Research from '../models/Research.js';
import Field from '../models/Field.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get all users for management
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUserModerationList = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  const { status, role } = req.query;

  const mongoQuery = {};
  if (status) mongoQuery.status = status;
  if (role) mongoQuery.role = role;

  const users = await User.find(mongoQuery)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(mongoQuery);

  res.json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: users
  });
});

// @desc    Suspend or activate user
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
export const toggleUserStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body; // active, suspended, shadow_banned
  const userId = req.params.id;

  if (userId === req.user.id) {
    return next(new ErrorResponse('You cannot suspend your own account', 400));
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { status },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  res.json({
    success: true,
    message: `User status changed to ${status}`,
    data: user
  });
});

// @desc    Get moderation report queue
// @route   GET /api/admin/reports
// @access  Private/Admin-Moderator
export const getReportQueue = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  const { status } = req.query; // pending, resolved, dismissed

  const mongoQuery = status ? { status } : {};

  const reports = await Report.find(mongoQuery)
    .populate('reporter', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Report.countDocuments(mongoQuery);

  res.json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: reports
  });
});

// @desc    Resolve report
// @route   PUT /api/admin/reports/:id/resolve
// @access  Private/Admin-Moderator
export const resolveReport = asyncHandler(async (req, res, next) => {
  const { status, actionTaken } = req.body; // resolved, dismissed
  const reportId = req.params.id;

  const report = await Report.findByIdAndUpdate(
    reportId,
    { status, actionTaken },
    { new: true }
  );

  if (!report) {
    return next(new ErrorResponse('Report not found', 404));
  }

  res.json({
    success: true,
    message: `Report status updated to ${status}`,
    data: report
  });
});

// @desc    Approve research paper
// @route   PUT /api/admin/research/:id/approve
// @access  Private/Admin-Moderator
export const approveResearchPaper = asyncHandler(async (req, res, next) => {
  const researchDetailsId = req.params.id;

  const research = await Research.findByIdAndUpdate(
    researchDetailsId,
    { isApproved: true },
    { new: true }
  );

  if (!research) {
    return next(new ErrorResponse('Research document not found', 404));
  }

  // Update associated post status if we find it
  await Post.findOneAndUpdate(
    { researchDetails: researchDetailsId },
    { status: 'published' }
  );

  res.json({
    success: true,
    message: 'Research paper successfully approved and published',
    data: research
  });
});

// @desc    Get dashboard analytics metrics
// @route   GET /api/admin/metrics
// @access  Private/Admin
export const getAnalyticsMetrics = asyncHandler(async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  const totalPosts = await Post.countDocuments({ status: 'published' });
  const pendingReports = await Report.countDocuments({ status: 'pending' });
  const pendingResearch = await Research.countDocuments({ isApproved: false });

  // Count posts grouped by type
  const postDistribution = await Post.aggregate([
    { $match: { status: 'published' } },
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]);

  res.json({
    success: true,
    data: {
      metrics: {
        totalUsers,
        totalPosts,
        pendingReports,
        pendingResearch
      },
      postDistribution
    }
  });
});

// @desc    Rename a Field
// @route   PUT /api/admin/fields/:id
// @access  Private/Admin
export const renameField = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const fieldId = req.params.id;

  if (!name || !name.trim()) {
    return next(new ErrorResponse('Please provide a field name', 400));
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const field = await Field.findByIdAndUpdate(
    fieldId,
    { name: name.trim(), slug },
    { new: true, runValidators: true }
  );

  if (!field) {
    return next(new ErrorResponse('Field category not found', 404));
  }

  res.json({
    success: true,
    message: 'Field renamed successfully',
    data: field
  });
});

// @desc    Delete a Field
// @route   DELETE /api/admin/fields/:id
// @access  Private/Admin
export const deleteField = asyncHandler(async (req, res, next) => {
  const fieldId = req.params.id;

  const field = await Field.findByIdAndDelete(fieldId);

  if (!field) {
    return next(new ErrorResponse('Field category not found', 404));
  }

  // Update posts that were pointing to this field to be reassigned to generic or deleted
  await Post.deleteMany({ field: fieldId });

  res.json({
    success: true,
    message: 'Field and its associated posts deleted successfully'
  });
});

// @desc    Merge duplicate Fields
// @route   POST /api/admin/fields/merge
// @access  Private/Admin
export const mergeFields = asyncHandler(async (req, res, next) => {
  const { sourceFieldId, targetFieldId } = req.body;

  if (!sourceFieldId || !targetFieldId) {
    return next(new ErrorResponse('Please provide both source and target field IDs', 400));
  }

  if (sourceFieldId === targetFieldId) {
    return next(new ErrorResponse('Source and target fields must be different', 400));
  }

  const sourceField = await Field.findById(sourceFieldId);
  const targetField = await Field.findById(targetFieldId);

  if (!sourceField || !targetField) {
    return next(new ErrorResponse('One or both fields do not exist', 404));
  }

  // Find all posts belonging to source field and update their field key
  const updatedPosts = await Post.updateMany(
    { field: sourceFieldId },
    { field: targetFieldId }
  );

  const shiftCount = updatedPosts.modifiedCount || updatedPosts.nModified || 0;

  // Increment target field postsCount
  targetField.postsCount += shiftCount;
  await targetField.save();

  // Delete source field
  await Field.findByIdAndDelete(sourceFieldId);

  res.json({
    success: true,
    message: `Merged fields successfully. ${shiftCount} posts reassigned to ${targetField.name}.`
  });
});
