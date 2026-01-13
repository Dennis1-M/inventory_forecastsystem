// routes/analyticsRoutes.js
import express from 'express';
import {
    downloadFullReport,
    getABCAnalysis,
    getCostOptimization,
    getDeadStock,
    getDemandCorrelation,
    getExecutiveSummary,
    getForecastPerformance,
    getInventoryHealth,
    getInventoryTurnover,
    getReorderOptimization,
    getScenarioPlanning,
    getSeasonalTrends,
    getSmartAlerts,
    getStockOutRisk,
    getSupplierPerformance,
    getSupplyChainRisk
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes require authentication and manager/admin role
router.use(protect);
router.use(allowRoles('MANAGER', 'ADMIN', 'SUPERADMIN'));

// Analytics endpoints
router.get('/inventory-health', getInventoryHealth);
router.get('/stock-out-risk', getStockOutRisk);
router.get('/abc-analysis', getABCAnalysis);
router.get('/dead-stock', getDeadStock);
router.get('/inventory-turnover', getInventoryTurnover);
router.get('/supplier-performance', getSupplierPerformance);
router.get('/forecast-performance', getForecastPerformance);
router.get('/reorder-optimization', getReorderOptimization);
router.get('/seasonal-trends', getSeasonalTrends);
router.get('/cost-optimization', getCostOptimization);
router.get('/supply-chain-risk', getSupplyChainRisk);
router.get('/smart-alerts', getSmartAlerts);
router.get('/scenario-planning', getScenarioPlanning);
router.get('/demand-correlation', getDemandCorrelation);
router.get('/executive-summary', getExecutiveSummary);
router.get('/download-report', downloadFullReport);

export default router;

