import colors from "colors";
import { prisma } from "../index.js";

/**
 * Receive stock from supplier (automatic stock adjustment)
 * POST /api/inventory/receive
 * Body:
 *  - productId (required)
 *  - quantity (required, >0)
 *  - costPrice (optional)
 *  - supplierId (optional - but recommended)
 *  - notes (optional)
 */
export const receiveStock = async (req, res) => {
  const { productId, quantity, costPrice, supplierId, notes } = req.body;

  if (!productId || quantity === undefined || Number(quantity) <= 0) {
    return res.status(400).json({ message: "productId and positive quantity are required." });
  }

  const pId = Number(productId);
  const qty = Number(quantity);

  try {
    // Verify product exists
    const product = await prisma.product.findUnique({ where: { id: pId } });
    if (!product) return res.status(404).json({ message: "Product not found." });

    // If supplierId provided, ensure it exists
    if (supplierId !== undefined && supplierId !== null) {
      const supplier = await prisma.supplier.findUnique({ where: { id: Number(supplierId) } });
      if (!supplier) return res.status(400).json({ message: "Supplier not found." });
    }

    // Transaction: increment stock and create movement linked to supplier (if provided)
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
          costPrice: costPrice !== undefined ? Number(costPrice) : null,
          description: notes || `Received ${qty} units from supplier ${supplierId || "N/A"}`,
          userId: req.user?.id || 1, // fallback if req.user not set
          supplierId: supplierId ? Number(supplierId) : null,
        },
      });

      return { updatedProduct, movement };
    });

    res.status(201).json({ message: "Stock received.", ...result });
  } catch (error) {
    console.error(colors.red("Error receiving stock:"), error);
    res.status(500).json({ message: "Failed to receive stock.", error: error.message });
  }
};

/**
 * Adjust stock (existing logic, unchanged except validation)
 */
export const adjustStock = async (req, res) => {
  const { productId, type, quantity, notes } = req.body;
  if (!productId || !type || quantity === undefined || Number(quantity) <= 0) {
    return res.status(400).json({ message: "productId, type and positive quantity required." });
  }
  if (!["ADJUSTMENT_IN", "ADJUSTMENT_OUT"].includes(type)) {
    return res.status(400).json({ message: "Invalid adjustment type." });
  }

  const pId = Number(productId);
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
 * Get inventory movements (unchanged except returns supplier info)
 */
export const getInventoryMovements = async (req, res) => {
  const { startDate, endDate, productId, type, page = 1, limit = 25 } = req.query;
  const skip = (Math.max(Number(page), 1) - 1) * Number(limit);
  const take = Math.max(Number(limit) || 25, 1);

  const where = {};
  if (productId) where.productId = Number(productId);
  if (type) where.type = type;
  if (startDate || endDate) {
    where.timestamp = {};
    if (startDate) where.timestamp.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.timestamp.lte = end;
    }
  }

  try {
    const [movements, total] = await prisma.$transaction([
      prisma.inventoryMovement.findMany({
        where,
        include: { product: { select: { id: true, name: true, sku: true } }, user: { select: { id: true, name: true } }, supplier: { select: { id: true, name: true } } },
        orderBy: { timestamp: "desc" },
        skip,
        take,
      }),
      prisma.inventoryMovement.count({ where }),
    ]);

    res.json({ data: movements, total, page: Number(page), limit: take, totalPages: Math.ceil(total / take) });
  } catch (error) {
    console.error(colors.red("Error fetching movements:"), error);
    res.status(500).json({ message: "Failed to fetch movements.", error: error.message });
  }
};

/**
 * Low-stock alerts
 */
export const getLowStockAlerts = async (req, res) => {
  try {
    // fetch products and supplier info where currentStock <= lowStockThreshold
    const products = await prisma.product.findMany({
      where: { currentStock: { lte: prisma.product.fields.lowStockThreshold } },
      include: { supplier: true, category: true },
      orderBy: { currentStock: "asc" },
    });
    res.json(products);
  } catch (error) {
    console.error(colors.red("Error fetching low stock:"), error);
    res.status(500).json({ message: "Failed to fetch low-stock products.", error: error.message });
  }
};
