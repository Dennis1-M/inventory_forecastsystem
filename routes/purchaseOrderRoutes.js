import express from 'express'
import { createPurchaseOrder, getPurchaseOrder, listPurchaseOrders, receivePurchaseOrder } from '../controllers/purchaseOrderController.js'
import { protect } from '../middleware/authMiddleware.js'
import { allowRoles } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.use(protect)
router.get('/', allowRoles('ADMIN','MANAGER','SUPERADMIN'), listPurchaseOrders)
router.post('/', allowRoles('ADMIN','MANAGER','SUPERADMIN'), createPurchaseOrder)
router.get('/:id', allowRoles('ADMIN','MANAGER','SUPERADMIN'), getPurchaseOrder)
router.post('/:id/receive', allowRoles('ADMIN','MANAGER','SUPERADMIN'), receivePurchaseOrder)

export default router
