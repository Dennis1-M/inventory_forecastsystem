import { PrismaClient } from "@prisma/client";
import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();
const prisma = new PrismaClient();

// 🟢 GET all products
router.get("/", async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// 🟢 POST create product (Protected)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, description, stock } = req.body;
    const product = await prisma.product.create({
      data: { name, description, stock },
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to create product" });
  }
});

export default router;
// - --- IGNORE ---
// End of recent edits