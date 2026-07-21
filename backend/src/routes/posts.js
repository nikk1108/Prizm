import express from 'express';
import { 
  createPost, getPosts, getPostDetail, deletePost, upvotePost, updatePost, duplicatePost, reportPost
} from '../controllers/postController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, createPost)
  .get(getPosts);

router.route('/:slug')
  .get(getPostDetail);

router.route('/:id')
  .put(protect, updatePost)
  .delete(protect, deletePost);

router.post('/:id/upvote', protect, upvotePost);
router.post('/:id/duplicate', protect, duplicatePost);
router.post('/:id/report', protect, reportPost);

export default router;
