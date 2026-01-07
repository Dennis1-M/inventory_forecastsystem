// backend/controllers/inventoryController.js
import colors from "colors";
import prisma from "../config/prisma.js";
import { emitAlert, emitProductUpdate } from "../sockets/index.js";

/**
 * HELPERS
 */
async function createAlert(productId, type, message) {
  const alert = await prisma.alert.create({
    data: {
      ...(productId ? { product: { connect: { id: productId } } } : {}),
      type,
      message,
      isResolved: false,
    },
  });

  // Emit realtime alert
  try {
    emitAlert({ id: alert.id, productId: alert.productId, type: alert.type, message: alert.message, createdAt: alert.createdAt });
  } catch (e) {
    console.warn('Failed to emit alert via socket', e.message);
  }

  return alert;
}

/**
 * Generate alerts from a product object (used after stock changes)
 */
async function checkAndGenerateAlertsForProduct(product) {
  const { id, name, currentStock, lowStockThreshold } = product;

  // OUT OF STOCK
  if (currentStock <= 0) {
    await createAlert(id, "OUT_OF_STOCK", `${name} is OUT OF STOCK!`);
    return;
  }

  // LOW STOCK
  if (lowStockThreshold != null && currentStock <= lowStockThreshold) {
    await createAlert(id, "LOW_STOCK", `${name} is LOW on stock.`);
  }

  // OVERSTOCK (optional threshold; adjust as you like)
  if (currentStock >= 200) {
    await createAlert(id, "OVERSTOCK", `${name} is OVERSTOCKED (>${200} units).`);
  }
}

/**
 * STOCK IN / RECEIVING
 * POST /api/inventory/receive
 */
export const receiveStock = async (req, res) => {
  const { productId, quantity, costPrice, supplierId, notes } = req.body;

  if (!productId || quantity === undefined || Number(quantity) <= 0) {
    return res.status(400).json({ message: "productId and positive quantity are required." });
  }

  const pId = Number(productId);
  const qty = Number(quantity);

  try {
    const product = await prisma.product.findUnique({ where: { id: pId } });
    if (!product) return res.status(404).json({ message: "Product not found." });

    if (supplierId) {
      const supplier = await prisma.supplier.findUnique({ where: { id: Number(supplierId) } });
      if (!supplier) return res.status(400).json({ message: "Supplier not found." });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id: pId },
        data: { currentStock: { increment: qty } },
      });

      const movement = await tx.inventoryMovement.create({
        data: {
          productId: pId,
          type: "RECEIPT",
          quantity: qty,
          costPrice: costPrice ? Number(costPrice) : null,
          description: notes || `Received ${qty} units from supplier ${supplierId || "N/A"}`,
          userId: req.user?.id || 1,
          supplierId: supplierId ? Number(supplierId) : null,
        },
      });

      // RESOLVE out-of-stock alerts if stock is replenished
      if (updatedProduct.currentStock > 0) {
        await tx.alert.updateMany({
          where: { productId: pId, type: "OUT_OF_STOCK", isResolved: false },
          data: { isResolved: true },
        });
      }

      // Emit product update
      try { emitProductUpdate({ productId: updatedProduct.id, currentStock: updatedProduct.currentStock }); } catch (e) { console.warn('Emit product update failed', e.message); }

      // Generate new alerts after update (non-transactional helper allowed in tx)
      await checkAndGenerateAlertsForProduct(updatedProduct);

      return { updatedProduct, movement };
    });

    res.status(201).json({ message: "Stock received.", ...result });
  } catch (error) {
    console.error(colors.red("Error receiving stock:"), error);
    res.status(500).json({ message: "Failed to receive stock.", error: error.message });
  }
};

/**
 * MANUAL STOCK ADJUSTMENT
 * POST /api/inventory/adjust
 */
export const adjustStock = async (req, res) => {
  // Support two modes:
  // 1) legacy mode: { productId, type, quantity, notes }
  // 2) seed / convenience mode: { productId, newStock, reason }
  const { productId, type, quantity, notes, newStock, reason } = req.body;

  if (!productId) {
    return res.status(400).json({ message: "productId is required." });
  }

  const pId = Number(productId);

  // If newStock provided, compute delta and perform an adjustment
  if (newStock !== undefined) {
    const target = Number(newStock);
    if (Number.isNaN(target)) return res.status(400).json({ message: "newStock must be a number." });

    try {
      const result = await prisma.$transaction(async (tx) => {
        const p = await tx.product.findUnique({ where: { id: pId }, select: { currentStock: true, name: true } });
        if (!p) throw new Error("ProductNotFound");

        const delta = target - (p.currentStock || 0);
        if (delta === 0) return { updatedProduct: p, movement: null };

        const isIn = delta > 0;
        const updatedProduct = await tx.product.update({ where: { id: pId }, data: { currentStock: target } });

        const movement = await tx.inventoryMovement.create({
          data: {
            productId: pId,
            type: isIn ? "ADJUSTMENT_IN" : "ADJUSTMENT_OUT",
            quantity: isIn ? delta : -Math.abs(delta),
            description: reason || `Set stock to ${target}`,
            userId: req.user?.id || 1,
          },
        });

        if (updatedProduct.currentStock > 0) {
          await tx.alert.updateMany({ where: { productId: pId, type: "OUT_OF_STOCK", isResolved: false }, data: { isResolved: true } });
        }

        // Emit product update
        try { emitProductUpdate({ productId: updatedProduct.id, currentStock: updatedProduct.currentStock }); } catch (e) { console.warn('Emit product update failed', e.message); }

        await checkAndGenerateAlertsForProduct(updatedProduct);

        return { updatedProduct, movement };
      });

      return res.status(201).json({ message: "Stock adjusted.", ...result });
    } catch (error) {
      if (error.message === "ProductNotFound") return res.status(404).json({ message: "Product not found." });
      console.error(colors.red("Error adjusting stock (newStock mode):"), error);
      return res.status(500).json({ message: "Failed to adjust stock.", error: error.message });
    }
  }

  // Legacy mode: type + quantity
  if (!type || quantity === undefined || Number(quantity) <= 0) {
    return res.status(400).json({ message: "productId, type and positive quantity required." });
  }

  if (!["ADJUSTMENT_IN", "ADJUSTMENT_OUT"].includes(type)) {
    return res.status(400).json({ message: "Invalid adjustment type." });
  }

  const qty = Number(quantity);
  const isIn = type === "ADJUSTMENT_IN";

  try {
    const result = await prisma.$transaction(async (tx) => {
      if (!isIn) {
        const p = await tx.product.findUnique({ where: { id: pId }, select: { currentStock: true, name: true } });
        if (!p) throw new Error("ProductNotFound");
        if (p.currentStock < qty) throw new Error("InsufficientStock");
      }

      const updatedProduct = await tx.product.update({
        where: { id: pId },
        data: { currentStock: isIn ? { increment: qty } : { decrement: qty } },
      });

      const movement = await tx.inventoryMovement.create({
        data: {
          productId: pId,
          type,
          quantity: isIn ? qty : -qty,
          description: notes || `${type.replace("_", " ")} ${qty}`,
          userId: req.user?.id || 1,
        },
      });

      // Resolve out-of-stock alerts if stock increased
      if (isIn && updatedProduct.currentStock > 0) {
        await tx.alert.updateMany({
          where: { productId: pId, type: "OUT_OF_STOCK", isResolved: false },
          data: { isResolved: true },
        });
      }

      // Auto generate updated alerts
      await checkAndGenerateAlertsForProduct(updatedProduct);

      return { updatedProduct, movement };
    });

    res.status(201).json({ message: "Stock adjusted.", ...result });
  } catch (error) {
    if (error.message === "ProductNotFound") return res.status(404).json({ message: "Product not found." });
    if (error.message === "InsufficientStock") return res.status(400).json({ message: "Insufficient stock." });

    console.error(colors.red("Error adjusting stock:"), error);
    res.status(500).json({ message: "Failed to adjust stock.", error: error.message });
  }
};

/**
 * GET ALL INVENTORY PRODUCTS
 * GET /api/inventory
 * Returns array of products with inventory info
 */
export const getInventory = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });

    // Transform to inventory format
    const inventory = products.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      quantity: product.currentStock,
      lowStockThreshold: product.lowStockThreshold,
      unitPrice: product.unitPrice,
      costPrice: product.costPrice,
      price: product.unitPrice, // For compatibility
      category: product.category?.name,
      supplier: product.supplier?.name,
      status:
        product.currentStock <= 0
          ? 'out-of-stock'
          : product.currentStock <= product.lowStockThreshold
            ? 'low-stock'
            : 'in-stock',
    }));

    res.json({
      success: true,
      data: inventory,
      count: inventory.length,
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory',
      error: error.message,
    });
  }
};

/**
 * GET ALL INVENTORY MOVEMENTS
 * GET /api/inventory/movements
 */
export const getInventoryMovements = async (req, res) => {
  try {
    const movements = await prisma.inventoryMovement.findMany({
      orderBy: { timestamp: "desc" },
      include: {
        product: { select: { name: true, sku: true } },
        supplier: { select: { name: true } },
        user: { select: { username: true, name: true } },
      },
    });

    res.status(200).json(movements);
  } catch (error) {
    console.error(colors.red("Error fetching inventory movements:"), error);
    res.status(500).json({ message: "Failed to fetch inventory movements.", error: error.message });
  }
};


/**
 * GET LOW STOCK ALERTS
 * GET /api/inventory/low-stock
 */
export const getLowStockAlerts = async (req, res) => {
  try {
    const alerts = await prisma.alert.findMany({
      where: { isResolved: false },
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { name: true } }
      }
    });

    res.status(200).json(alerts);
  } catch (error) {
    console.error("Error fetching low stock alerts:", error);
    res.status(500).json({ message: "Failed to fetch alerts.", error: error.message });
  }
};


/**
 * GET INVENTORY SUMMARY
 * GET /api/inventory/summary
 */
export const getInventorySummary = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      select: { id: true, currentStock: true, lowStockThreshold: true },
    });

    const totalProducts = products.length;
    const totalInventory = products.reduce((sum, p) => sum + (p.currentStock || 0), 0);
    const lowStockItems = products.filter(
      p => p.lowStockThreshold != null && p.currentStock <= p.lowStockThreshold
    ).length;

    res.status(200).json({ totalProducts, totalInventory, lowStockItems });
  } catch (error) {
    console.error("Error fetching inventory summary:", error);
    res.status(500).json({ message: "Failed to fetch inventory summary", error: error.message });
  }
};
