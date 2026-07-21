import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import Reaction from '../models/Reaction.js';
import Notification from '../models/Notification.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { adjustReputation } from '../services/reputationService.js';
import { sendRealTimeNotification } from '../config/socket.js';

// @desc    Create a comment or reply
// @route   POST /api/comments
// @access  Private
export const createComment = asyncHandler(async (req, res, next) => {
  const { postId, content, parentCommentId } = req.body;
  const userId = req.user.id;

  const post = await Post.findById(postId);
  if (!post) {
    return next(new ErrorResponse('Post not found', 404));
  }

  // Build comment
  const commentData = {
    post: postId,
    author: userId,
    content
  };

  if (parentCommentId) {
    const parentComment = await Comment.findById(parentCommentId);
    if (!parentComment) {
      return next(new ErrorResponse('Parent comment not found', 404));
    }
    commentData.parentComment = parentCommentId;
  }

  const comment = await Comment.create(commentData);

  // Populate comment details for response
  const populatedComment = await comment.populate('author', 'name profilePicture reputation verificationBadge');

  // Trigger Notifications
  if (parentCommentId) {
    // Notify parent comment author (if it's a reply)
    const parent = await Comment.findById(parentCommentId);
    if (parent.author.toString() !== userId) {
      const notification = await Notification.create({
        recipient: parent.author,
        sender: userId,
        type: 'reply',
        post: postId,
        comment: comment._id
      });
      const populatedNotif = await notification.populate('sender', 'name profilePicture');
      sendRealTimeNotification(parent.author, populatedNotif);
    }
  } else {
    // Notify post author (if it's a comment)
    if (post.author.toString() !== userId) {
      const notification = await Notification.create({
        recipient: post.author,
        sender: userId,
        type: 'comment',
        post: postId,
        comment: comment._id
      });
      const populatedNotif = await notification.populate('sender', 'name profilePicture');
      sendRealTimeNotification(post.author, populatedNotif);
    }
  }

  res.status(201).json({
    success: true,
    data: populatedComment
  });
});

// @desc    Get comments for a Post
// @route   GET /api/posts/:postId/comments
// @access  Public
export const getPostComments = asyncHandler(async (req, res, next) => {
  const comments = await Comment.find({ post: req.params.postId })
    .populate('author', 'name profilePicture reputation verificationBadge')
    .sort({ createdAt: 1 });

  res.json({
    success: true,
    count: comments.length,
    data: comments
  });
});

// @desc    Toggle Comment Upvote
// @route   POST /api/comments/:id/upvote
// @access  Private
export const upvoteComment = asyncHandler(async (req, res, next) => {
  const commentId = req.params.id;
  const userId = req.user.id;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return next(new ErrorResponse('Comment not found', 404));
  }

  const existingReaction = await Reaction.findOne({
    userId,
    targetId: commentId,
    targetType: 'comment'
  });

  if (existingReaction) {
    await Reaction.findByIdAndDelete(existingReaction._id);
    comment.upvotesCount = Math.max(0, comment.upvotesCount - 1);
    await comment.save();

    await adjustReputation(comment.author, -2, 'comment_upvote', commentId, 'comment');

    res.json({
      success: true,
      upvoted: false,
      upvotesCount: comment.upvotesCount
    });
  } else {
    await Reaction.create({
      userId,
      targetId: commentId,
      targetType: 'comment',
      type: 'upvote'
    });

    comment.upvotesCount += 1;
    await comment.save();

    await adjustReputation(comment.author, 2, 'comment_upvote', commentId, 'comment');

    res.json({
      success: true,
      upvoted: true,
      upvotesCount: comment.upvotesCount
    });
  }
});

// @desc    Mark a comment as solution (Accepted answer for Q&As)
// @route   PUT /api/comments/:id/solution
// @access  Private
export const markSolution = asyncHandler(async (req, res, next) => {
  const commentId = req.params.id;

  const comment = await Comment.findById(commentId).populate('post');
  if (!comment) {
    return next(new ErrorResponse('Comment not found', 404));
  }

  const post = comment.post;

  // Verify requester is the author of the post
  if (post.author.toString() !== req.user.id) {
    return next(new ErrorResponse('Only the post author can mark a solution', 401));
  }

  if (post.type !== 'question') {
    return next(new ErrorResponse('Solutions can only be marked on Question post types', 400));
  }

  // Clear existing solution mark on other comments of this post
  await Comment.updateMany({ post: post._id }, { isSolution: false });

  // Mark this comment as solution
  comment.isSolution = true;
  await comment.save();

  // Award reputation (+15 reputation for helping out)
  await adjustReputation(comment.author, 15, 'answer_accepted', commentId, 'comment');

  res.json({
    success: true,
    data: comment
  });
});
