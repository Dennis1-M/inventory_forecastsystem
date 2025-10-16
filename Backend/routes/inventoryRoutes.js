// routes/inventoryRoutes.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const prisma = new PrismaClient();
const router = express.Router();

// 🧱 Protect routes & allow ADMIN only
router.use(verifyToken);
router.use(allowRoles("ADMIN"));

// 🟢 Get all inventory records
router.get("/", async (req, res) => {
  try {
    const inventory = await prisma.inventory.findMany({
      include: { product: true, user: true },
    });
    res.json(inventory);
  } catch (error) {
    console.error("❌ Error fetching inventory:", error);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

// 🟡 Create new inventory record
router.post("/", async (req, res) => {
  try {
    const { name, description, quantity, price, productId } = req.body;
    const userId = req.user.id; // From JWT

    if (!name || !quantity || !price || !productId) {
      return res.status(400).json({
        error: "name, quantity, price, and productId are required",
      });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if inventory already exists for this product
    const existingInventory = await prisma.inventory.findUnique({
      where: { productId: Number(productId) },
    });

    if (existingInventory) {
      return res
        .status(400)
        .json({ error: "Inventory already exists for this product" });
    }

    // Create inventory record
    const newInventory = await prisma.inventory.create({
      data: {
        name,
        description,
        quantity: Number(quantity),
        price: Number(price),
        productId: Number(productId),
        userId,
      },
    });

    res.status(201).json(newInventory);
  } catch (error) {
    console.error("❌ Error creating inventory:", error);
    res.status(500).json({ error: "Failed to create inventory" });
  }
});

// 🟣 Update inventory
router.put("/:id", async (req, res) => {
  try {
    const { quantity, price, description } = req.body;
    const { id } = req.params;

    const updated = await prisma.inventory.update({
      where: { id: Number(id) },
      data: { quantity: Number(quantity), price: Number(price), description },
    });

    res.json(updated);
  } catch (error) {
    console.error("❌ Error updating inventory:", error);
    res.status(500).json({ error: "Failed to update inventory" });
  }
});

// 🔴 Delete inventory
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.inventory.delete({ where: { id: Number(id) } });
    res.json({ message: "Inventory deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting inventory:", error);
    res.status(500).json({ error: "Failed to delete inventory" });
  }
});

export default router;
// routes/inventoryRoutes.js