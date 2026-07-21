import express from 'express';
import { getRoadmapDetail, getRoadmapProgress, toggleStepProgress } from '../controllers/roadmapController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/:slug', getRoadmapDetail);
router.get('/:id/progress', protect, getRoadmapProgress);
router.post('/:id/steps/:stepId/toggle', protect, toggleStepProgress);

export default router;
