import express from 'express';
import { exportAdminReport, exportManagerReport } from '../controllers/reportsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Manager-level report export
router.post(
  '/manager-export',
  allowRoles('MANAGER', 'ADMIN', 'SUPERADMIN'),
  exportManagerReport
);

// Admin-level report export
router.post(
  '/admin-export',
  allowRoles('ADMIN', 'SUPERADMIN'),
  exportAdminReport
);

// Alias for backward compatibility
router.post(
  '/export',
  allowRoles('MANAGER', 'ADMIN', 'SUPERADMIN'),
  exportManagerReport
);

export default router;
