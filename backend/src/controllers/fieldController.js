import Field from '../models/Field.js';
import User from '../models/User.js';
import Roadmap from '../models/Roadmap.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get all fields
// @route   GET /api/fields
// @access  Public
export const getFields = asyncHandler(async (req, res, next) => {
  const fields = await Field.find().sort({ name: 1 });
  res.json({
    success: true,
    count: fields.length,
    data: fields
  });
});

// @desc    Get single field details by slug
// @route   GET /api/fields/:slug
// @access  Public
export const getFieldDetail = asyncHandler(async (req, res, next) => {
  const field = await Field.findOne({ slug: req.params.slug });

  if (!field) {
    return next(new ErrorResponse('Field not found', 404));
  }

  res.json({
    success: true,
    data: field
  });
});

// @desc    Create a new Field
// @route   POST /api/fields
// @access  Private
export const createField = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;

  if (!name || !name.trim()) {
    return next(new ErrorResponse('Field name is required', 400));
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  // Fetch all fields to perform fuzzy duplicate check (space/hyphen insensitivity)
  const allFields = await Field.find();
  const searchNorm = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  let field = allFields.find(f => {
    const fn = f.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const fs = f.slug.replace(/[^a-z0-9]/g, '');
    return fn === searchNorm || fs === searchNorm;
  });

  if (field) {
    // Gracefully resolve to the existing field
    return res.status(200).json({
      success: true,
      data: field
    });
  }

  field = await Field.create({
    name: name.trim(),
    slug,
    description: description || `User-created learning category for ${name.trim()}`,
    moderators: [req.user.id]
  });

  res.status(201).json({
    success: true,
    data: field
  });
});

// @desc    Follow a field
// @route   POST /api/fields/:id/follow
// @access  Private
export const followField = asyncHandler(async (req, res, next) => {
  const fieldId = req.params.id;
  const userId = req.user.id;

  const field = await Field.findById(fieldId);
  if (!field) {
    return next(new ErrorResponse('Field not found', 404));
  }

  const user = await User.findById(userId);
  if (user.fieldsFollowed && user.fieldsFollowed.includes(fieldId)) {
    return next(new ErrorResponse('You are already following this field', 400));
  }

  // Add to user and increment field count
  await User.findByIdAndUpdate(userId, { $addToSet: { fieldsFollowed: fieldId } });
  await Field.findByIdAndUpdate(fieldId, { $inc: { followersCount: 1 } });

  res.json({
    success: true,
    message: `You are now following the ${field.name} field`
  });
});

// @desc    Unfollow a field
// @route   POST /api/fields/:id/unfollow
// @access  Private
export const unfollowField = asyncHandler(async (req, res, next) => {
  const fieldId = req.params.id;
  const userId = req.user.id;

  const field = await Field.findById(fieldId);
  if (!field) {
    return next(new ErrorResponse('Field not found', 404));
  }

  const user = await User.findById(userId);
  if (!user.fieldsFollowed || !user.fieldsFollowed.includes(fieldId)) {
    return next(new ErrorResponse('You are not following this field', 400));
  }

  // Remove from user and decrement field count
  await User.findByIdAndUpdate(userId, { $pull: { fieldsFollowed: fieldId } });
  await Field.findByIdAndUpdate(fieldId, { $inc: { followersCount: -1 } });

  res.json({
    success: true,
    message: `You unfollowed the ${field.name} field`
  });
});

// @desc    Get roadmaps for a field
// @route   GET /api/fields/:id/roadmaps
// @access  Public
export const getFieldRoadmaps = asyncHandler(async (req, res, next) => {
  const roadmaps = await Roadmap.find({ field: req.params.id });

  res.json({
    success: true,
    count: roadmaps.length,
    data: roadmaps
  });
});
