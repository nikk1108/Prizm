import express from 'express';
import { 
  getUserModerationList, toggleUserStatus, getReportQueue, 
  resolveReport, approveResearchPaper, getAnalyticsMetrics,
  renameField, deleteField, mergeFields
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/admin.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'moderator')); // Require admin/moderator credentials

router.get('/users', getUserModerationList);
router.put('/users/:id/status', toggleUserStatus);
router.get('/reports', getReportQueue);
router.put('/reports/:id/resolve', resolveReport);
router.put('/research/:id/approve', approveResearchPaper);
router.get('/metrics', getAnalyticsMetrics);

// Field Management
router.put('/fields/:id', renameField);
router.delete('/fields/:id', deleteField);
router.post('/fields/merge', mergeFields);

export default router;
