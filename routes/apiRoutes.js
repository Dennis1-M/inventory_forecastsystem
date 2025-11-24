import { Router } from 'express';
import { admin } from '../middleware/admin.js';
import { protect } from '../middleware/auth.js';

// --- Auth Controllers ---
import { registerUser, loginUser, getMe } from '../controllers/authController.js';

// --- Category Controllers ---
import { 
    getCategories, 
    getCategoryById, 
    createCategory, 
    updateCategory, 
    deleteCategory 
} from '../controllers/categoryController.js';

// --- Supplier Controllers ---
import { 
    getSuppliers, 
    getSupplierById, 
    createSupplier, 
    updateSupplier, 
    deleteSupplier,
    getSupplierDashboard
} from '../controllers/supplierController.js';

// --- Product Controllers ---
import { 
    getProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct 
} from '../controllers/productController.js';

// --- Sales Controllers ---
import { 
    getSales, 
    getSaleById, 
    createSale, 
    updateSale, 
    deleteSale 
} from '../controllers/saleController.js';

// --- Inventory Controllers ---
import { 
    getInventoryMovements, 
    receiveStock, 
    adjustStock, 
    getLowStockAlerts 
} from '../controllers/inventoryController.js';

// --- Users (Admin) ---
import { 
    getUsers, 
    getUserById, 
    updateUser, 
    deleteUser 
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

export default router;
