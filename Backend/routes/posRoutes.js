import express from "express";
import { checkoutPOS } from "../controllers/posController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only STAFF can checkout
router.post("/checkout", protect, authorize("STAFF"), checkoutPOS);

export default router;
