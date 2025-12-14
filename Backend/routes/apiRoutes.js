// routes/apiRoutes.js
import { Router } from "express";
import { admin } from "../middleware/admin.js";
import { protect } from "../middleware/authMiddleware.js";

// Category controllers
import { createCategory, deleteCategory, getCategories, getCategoryById, updateCategory } from "../controllers/categoryController.js";
// Supplier controllers
import { createSupplier, deleteSupplier, getSupplierById, getSupplierDashboard, getSuppliers, updateSupplier } from "../controllers/supplierController.js";
// Product controllers
import { createProduct, deleteProduct, getLowStockProducts, getProductById, getProducts, updateProduct } from "../controllers/productController.js";
// Sales controllers
import { createSale, deleteSale, getSaleById, getSales, updateSale } from "../controllers/saleController.js";
// Inventory controllers
import { adjustStock, getInventoryMovements, getLowStockAlerts, receiveStock } from "../controllers/inventoryController.js";
// User controllers
import { deleteUser, getUserById, getUsers, updateUser } from "../controllers/userController.js";
// Forecast controllers
import { generateForecast } from "../controllers/forecastingController.js";
// Alert controllers
import { getUnreadAlerts, markAlertAsRead, resolveAlert } from "../controllers/alertController.js";

const router = Router();

/* USER MANAGEMENT (ADMIN ONLY) */
router.get("/users", protect, admin, getUsers);
router.route("/users/:id")
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

/* CATEGORY ROUTES */
router.route("/categories")
  .get(protect, getCategories)
  .post(protect, admin, createCategory);

router.route("/categories/:id")
  .get(protect, getCategoryById)
  .put(protect, admin, updateCategory)
  .delete(protect, admin, deleteCategory);

/* SUPPLIER ROUTES */
router.route("/suppliers")
  .get(protect, getSuppliers)
  .post(protect, admin, createSupplier);

router.route("/suppliers/:id")
  .get(protect, getSupplierById)
  .put(protect, admin, updateSupplier)
  .delete(protect, admin, deleteSupplier);

router.get("/suppliers/:id/dashboard", protect, admin, getSupplierDashboard);

/* PRODUCT ROUTES */
router.route("/products")
  .get(protect, getProducts)
  .post(protect, admin, createProduct);

router.get("/products/low-stock", protect, getLowStockProducts);

router.route("/products/:id")
  .get(protect, getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

/* SALES ROUTES */
router.route("/sales")
  .get(protect, getSales)
  .post(protect, createSale);

router.route("/sales/:id")
  .get(protect, getSaleById)
  .put(protect, updateSale)
  .delete(protect, deleteSale);

/* INVENTORY ROUTES */
router.get("/inventory/movements", protect, getInventoryMovements);
router.post("/inventory/receive", protect, receiveStock);
router.post("/inventory/adjust", protect, adjustStock);
router.get("/inventory/low-stock", protect, getLowStockAlerts);

/* FORECAST */
router.post("/forecast", protect, generateForecast);

/* ALERTS */
router.get("/alerts/unread", protect, getUnreadAlerts);
router.put("/alerts/:id/read", protect, markAlertAsRead);
router.put("/alerts/:id/resolve", protect, resolveAlert);

export default router;
