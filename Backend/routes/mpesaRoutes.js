import express from "express";
import { payWithMpesa } from "../controllers/mpesaController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/pay", protect, authorize("STAFF"), payWithMpesa);

export default router;
