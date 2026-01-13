// Backend/routes/adminDataRoutes.js
import express from 'express';
import { clearDataByType } from '../controllers/adminDataController.js';
import { protect } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Only SUPERADMIN can clear data
router.delete('/clear/:dataType', protect, allowRoles('SUPERADMIN'), clearDataByType);

export default router;
