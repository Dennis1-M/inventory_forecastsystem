import { Router } from 'express';
import { admin } from '../middleware/admin.js';
import { protect } from '../middleware/auth.js';


import { getUnreadAlerts, markAlertAsRead, resolveAlert } from "../controllers/alertController.js";

// --- Auth Controllers ---
import { getMe, loginUser, registerUser } from '../controllers/authController.js';

// --- Category Controllers ---
import {
    createCategory,
    deleteCategory,
    getCategories,
    getCategoryById,
    updateCategory
} from '../controllers/categoryController.js';

// --- Supplier Controllers ---
import {
    createSupplier,
    deleteSupplier,
    getSupplierById,
    getSupplierDashboard,
    getSuppliers,
    updateSupplier
} from '../controllers/supplierController.js';

// --- Product Controllers ---
import {
    createProduct,
    deleteProduct,
    getLowStockProducts,
    getProductById,
    getProducts,
    updateProduct
} from '../controllers/productController.js';

// --- Sales Controllers ---
import {
    createSale,
    deleteSale,
    getSaleById,
    getSales,
    updateSale
} from '../controllers/saleController.js';

// --- Inventory Controllers ---
import {
    adjustStock,
    getInventoryMovements,
    getLowStockAlerts,
    receiveStock
} from '../controllers/inventoryController.js';

// --- Users (Admin) ---
import {
    deleteUser,
    getUserById,
    getUsers,
    updateUser
} from '../controllers/userController.js';

// --- AI Forecasting ---
import { generateForecast } from '../controllers/forecastingController.js';

const router = Router();

/* ============================================================
   AUTHENTICATION ROUTES (PUBLIC)
============================================================ */
router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);
router.get('/auth/me', protect, getMe);

/* ============================================================
   USER MANAGEMENT (ADMIN ONLY)
============================================================ */
router.route('/users')
    .get(protect, admin, getUsers);

router.route('/users/:id')
    .get(protect, admin, getUserById)
    .put(protect, admin, updateUser)
    .delete(protect, admin, deleteUser);

/* ============================================================
   CATEGORY ROUTES
============================================================ */
router.route('/categories')
    .get(protect, getCategories)
    .post(protect, admin, createCategory);

router.route('/categories/:id')
    .get(protect, getCategoryById)
    .put(protect, admin, updateCategory)
    .delete(protect, admin, deleteCategory);

/* ============================================================
   SUPPLIER ROUTES
============================================================ */
router.route('/suppliers')
    .get(protect, getSuppliers)
    .post(protect, admin, createSupplier);

router.route('/suppliers/:id')
    .get(protect, getSupplierById)
    .put(protect, admin, updateSupplier)
    .delete(protect, admin, deleteSupplier);

// ✅ Supplier Dashboard route
router.get('/suppliers/:id/dashboard', protect, admin, getSupplierDashboard);

/* ============================================================
   PRODUCT ROUTES
============================================================ */
router.route('/products')
    .get(protect, getProducts)
    .post(protect, admin, createProduct);

router.get('/products/low-stock', protect, getLowStockProducts);

router.route('/products/:id')
    .get(protect, getProductById)
    .put(protect, admin, updateProduct)
    .delete(protect, admin, deleteProduct);

/* ============================================================
   SALES ROUTES
============================================================ */
router.route('/sales')
    .get(protect, getSales)
    .post(protect, createSale);

router.route('/sales/:id')
    .get(protect, getSaleById)
    .put(protect, updateSale)
    .delete(protect, deleteSale);

/* ============================================================
   INVENTORY ROUTES
============================================================ */
router.get('/inventory/movements', protect, getInventoryMovements);
router.post('/inventory/receive', protect, receiveStock);
router.post('/inventory/adjust', protect, adjustStock);
router.get('/inventory/low-stock', protect, getLowStockAlerts);

/* ============================================================
   FORECASTING ROUTE
============================================================ */
router.post('/forecast', protect, generateForecast);


/* ============================================================
   ALERT ROUTES
============================================================ */
router.get("/unread", protect, getUnreadAlerts);
router.put("/:id/read", protect, markAlertAsRead);
router.put("/:id/resolve", protect, resolveAlert);

export default router;
