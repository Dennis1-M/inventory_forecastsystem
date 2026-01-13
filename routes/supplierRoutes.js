import express from 'express';
import {
    createSupplier,
    deleteSupplier,
    getSupplierById,
    getSupplierDashboard,
    getSuppliers,
    updateSupplier
} from '../controllers/supplierController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All supplier routes require authentication
router.use(protect);

// Get all suppliers
router.get('/', getSuppliers);

// Create new supplier (admin only)
router.post('/', adminOnly, createSupplier);

// Get supplier by ID
router.get('/:id', getSupplierById);

// Get supplier dashboard (admin only)
router.get('/:id/dashboard', adminOnly, getSupplierDashboard);

// Update supplier (admin only)
router.put('/:id', adminOnly, updateSupplier);

// Delete supplier (admin only)
router.delete('/:id', adminOnly, deleteSupplier);

export default router;
