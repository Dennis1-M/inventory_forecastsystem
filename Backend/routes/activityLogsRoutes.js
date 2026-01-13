import express from 'express';
import { createActivityLog, getActivityLogs } from '../controllers/activityLogsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all activity logs - only admins
router.get('/', allowRoles('ADMIN', 'SUPERADMIN', 'MANAGER'), getActivityLogs);

// Create activity log - all authenticated users can log their activities
router.post('/', createActivityLog);

export default router;
