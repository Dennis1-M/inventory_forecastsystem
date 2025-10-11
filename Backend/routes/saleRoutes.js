import { PrismaClient } from "@prisma/client";
import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";


const router = express.Router();
const prisma = new PrismaClient();

// 🧱 Protect all sales routes
router.use(verifyToken);

// 🟢 Get all sales
router.get("/", async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      include: { product: true },
    });
    res.json(sales);
  } catch (error) {
    console.error("❌ Error fetching sales:", error);
    res.status(500).json({ error: "Failed to fetch sales" });
  }
});

// 🟢 Create a sale record
router.post("/", allowRoles("ADMIN"), async (req, res) => {
  try {
    const { productId, quantity, totalPrice } = req.body;
    if (!productId || !quantity || !totalPrice) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Verify product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Check stock
    const inventory = await prisma.inventory.findUnique({ where: { productId } });
    if (!inventory || inventory.quantity < quantity) {
      return res.status(400).json({ error: "Insufficient stock" });
    }

    // Record sale
    const sale = await prisma.sale.create({
      data: { productId, quantity, totalPrice },
    });

    // Update inventory (reduce stock)
    await prisma.inventory.update({
      where: { productId },
      data: { quantity: inventory.quantity - quantity },
    });

    res.status(201).json({ message: "Sale recorded", sale });
  } catch (error) {
    console.error("❌ Error recording sale:", error);
    res.status(500).json({ error: "Failed to record sale" });
  }
});

export default router;
// - --- IGNORE ---