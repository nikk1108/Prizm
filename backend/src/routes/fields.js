import express from 'express';
import { 
  getFields, getFieldDetail, createField, followField, unfollowField, getFieldRoadmaps 
} from '../controllers/fieldController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/admin.js';

const router = express.Router();

router.get('/', getFields);
router.post('/', protect, createField);
router.get('/:slug', getFieldDetail);
router.post('/:id/follow', protect, followField);
router.post('/:id/unfollow', protect, unfollowField);
router.get('/:id/roadmaps', getFieldRoadmaps);

export default router;
