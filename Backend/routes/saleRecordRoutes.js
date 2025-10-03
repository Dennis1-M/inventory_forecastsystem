import express from "express";
import {
  getSales,
  createSale,
} from "../controllers/saleRecordController.js";

const router = express.Router();

router.get("/", getSales);
router.post("/", createSale);

export default router;
