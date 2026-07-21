import crypto from 'crypto';
import Post from '../models/Post.js';
import Field from '../models/Field.js';
import Research from '../models/Research.js';
import Project from '../models/Project.js';
import Resource from '../models/Resource.js';
import Reaction from '../models/Reaction.js';
import Follow from '../models/Follow.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import Report from '../models/Report.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { adjustReputation } from '../services/reputationService.js';
import { sendRealTimeNotification } from '../config/socket.js';

// Helper to generate a unique slug
const generateSlug = (title) => {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  const hash = crypto.randomBytes(4).toString('hex');
  return `${base}-${hash}`;
};

// @desc    Create a Post
// @route   POST /api/posts
// @access  Private
export const createPost = asyncHandler(async (req, res, next) => {
  const { 
    type, title, content, fieldId, tags, visibility, status, sourceLinks, attachments, images,
    researchDetails, projectDetails, resourceDetails
  } = req.body;

  // Validate Field
  const field = await Field.findById(fieldId);
  if (!field) {
    return next(new ErrorResponse('Field category not found', 404));
  }

  let subDocId = null;

  // Handle Type-Specific Sub-documents
  if (type === 'research') {
    if (!researchDetails || !researchDetails.abstract) {
      return next(new ErrorResponse('Research abstract is required for research posts', 400));
    }
    const research = await Research.create(researchDetails);
    subDocId = research._id;
  } else if (type === 'project') {
    if (!projectDetails) {
      return next(new ErrorResponse('Project specification details are required', 400));
    }
    const project = await Project.create(projectDetails);
    subDocId = project._id;
  } else if (type === 'resource') {
    if (!resourceDetails || !resourceDetails.url || !resourceDetails.resourceType) {
      return next(new ErrorResponse('Resource link and type are required', 400));
    }
    const resource = await Resource.create(resourceDetails);
    subDocId = resource._id;
  }

  const slug = generateSlug(title);

  // Build base post object
  const postData = {
    type,
    title,
    slug,
    content,
    field: fieldId,
    tags: tags || [],
    visibility: visibility || 'public',
    status: status || 'published',
    sourceLinks: sourceLinks || [],
    attachments: attachments || [],
    images: images || [],
    author: req.user.id
  };

  // Assign foreign key references
  if (type === 'research') postData.researchDetails = subDocId;
  if (type === 'project') postData.projectDetails = subDocId;
  if (type === 'resource') postData.resourceDetails = subDocId;

  const post = await Post.create(postData);

  // Increment Field postsCount
  await Field.findByIdAndUpdate(fieldId, { $inc: { postsCount: 1 } });

  // Reward points to author for contribution
  await adjustReputation(req.user.id, 10, 'post_created', post._id, 'post');

  res.status(201).json({
    success: true,
    data: post
  });
});

// @desc    Get Posts (Filters + Cursor & Offset Pagination)
// @route   GET /api/posts
// @access  Public
export const getPosts = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const feedType = req.query.feedType || 'latest'; // latest, trending, following, recommended
  const { field, tag, type } = req.query;

  // Base Mongo Query
  const mongoQuery = { status: 'published' };

  // Filter out posts from shadow banned users (except if searching self)
  const shadowBannedUsers = await User.find({ status: 'shadow_banned' }).select('_id');
  const shadowBannedIds = shadowBannedUsers.map(u => u._id);
  
  if (shadowBannedIds.length > 0) {
    mongoQuery.author = { $nin: shadowBannedIds };
  }

  // Appends query filters
  if (field) mongoQuery.field = field;
  if (tag) mongoQuery.tags = tag;
  if (type) mongoQuery.type = type;

  let posts = [];
  let nextCursor = null;

  // Cursor Pagination for Latest/Following feeds
  if (feedType === 'latest') {
    if (req.query.cursor) {
      mongoQuery.createdAt = { $lt: new Date(req.query.cursor) };
    }

    posts = await Post.find(mongoQuery)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('author', 'name profilePicture reputation verificationBadge')
      .populate('field', 'name slug');

    if (posts.length === limit) {
      nextCursor = posts[posts.length - 1].createdAt;
    }
  } else if (feedType === 'following' && req.user) {
    // Fetch users current user is following
    const followingRelations = await Follow.find({ followerId: req.user.id });
    const followingIds = followingRelations.map(r => r.followingId);

    mongoQuery.author = { $in: followingIds };
    
    if (req.query.cursor) {
      mongoQuery.createdAt = { $lt: new Date(req.query.cursor) };
    }

    posts = await Post.find(mongoQuery)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('author', 'name profilePicture reputation verificationBadge')
      .populate('field', 'name slug');

    if (posts.length === limit) {
      nextCursor = posts[posts.length - 1].createdAt;
    }
  } else if (feedType === 'trending') {
    // Offset pagination for trending (hot ranking)
    const page = parseInt(req.query.page, 10) || 1;
    const skip = (page - 1) * limit;

    posts = await Post.find(mongoQuery)
      .sort({ upvotesCount: -1, viewsCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name profilePicture reputation verificationBadge')
      .populate('field', 'name slug');
  } else {
    // Recommended Feed fallback: Latest/Featured
    const page = parseInt(req.query.page, 10) || 1;
    const skip = (page - 1) * limit;

    posts = await Post.find(mongoQuery)
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name profilePicture reputation verificationBadge')
      .populate('field', 'name slug');
  }

  res.json({
    success: true,
    count: posts.length,
    nextCursor,
    data: posts
  });
});

// @desc    Get Post Detail by Slug
// @route   GET /api/posts/:slug
// @access  Public
export const getPostDetail = asyncHandler(async (req, res, next) => {
  const post = await Post.findOne({ slug: req.params.slug })
    .populate('author', 'name profilePicture bio reputation verificationBadge')
    .populate('field', 'name slug')
    .populate('researchDetails')
    .populate('projectDetails')
    .populate('resourceDetails');

  if (!post || (post.status !== 'published' && (!req.user || req.user.id !== post.author._id.toString()))) {
    return next(new ErrorResponse('Post not found', 404));
  }

  // Increment view counts
  post.viewsCount += 1;
  await post.save();

  res.json({
    success: true,
    data: post
  });
});

// @desc    Toggle Upvote Reaction
// @route   POST /api/posts/:id/upvote
// @access  Private
export const upvotePost = asyncHandler(async (req, res, next) => {
  const postId = req.params.id;
  const userId = req.user.id;

  const post = await Post.findById(postId);
  if (!post) {
    return next(new ErrorResponse('Post not found', 404));
  }

  const existingReaction = await Reaction.findOne({
    userId,
    targetId: postId,
    targetType: 'post'
  });

  if (existingReaction) {
    // Remove upvote reaction
    await Reaction.findByIdAndDelete(existingReaction._id);
    post.upvotesCount = Math.max(0, post.upvotesCount - 1);
    await post.save();

    // Deduct reputation from author
    await adjustReputation(post.author, -5, 'post_upvote', postId, 'post');

    res.json({
      success: true,
      upvoted: false,
      upvotesCount: post.upvotesCount
    });
  } else {
    // Add upvote reaction
    await Reaction.create({
      userId,
      targetId: postId,
      targetType: 'post',
      type: 'upvote'
    });

    post.upvotesCount += 1;
    await post.save();

    // Add reputation to author
    await adjustReputation(post.author, 5, 'post_upvote', postId, 'post');

    // Create Notification (if upvoted by someone else)
    if (post.author.toString() !== userId) {
      const notification = await Notification.create({
        recipient: post.author,
        sender: userId,
        type: 'like',
        post: postId
      });

      const populatedNotif = await notification.populate('sender', 'name profilePicture');
      sendRealTimeNotification(post.author, populatedNotif);
    }

    res.json({
      success: true,
      upvoted: true,
      upvotesCount: post.upvotesCount
    });
  }
});

// @desc    Delete Post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorResponse('Post not found', 404));
  }

  // Ensure author or admin
  if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this post', 401));
  }

  // Delete sub-document if exists
  if (post.type === 'research') {
    await Research.findByIdAndDelete(post.researchDetails);
  } else if (post.type === 'project') {
    await Project.findByIdAndDelete(post.projectDetails);
  } else if (post.type === 'resource') {
    await Resource.findByIdAndDelete(post.resourceDetails);
  }

  // Delete reactions
  await Reaction.deleteMany({ targetId: post._id, targetType: 'post' });

  // Delete post
  await Post.findByIdAndDelete(post._id);

  // Decrement field posts count
  await Field.findByIdAndUpdate(post.field, { $inc: { postsCount: -1 } });

  res.json({
    success: true,
    message: 'Post deleted successfully'
  });
});

// @desc    Update Post
// @route   PUT /api/posts/:id
// @access  Private
export const updatePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new ErrorResponse('Post not found', 404));
  }

  // Ensure author or admin
  if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this post', 401));
  }

  const { 
    title, content, fieldId, tags, status, sourceLinks, attachments, images,
    researchDetails, projectDetails, resourceDetails
  } = req.body;

  // Validate Field if changed
  if (fieldId) {
    const field = await Field.findById(fieldId);
    if (!field) {
      return next(new ErrorResponse('Field category not found', 404));
    }
    if (post.field.toString() !== fieldId) {
      // Decrement old, increment new
      await Field.findByIdAndUpdate(post.field, { $inc: { postsCount: -1 } });
      await Field.findByIdAndUpdate(fieldId, { $inc: { postsCount: 1 } });
      post.field = fieldId;
    }
  }

  if (title) {
    post.title = title;
    post.slug = generateSlug(title);
  }
  if (content) post.content = content;
  if (tags) post.tags = tags;
  if (status) post.status = status;
  if (sourceLinks) post.sourceLinks = sourceLinks;
  if (attachments) post.attachments = attachments;
  if (images) post.images = images;

  // Update sub-document if changed
  if (post.type === 'research' && researchDetails) {
    await Research.findByIdAndUpdate(post.researchDetails, researchDetails);
  } else if (post.type === 'project' && projectDetails) {
    await Project.findByIdAndUpdate(post.projectDetails, projectDetails);
  } else if (post.type === 'resource' && resourceDetails) {
    await Resource.findByIdAndUpdate(post.resourceDetails, resourceDetails);
  }

  await post.save();

  res.json({
    success: true,
    data: post
  });
});

// @desc    Duplicate Post as Draft
// @route   POST /api/posts/:id/duplicate
// @access  Private
export const duplicatePost = asyncHandler(async (req, res, next) => {
  const originalPost = await Post.findById(req.params.id);
  if (!originalPost) {
    return next(new ErrorResponse('Post not found', 404));
  }

  // Create new post copying properties but set status to draft
  const slug = generateSlug(`${originalPost.title} (Copy)`);

  // Handle sub-documents duplicate
  let subDocId = null;
  if (originalPost.type === 'research' && originalPost.researchDetails) {
    const originalResearch = await Research.findById(originalPost.researchDetails);
    if (originalResearch) {
      const researchCopy = await Research.create({
        abstract: originalResearch.abstract,
        doi: originalResearch.doi,
        publication: originalResearch.publication,
        institution: originalResearch.institution,
        authors: originalResearch.authors,
        pdfUrl: originalResearch.pdfUrl,
        githubRepo: originalResearch.githubRepo
      });
      subDocId = researchCopy._id;
    }
  } else if (originalPost.type === 'project' && originalPost.projectDetails) {
    const originalProject = await Project.findById(originalPost.projectDetails);
    if (originalProject) {
      const projectCopy = await Project.create({
        architecture: originalProject.architecture,
        difficulty: originalProject.difficulty,
        isOpenSourceContribution: originalProject.isOpenSourceContribution,
        demo: originalProject.demo,
        github: originalProject.github,
        installation: originalProject.installation,
        techStack: originalProject.techStack
      });
      subDocId = projectCopy._id;
    }
  } else if (originalPost.type === 'resource' && originalPost.resourceDetails) {
    const originalResource = await Resource.findById(originalPost.resourceDetails);
    if (originalResource) {
      const resourceCopy = await Resource.create({
        resourceType: originalResource.resourceType,
        url: originalResource.url,
        rating: originalResource.rating,
        description: originalResource.description
      });
      subDocId = resourceCopy._id;
    }
  }

  const postData = {
    type: originalPost.type,
    title: `${originalPost.title} (Copy)`,
    slug,
    content: originalPost.content,
    field: originalPost.field,
    tags: originalPost.tags,
    images: originalPost.images,
    attachments: originalPost.attachments,
    sourceLinks: originalPost.sourceLinks,
    status: 'draft',
    author: req.user.id
  };

  if (originalPost.type === 'research') postData.researchDetails = subDocId;
  if (originalPost.type === 'project') postData.projectDetails = subDocId;
  if (originalPost.type === 'resource') postData.resourceDetails = subDocId;

  const duplicate = await Post.create(postData);

  res.status(201).json({
    success: true,
    data: duplicate
  });
});

// @desc    Report a Post
// @route   POST /api/posts/:id/report
// @access  Private
export const reportPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new ErrorResponse('Post not found', 404));
  }

  const { reason } = req.body;
  if (!reason || !reason.trim()) {
    return next(new ErrorResponse('Please provide a reason for reporting', 400));
  }

  const report = await Report.create({
    reporter: req.user.id,
    contentId: post._id,
    contentType: 'post',
    reason: reason.trim()
  });

  res.status(201).json({
    success: true,
    data: report,
    message: 'Report submitted successfully'
  });
});
