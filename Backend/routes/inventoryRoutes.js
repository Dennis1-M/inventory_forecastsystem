import { PrismaClient } from "@prisma/client";
import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";


const router = express.Router();
const prisma = new PrismaClient();


// 👮 Protect + allow ADMIN only
router.use(verifyToken);
router.use(allowRoles("ADMIN"));



// 🟢 Get all inventory records
router.get("/", async (req, res) => {
  try {
    const inventory = await prisma.inventory.findMany({
      include: { product: true },
    });
    res.json(inventory);
  } catch (error) {
    console.error("❌ Error fetching inventory:", error);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

// 🟡 Update product inventory (increase/decrease stock)
router.put("/update", async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({ error: "productId and quantity required" });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if inventory exists
    const existingInventory = await prisma.inventory.findUnique({
      where: { productId },
    });

    if (!existingInventory) {
      return res.status(404).json({ error: "Inventory record not found for product" });
    }

    // Update inventory quantity
    const updatedInventory = await prisma.inventory.update({
      where: { productId },
      data: { quantity },
    });

    res.json(updatedInventory);
  } catch (error) {
    console.error("❌ Error updating inventory:", error);
    res.status(500).json({ error: "Failed to update inventory" });
  }
});

// 🟢 Create inventory for a new product
router.post("/", async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({ error: "productId and quantity required" });
    }

    // ✅ Check if the product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // ✅ Check if inventory already exists for this product
    const existingInventory = await prisma.inventory.findUnique({
      where: { productId },
    });

    if (existingInventory) {
      return res.status(400).json({ error: "Inventory already exists for this product" });
    }

    // ✅ Create new inventory record
    const newInventory = await prisma.inventory.create({
      data: { productId, quantity },
    });

    res.status(201).json(newInventory);
  } catch (error) {
    console.error("❌ Error creating inventory:", error);
    res.status(500).json({ error: "Failed to create inventory" });
  }
});

export default router;
// - --- IGNORE ---