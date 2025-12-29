import express from "express";
import { payWithMpesa } from "../controllers/mpesaController.js";
import { allowRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/pay", protect, allowRoles("STAFF"), payWithMpesa);

export default router;
