import express from 'express';
import { exportInventory, exportProducts, exportSales } from '../controllers/exportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/sales', protect, allowRoles('ADMIN', 'SUPERADMIN', 'MANAGER'), exportSales);
router.get('/inventory', protect, allowRoles('ADMIN', 'SUPERADMIN', 'MANAGER'), exportInventory);
router.get('/products', protect, allowRoles('ADMIN', 'SUPERADMIN', 'MANAGER'), exportProducts);

export default router;
