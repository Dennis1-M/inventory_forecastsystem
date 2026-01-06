import express from 'express';
import { getHealthStatus } from '../controllers/healthController.js';
import { protect } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', protect, allowRoles('ADMIN', 'SUPERADMIN'), getHealthStatus);

export default router;
