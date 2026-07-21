import express from 'express';
import { 
  createComment, getPostComments, upvoteComment, markSolution 
} from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createComment);
router.get('/post/:postId', getPostComments);
router.post('/:id/upvote', protect, upvoteComment);
router.put('/:id/solution', protect, markSolution);

export default router;
