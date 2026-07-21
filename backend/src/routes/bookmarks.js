import express from 'express';
import { 
  getBookmarks, createCollection, addPostToCollection, 
  removePostFromCollection, deleteCollection 
} from '../controllers/bookmarkController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All bookmark routes require authorization

router.route('/')
  .get(getBookmarks)
  .post(createCollection);

router.route('/:id')
  .delete(deleteCollection);

router.route('/:id/posts')
  .post(addPostToCollection);

router.route('/:id/posts/:postId')
  .delete(removePostFromCollection);

export default router;
