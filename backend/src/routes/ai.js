import express from 'express';
import { summarizePost, summarizeResearch, explainTopic, recommendPosts } from '../services/aiService.js';
import { protect } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// Summarize general post
router.get('/post/:id/summarize', protect, asyncHandler(async (req, res) => {
  const result = await summarizePost(req.params.id);
  res.json({ success: true, data: result });
}));

// Summarize academic paper
router.get('/research/:id/summarize', protect, asyncHandler(async (req, res) => {
  const result = await summarizeResearch(req.params.id);
  res.json({ success: true, data: result });
}));

// AI context explainer
router.get('/explain', protect, asyncHandler(async (req, res) => {
  const topic = req.query.topic || 'General Science';
  const result = await explainTopic(topic);
  res.json({ success: true, data: result });
}));

// AI personalized post feed recommendations
router.get('/recommendations', protect, asyncHandler(async (req, res) => {
  const result = await recommendPosts(req.user.id);
  res.json({ success: true, data: result });
}));

export default router;
