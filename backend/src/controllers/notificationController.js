import Notification from '../models/Notification.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ recipient: req.user.id })
    .populate('sender', 'name profilePicture reputation verificationBadge')
    .populate('post', 'title slug')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments({ recipient: req.user.id });

  res.json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: notifications
  });
});

// @desc    Mark notifications as read
// @route   PUT /api/notifications/read
// @access  Private
export const markRead = asyncHandler(async (req, res, next) => {
  const { ids } = req.body; // Expects an array of notification IDs or a single ID

  if (ids && Array.isArray(ids)) {
    await Notification.updateMany(
      { _id: { $in: ids }, recipient: req.user.id },
      { isRead: true }
    );
  } else if (ids) {
    await Notification.findOneAndUpdate(
      { _id: ids, recipient: req.user.id },
      { isRead: true }
    );
  } else {
    // Mark ALL as read if no ID provided
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true }
    );
  }

  res.json({
    success: true,
    message: 'Notifications updated to read state'
  });
});
