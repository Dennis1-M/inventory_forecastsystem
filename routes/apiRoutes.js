import { Router } from 'express';
import { admin } from '../middleware/admin.js';
import { protect } from '../middleware/auth.js';

// --- Import Controllers ---
import { getMe, login, register } from '../controllers/authController.js';
import { createCategory, deleteCategory, getCategories, getCategoryById, updateCategory } from '../controllers/categoryController.js';
import { generateForecast } from '../controllers/forecastingController.js'; // NEW
import { adjustStock, getInventoryMovements, getLowStockAlerts, receiveStock } from '../controllers/inventoryController.js';
import { createProduct, deleteProduct, getProductById, getProducts, updateProduct } from '../controllers/productController.js';
import { createSale, deleteSale, getSaleById, getSales, updateSale } from '../controllers/saleController.js';
import { createSupplier, deleteSupplier, getSupplierById, getSuppliers, updateSupplier } from '../controllers/supplierController.js';
import { deleteUser, getUserById, getUsers, updateUser } from '../controllers/userController.js';

const router = Router();

// --- 1. Authentication & Users (Public/Protected) ---

// Auth Routes (Public)
router.post('/auth/register', register); // Public registration
router.post('/auth/login', login); // Public login
router.get('/auth/me', protect, getMe); // Get current user details

// User Management Routes (Admin Only)
router.route('/users')
    .get(protect, admin, getUsers); // GET all users (Admin)

router.route('/users/:id')
    .get(protect, admin, getUserById) // GET user by ID (Admin)
    .put(protect, admin, updateUser) // UPDATE user (Admin)
    .delete(protect, admin, deleteUser); // DELETE user (Admin)


// --- 2. Product Catalog (Protected) ---

// Category Routes
router.route('/categories')
    .get(protect, getCategories) // GET all categories
    .post(protect, admin, createCategory); // CREATE category (Admin)

router.route('/categories/:id')
    .get(protect, getCategoryById)
    .put(protect, admin, updateCategory)
    .delete(protect, admin, deleteCategory);

// Supplier Routes
router.route('/suppliers')
    .get(protect, getSuppliers)
    .post(protect, admin, createSupplier);

router.route('/suppliers/:id')
    .get(protect, getSupplierById)
    .put(protect, admin, updateSupplier)
    .delete(protect, admin, deleteSupplier);

// Product Routes
router.route('/products')
    .get(protect, getProducts) // GET all products
    .post(protect, admin, createProduct); // CREATE product (Admin)

router.route('/products/:id')
    .get(protect, getProductById)
    .put(protect, admin, updateProduct)
    .delete(protect, admin, deleteProduct);


// --- 3. Sales & Transactions (Protected) ---

// Sale Routes
router.route('/sales')
    .get(protect, getSales) // GET all sales
    .post(protect, createSale); // CREATE a new sale (Staff/Manager/Admin)

router.route('/sales/:id')
    .get(protect, getSaleById)
    .put(protect, updateSale) // Update sale metadata (notes, date)
    .delete(protect, deleteSale); // Delete sale (reverses stock)


// --- 4. Inventory Management (Protected) ---

// Inventory Movements
router.route('/inventory/movements')
    .get(protect, getInventoryMovements); // GET audit log of movements

// Stock Operations
router.post('/inventory/receive', protect, receiveStock); // Record receipt of stock (IN)
router.post('/inventory/adjust', protect, adjustStock); // Record manual adjustment (IN/OUT)
router.get('/inventory/low-stock', protect, getLowStockAlerts); // Get low stock products


// --- 5. AI Forecasting (Protected) ---

router.post('/forecast', protect, generateForecast); // Generate sales forecast

export default router;