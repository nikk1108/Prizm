import express from 'express';
import { searchEverything, searchPosts, searchUsers } from '../services/searchService.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// @desc    Search everything
// @route   GET /api/search
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const query = req.query.q || '';
  const limit = parseInt(req.query.limit, 10) || 5;

  const results = await searchEverything(query, {}, { limit });

  res.json({
    success: true,
    data: results
  });
}));

// @desc    Search posts specifically
// @route   GET /api/search/posts
// @access  Public
router.get('/posts', asyncHandler(async (req, res) => {
  const query = req.query.q || '';
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const { type, field } = req.query;

  const results = await searchPosts(query, { type, field }, { page, limit });

  res.json({
    success: true,
    data: results
  });
}));

export default router;
