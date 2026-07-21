import express from 'express';
import { getNotifications, markRead } from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All notifications routes require authorization

router.get('/', getNotifications);
router.put('/read', markRead);

export default router;
