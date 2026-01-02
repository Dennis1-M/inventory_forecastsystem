import colors from "colors";
import prisma from "../config/prisma.js";

const handlePrismaError = (res, error, operation) => {
  console.error(colors.red(`Prisma Error during ${operation}:`), error);
  return res
    .status(500)
    .json({ message: `Failed to ${operation} due to a server error.` });
};

// POST /api/sync → Accept queued sales from offline clients
export const processSync = async (req, res) => {
  const { sales } = req.body;

  if (!sales || !Array.isArray(sales) || sales.length === 0) {
    return res.status(400).json({ message: "sales array is required and cannot be empty." });
  }

  const results = [];

  for (const s of sales) {
    const items = (s.items || []).map((it) => ({
      productId: parseInt(it.productId, 10),
      quantity: parseInt(it.quantity, 10),
      unitPrice: parseFloat(it.unitPrice),
    }));

    // Basic validation
    if (!items.length) {
      results.push({ clientId: s.clientId, success: false, error: "items array required" });
      continue;
    }

    if (items.some((it) => Number.isNaN(it.productId) || Number.isNaN(it.quantity) || Number.isNaN(it.unitPrice) || it.quantity <= 0)) {
      results.push({ clientId: s.clientId, success: false, error: "invalid item format or quantities" });
      continue;
    }

    try {
      const saleResult = await prisma.$transaction(async (tx) => {
        const productIds = [...new Set(items.map((i) => i.productId))];
        const products = await tx.product.findMany({ where: { id: { in: productIds } } });

        if (products.length !== productIds.length) throw new Error("ProductNotFound");

        // Check availability
        for (const it of items) {
          const p = products.find((p) => p.id === it.productId);
          if (!p) throw new Error("ProductNotFound");
          if (p.currentStock < it.quantity) {
            const err = new Error("InsufficientStock");
            err.product = p;
            throw err;
          }
        }

        // Decrement stock
        for (const it of items) {
          await tx.product.update({ where: { id: it.productId }, data: { currentStock: { decrement: it.quantity } } });
        }

        const totalAmount = items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);

        const sale = await tx.sale.create({
          data: {
            totalAmount,
            paymentMethod: s.paymentMethod || "CASH",
            userId: req.user?.id || 1, // fallback to system user if auth not provided
            items: { create: items.map((it) => ({ productId: it.productId, quantity: it.quantity, unitPrice: it.unitPrice, total: it.quantity * it.unitPrice })) },
          },
          include: { items: true },
        });

        // Movements & alerts
        for (const it of items) {
          await tx.inventoryMovement.create({ data: { productId: it.productId, type: "SALE", quantity: -it.quantity, userId: req.user?.id || 1 } });

          const updated = await tx.product.findUnique({ where: { id: it.productId }, select: { name: true, currentStock: true, lowStockThreshold: true } });
          if (updated.lowStockThreshold !== null && updated.currentStock <= updated.lowStockThreshold) {
            await tx.alert.create({ data: { productId: it.productId, type: "LOW_STOCK", message: `Low stock for ${updated.name}. Current: ${updated.currentStock}` } });
          }
        }

        return { saleId: sale.id, items: sale.items };
      });

      results.push({ clientId: s.clientId, success: true, result: saleResult });
    } catch (error) {
      if (error.message === "ProductNotFound") {
        results.push({ clientId: s.clientId, success: false, error: "One or more products not found" });
        continue;
      }

      if (error.message === "InsufficientStock") {
        const p = error.product;
        results.push({ clientId: s.clientId, success: false, error: `Insufficient stock for ${p?.name || 'product'}. Available: ${p?.currentStock}` });
        continue;
      }

      console.error("Sync processing error:", error);
      results.push({ clientId: s.clientId, success: false, error: "server_error" });
    }
  }

  return res.status(200).json({ results });
};
