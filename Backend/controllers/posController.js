// backend/controllers/posController.js
// Controller to handle POS operations: checkout, sales recording, and stock updates

import prisma from "../config/prisma.js";

// --------------------------
// POST /api/pos/checkout
// --------------------------
export const checkoutPOS = async (req, res) => {
  try {
    const { items, paymentMethod } = req.body;
    const userId = req.user.id;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // 1️⃣ Calculate total amount
    const totalAmount = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    // 2️⃣ Create Sale
    const sale = await prisma.sale.create({
      data: {
        userId,
        totalAmount,
        paymentMethod,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // 3️⃣ Deduct stock & create InventoryMovements
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          currentStock: { decrement: item.quantity },
        },
      });

      await prisma.inventoryMovement.create({
        data: {
          type: "SALE",
          quantity: item.quantity,
          productId: item.productId,
          userId,
          description: `Sold via POS (Sale ID: ${sale.id})`,
        },
      });
    }

    // 4️⃣ Return sale + items (receipt data)
    res.status(201).json({
      saleId: sale.id,
      totalAmount: sale.totalAmount,
      paymentMethod: sale.paymentMethod,
      items: sale.items,
      createdAt: sale.createdAt,
    });
  } catch (err) {
    console.error("POS Checkout Error:", err);
    res.status(500).json({ error: "Failed to process checkout" });
  }
};
