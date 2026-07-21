import express from 'express';
import { 
  getUserProfile, updateProfile, followUser, unfollowUser, 
  getUserFollowers, getUserFollowing, getReputationHistory 
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.put('/profile', protect, updateProfile);
router.get('/:id', getUserProfile);
router.post('/:id/follow', protect, followUser);
router.post('/:id/unfollow', protect, unfollowUser);
router.get('/:id/followers', getUserFollowers);
router.get('/:id/following', getUserFollowing);
router.get('/:id/reputation', getReputationHistory);

export default router;
