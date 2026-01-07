import express from 'express';
import { createActivityLog, getActivityLogs } from '../controllers/activityLogsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Only admins can view activity logs
router.use(allowRoles('ADMIN', 'SUPERADMIN'));

// Get all activity logs
router.get('/', getActivityLogs);

// Create activity log
router.post('/', createActivityLog);

export default router;
