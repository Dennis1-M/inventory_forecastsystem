import express from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();
const prisma = new PrismaClient();

// 🟢 GET all products (Public)
router.get("/", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        sales: true,
        Alert: true,
      },
    });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// 🟣 GET single product by ID (Public)
router.get("/:id", async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(req.params.id) },
      include: { category: true, sales: true, Alert: true },
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// 🔵 CREATE product (Protected)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, description, stock, categoryId } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        stock: Number(stock),
        categoryId: categoryId ? Number(categoryId) : null,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// 🟠 UPDATE product (Protected)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { name, description, stock } = req.body;
    const { id } = req.params;

    const updated = await prisma.product.update({
      where: { id: Number(id) },
      data: { name, description, stock: Number(stock) },
    });

    res.json(updated);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// 🔴 DELETE product (Protected)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
