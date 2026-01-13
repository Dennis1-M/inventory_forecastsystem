import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', protect, allowRoles('ADMIN', 'SUPERADMIN'), getSettings);
router.post('/', protect, allowRoles('ADMIN', 'SUPERADMIN'), updateSettings);

export default router;
