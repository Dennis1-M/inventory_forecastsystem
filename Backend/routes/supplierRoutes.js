import express from "express";
import {
  createSupplier,
  deleteSupplier,
  getSupplierById,
  getSuppliers,
  updateSupplier,
} from "../controllers/supplierController.js";

const router = express.Router();

router.post("/", createSupplier);
router.get("/", getSuppliers);
router.get("/:id", getSupplierById);
router.put("/:id", updateSupplier);
router.delete("/:id", deleteSupplier);

export default router;
