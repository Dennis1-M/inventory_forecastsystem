import express from "express";
import { processSync } from "../controllers/syncController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Accept queued operations from offline clients. Protected route recommended.
router.post("/", protect, processSync);

export default router;
