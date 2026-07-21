import Bookmark from '../models/Bookmark.js';
import Post from '../models/Post.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get user's bookmark collections
// @route   GET /api/bookmarks
// @access  Private
export const getBookmarks = asyncHandler(async (req, res, next) => {
  const collections = await Bookmark.find({ user: req.user.id })
    .populate('posts')
    .populate('parentCollection', 'name');

  res.json({
    success: true,
    data: collections
  });
});

// @desc    Create a new bookmark collection
// @route   POST /api/bookmarks
// @access  Private
export const createCollection = asyncHandler(async (req, res, next) => {
  const { name, parentCollectionId } = req.body;
  const userId = req.user.id;

  // Verify unique collection name per user under the same parent
  const existing = await Bookmark.findOne({
    user: userId,
    name,
    parentCollection: parentCollectionId || null
  });

  if (existing) {
    return next(new ErrorResponse('Collection name already exists in this folder', 400));
  }

  // Verify parent folder exists and is owned by the user (if supplied)
  if (parentCollectionId) {
    const parentFolder = await Bookmark.findOne({ _id: parentCollectionId, user: userId });
    if (!parentFolder) {
      return next(new ErrorResponse('Parent folder not found or unauthorized', 404));
    }
  }

  const collection = await Bookmark.create({
    user: userId,
    name,
    parentCollection: parentCollectionId || null,
    posts: []
  });

  res.status(201).json({
    success: true,
    data: collection
  });
});

// @desc    Add post to bookmark collection
// @route   POST /api/bookmarks/:id/posts
// @access  Private
export const addPostToCollection = asyncHandler(async (req, res, next) => {
  const collectionId = req.params.id;
  const { postId } = req.body;
  const userId = req.user.id;

  const collection = await Bookmark.findOne({ _id: collectionId, user: userId });
  if (!collection) {
    return next(new ErrorResponse('Bookmark collection not found', 404));
  }

  const post = await Post.findById(postId);
  if (!post) {
    return next(new ErrorResponse('Post not found', 404));
  }

  // Prevent duplicates
  if (collection.posts.includes(postId)) {
    return next(new ErrorResponse('Post already bookmarked in this collection', 400));
  }

  collection.posts.push(postId);
  await collection.save();

  // Increment Post bookmark counts
  await Post.findByIdAndUpdate(postId, { $inc: { bookmarksCount: 1 } });

  res.json({
    success: true,
    message: 'Post added to bookmark collection',
    data: collection
  });
});

// @desc    Remove post from bookmark collection
// @route   DELETE /api/bookmarks/:id/posts/:postId
// @access  Private
export const removePostFromCollection = asyncHandler(async (req, res, next) => {
  const collectionId = req.params.id;
  const { postId } = req.params;
  const userId = req.user.id;

  const collection = await Bookmark.findOne({ _id: collectionId, user: userId });
  if (!collection) {
    return next(new ErrorResponse('Bookmark collection not found', 404));
  }

  if (!collection.posts.includes(postId)) {
    return next(new ErrorResponse('Post is not in this collection', 400));
  }

  collection.posts = collection.posts.filter(id => id.toString() !== postId);
  await collection.save();

  // Decrement Post bookmark counts
  await Post.findByIdAndUpdate(postId, { $inc: { bookmarksCount: -1 } });

  res.json({
    success: true,
    message: 'Post removed from bookmark collection',
    data: collection
  });
});

// @desc    Delete bookmark collection
// @route   DELETE /api/bookmarks/:id
// @access  Private
export const deleteCollection = asyncHandler(async (req, res, next) => {
  const collectionId = req.params.id;
  const userId = req.user.id;

  const collection = await Bookmark.findOneAndDelete({ _id: collectionId, user: userId });
  if (!collection) {
    return next(new ErrorResponse('Bookmark collection not found', 404));
  }

  // Recursively point children folder nodes to root or delete them
  await Bookmark.updateMany(
    { parentCollection: collectionId, user: userId },
    { parentCollection: null }
  );

  res.json({
    success: true,
    message: 'Collection deleted successfully'
  });
});
