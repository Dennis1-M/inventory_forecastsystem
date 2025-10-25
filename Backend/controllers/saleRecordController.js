// controllers/salesController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getSales = async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({ include: { product: true }, orderBy: { createdAt: "desc" }});
    res.json(sales);
  } catch (err) {
    console.error("getSales:", err);
    res.status(500).json({ error: err.message });
  }
};

export const createSale = async (req, res) => {
  try {
    const { productId, quantity, totalPrice } = req.body;
    const p = await prisma.product.findUnique({ where: { id: Number(productId) }});
    if (!p) return res.status(404).json({ error: "Product not found" });

    // Use transaction to create sale and decrement product stock
    const sale = await prisma.$transaction(async (tx) => {
      const created = await tx.sale.create({ data: { productId: Number(productId), quantity: Number(quantity), totalPrice: Number(totalPrice) }});
      await tx.product.update({ where: { id: Number(productId) }, data: { stock: { decrement: Number(quantity) } }});
      return created;
    });

    res.status(201).json(sale);
  } catch (err) {
    console.error("createSale:", err);
    res.status(400).json({ error: err.message });
  }
};
