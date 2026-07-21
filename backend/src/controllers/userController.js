import User from '../models/User.js';
import Follow from '../models/Follow.js';
import ReputationHistory from '../models/ReputationHistory.js';
import Notification from '../models/Notification.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendRealTimeNotification } from '../config/socket.js';

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public
export const getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user || user.status === 'suspended') {
    return next(new ErrorResponse('User profile not found', 404));
  }

  // Count followers and following
  const followersCount = await Follow.countDocuments({ followingId: user._id });
  const followingCount = await Follow.countDocuments({ followerId: user._id });

  res.json({
    success: true,
    data: {
      user,
      followersCount,
      followingCount
    }
  });
});

// @desc    Update user profile details
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    bio: req.body.bio,
    university: req.body.university,
    profession: req.body.profession,
    skills: req.body.skills,
    interests: req.body.interests,
    profilePicture: req.body.profilePicture,
    coverImage: req.body.coverImage
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(
    key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.json({
    success: true,
    data: user
  });
});

// @desc    Follow a user
// @route   POST /api/users/:id/follow
// @access  Private
export const followUser = asyncHandler(async (req, res, next) => {
  const followingId = req.params.id;
  const followerId = req.user.id;

  if (followingId === followerId.toString()) {
    return next(new ErrorResponse('You cannot follow yourself', 400));
  }

  const targetUser = await User.findById(followingId);
  if (!targetUser) {
    return next(new ErrorResponse('User to follow not found', 404));
  }

  // Check if already following
  const alreadyFollows = await Follow.findOne({ followerId, followingId });
  if (alreadyFollows) {
    return next(new ErrorResponse('You are already following this user', 400));
  }

  await Follow.create({ followerId, followingId });

  // Create real-time notification
  const notification = await Notification.create({
    recipient: followingId,
    sender: followerId,
    type: 'follow'
  });

  // Populate notification details to send via socket
  const populatedNotif = await notification.populate('sender', 'name profilePicture');
  sendRealTimeNotification(followingId, populatedNotif);

  res.json({
    success: true,
    message: `You are now following ${targetUser.name}`
  });
});

// @desc    Unfollow a user
// @route   POST /api/users/:id/unfollow
// @access  Private
export const unfollowUser = asyncHandler(async (req, res, next) => {
  const followingId = req.params.id;
  const followerId = req.user.id;

  const followRelation = await Follow.findOneAndDelete({ followerId, followingId });

  if (!followRelation) {
    return next(new ErrorResponse('You are not following this user', 400));
  }

  res.json({
    success: true,
    message: 'User unfollowed successfully'
  });
});

// @desc    Get user followers
// @route   GET /api/users/:id/followers
// @access  Public
export const getUserFollowers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const relations = await Follow.find({ followingId: req.params.id })
    .skip(skip)
    .limit(limit)
    .populate('followerId', 'name profilePicture bio reputation verificationBadge');

  const total = await Follow.countDocuments({ followingId: req.params.id });

  res.json({
    success: true,
    count: relations.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: relations.map(r => r.followerId)
  });
});

// @desc    Get users that target user is following
// @route   GET /api/users/:id/following
// @access  Public
export const getUserFollowing = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const relations = await Follow.find({ followerId: req.params.id })
    .skip(skip)
    .limit(limit)
    .populate('followingId', 'name profilePicture bio reputation verificationBadge');

  const total = await Follow.countDocuments({ followerId: req.params.id });

  res.json({
    success: true,
    count: relations.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: relations.map(r => r.followingId)
  });
});

// @desc    Get user reputation logs
// @route   GET /api/users/:id/reputation
// @access  Public
export const getReputationHistory = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const history = await ReputationHistory.find({ userId: req.params.id })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await ReputationHistory.countDocuments({ userId: req.params.id });

  res.json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: history
  });
});
