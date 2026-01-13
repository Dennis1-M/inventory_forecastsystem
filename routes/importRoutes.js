import express from 'express';
import multer from 'multer';
import { importData } from '../controllers/importController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Only SUPERADMIN can import data
router.post('/import', protect, authorize('SUPERADMIN'), upload.single('file'), importData);

export default router;
