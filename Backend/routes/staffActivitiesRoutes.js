import express from 'express';
import { getStaffActivities, getStaffMemberActivities } from '../controllers/staffActivitiesController.js';
import { protect } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Managers and admins can view staff activities
router.use(allowRoles('MANAGER', 'ADMIN', 'SUPERADMIN'));

// Get all staff activities
router.get('/', getStaffActivities);

// Get specific staff member activities
router.get('/:staffId', getStaffMemberActivities);

export default router;
