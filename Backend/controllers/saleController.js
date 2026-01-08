// sales.controller.js
import colors from "colors";
import prisma from "../config/prisma.js";
import { emitAlert, emitProductUpdate } from "../sockets/index.js";

// ---------- Error Handler ----------
const handlePrismaError = (res, error, operation) => {
  console.error(colors.red(`Prisma Error during ${operation}:`), error);

  if (error && error.code === "P2025") {
    return res.status(404).json({ message: "Sale or Product not found." });
  }

  if (error && error.code === "P2003") {
    return res.status(400).json({ message: "Invalid Product ID provided." });
  }

  return res
    .status(500)
    .json({ message: `Failed to ${operation} due to a server error.` });
};

// ---------------------------------------------------------
// POST /api/sales → Create Sale + Auto Stock Update + Alerts
// ---------------------------------------------------------
export const createSale = async (req, res) => {
  const { items, paymentMethod } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "items array is required and cannot be empty." });
  }

  const parsedItems = items.map((it) => ({
    productId: parseInt(it.productId, 10),
    quantity: parseInt(it.quantity, 10),
    unitPrice: parseFloat(it.unitPrice),
  }));

  for (const it of parsedItems) {
    if (Number.isNaN(it.productId) || Number.isNaN(it.quantity) || Number.isNaN(it.unitPrice)) {
      return res.status(400).json({ message: "productId, quantity and unitPrice must be valid numbers for all items." });
    }
    if (it.quantity <= 0) return res.status(400).json({ message: "Quantities must be positive." });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const productIds = [...new Set(parsedItems.map((i) => i.productId))];

      const products = await tx.product.findMany({ where: { id: { in: productIds } } });

      if (products.length !== productIds.length) throw new Error("ProductNotFound");

      // Check stock availability
      for (const it of parsedItems) {
        const p = products.find((p) => p.id === it.productId);
        if (!p) throw new Error("ProductNotFound");
        if (p.currentStock < it.quantity) {
          const err = new Error("InsufficientStock");
          err.product = p;
          throw err;
        }
      }

      // Decrement stock for each product
      for (const it of parsedItems) {
        await tx.product.update({ where: { id: it.productId }, data: { currentStock: { decrement: it.quantity } } });
      }

      // Calculate totals and create sale with items
      const totalAmount = parsedItems.reduce((s, it) => s + it.quantity * it.unitPrice, 0);

      const sale = await tx.sale.create({
        data: {
          totalAmount,
          paymentMethod: paymentMethod || "CASH",
          userId: req.user?.id || 1, // fallback to system user when auth is not present in tests
          items: {
            create: parsedItems.map((it) => ({
              productId: it.productId,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              total: it.quantity * it.unitPrice,
            })),
          },
        },
        include: { items: true },
      });

      // Create inventory movements and low-stock alerts
      for (const it of parsedItems) {
        await tx.inventoryMovement.create({
          data: {
            productId: it.productId,
            type: "SALE",
            quantity: -it.quantity,
            userId: req.user.id,
          },
        });

        // Re-fetch product to read updated stock
        const updated = await tx.product.findUnique({ where: { id: it.productId }, select: { name: true, currentStock: true, lowStockThreshold: true } });
        if (updated.lowStockThreshold !== null && updated.currentStock <= updated.lowStockThreshold) {
          await tx.alert.create({
            data: {
              productId: it.productId,
              type: "LOW_STOCK",
              message: `Low stock for ${updated.name}. Current: ${updated.currentStock}`,
            },
          });
        }
      }

      return sale;
    });

    // Post-transaction: emit updates and alerts for affected products
    try {
      for (const it of parsedItems) {
        const prod = await prisma.product.findUnique({ where: { id: it.productId }, select: { id: true, currentStock: true, name: true } });
        if (prod) emitProductUpdate({ productId: prod.id, currentStock: prod.currentStock });

        const alert = await prisma.alert.findFirst({ where: { productId: it.productId, isResolved: false } });
        if (alert) emitAlert({ id: alert.id, productId: alert.productId, type: alert.type, message: alert.message, createdAt: alert.createdAt });
      }
    } catch (e) {
      console.warn('Post-sale emits failed', e.message);
    }

    return res.status(201).json(result);
  } catch (error) {
    if (error.message === "ProductNotFound") {
      return res.status(404).json({ message: "One or more products not found." });
    }

    if (error.message === "InsufficientStock") {
      const p = error.product;
      return res.status(400).json({ message: `Insufficient stock for ${p?.name || 'product'}. Available: ${p?.currentStock}, Requested: ${p?.quantity || 'n'}` });
    }

    return handlePrismaError(res, error, "recording sale");
  }
};

// ---------------------------------------------------------
// GET /api/sales → Get Sales with Pagination + Filters
// ---------------------------------------------------------
export const getSales = async (req, res) => {
  const { startDate, endDate, productId, page = 1, limit = 25 } = req.query;

  const pageNum = parseInt(page, 10) || 1;
  const skip = (pageNum - 1) * (parseInt(limit, 10) || 25);
  const take = parseInt(limit, 10) || 25;

  let where = {};

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  if (productId) {
    where.items = { some: { productId: parseInt(productId, 10) } };
  }

  try {
    const [sales, totalCount] = await prisma.$transaction([
      prisma.sale.findMany({
        where,
        include: {
          items: { include: { product: { select: { name: true, sku: true, unitPrice: true, category: { select: { name: true } } } } } },
          user: { select: { name: true, role: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.sale.count({ where }),
    ]);

    return res.status(200).json({
      data: sales,
      total: totalCount,
      page: pageNum,
      limit: take,
      totalPages: Math.ceil(totalCount / take),
    });
  } catch (error) {
    return handlePrismaError(res, error, "fetching sales");
  }
};

// ---------------------------------------------------------
// GET /api/sales/:id
// ---------------------------------------------------------
export const getSaleById = async (req, res) => {
  const { id } = req.params;

  try {
    const sale = await prisma.sale.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        items: { include: { product: { select: { name: true, sku: true, unitPrice: true } } } },
        user: { select: { name: true } },
      },
    });

    if (!sale) {
      return res.status(404).json({ message: "Sale not found." });
    }

    return res.status(200).json(sale);
  } catch (error) {
    return handlePrismaError(res, error, "fetching sale");
  }
};

// ---------------------------------------------------------
// PUT /api/sales/:id → Update Notes / Date Only
// ---------------------------------------------------------
export const updateSale = async (req, res) => {
  const { id } = req.params;
  const { saleDate, notes } = req.body;

  try {
    const updatedSale = await prisma.sale.update({
      where: { id: parseInt(id, 10) },
      data: {
        ...(saleDate && { saleDate: new Date(saleDate) }),
        ...(notes !== undefined && { notes: notes || null }),
      },
    });

    return res.status(200).json(updatedSale);
  } catch (error) {
    return handlePrismaError(res, error, "updating sale");
  }
};

// ---------------------------------------------------------
// DELETE /api/sales/:id → Restore Stock + Log Reversal
// ---------------------------------------------------------
export const deleteSale = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id: parseInt(id, 10) },
        include: { items: true },
      });

      if (!sale) throw new Error("SaleNotFound");

      // Restore stock for each item
      for (const it of sale.items) {
        await tx.product.update({ where: { id: it.productId }, data: { currentStock: { increment: it.quantity } } });

        await tx.inventoryMovement.create({
          data: {
            productId: it.productId,
            type: "SALE_REVERSAL",
            quantity: it.quantity,
            userId: req.user.id,
          },
        });
      }

      // Delete sale and child items (cascade expected, but ensure deletion)
      await tx.sale.delete({ where: { id: parseInt(id, 10) } });
    });

    return res.status(204).send();
  } catch (error) {
    if (error.message === "SaleNotFound") {
      return res.status(404).json({ message: "Sale not found." });
    }

    return handlePrismaError(res, error, "deleting sale");
  }
};

// ---------------------------------------------------------
// GET /api/sales/forecast → Group Sales Data for Forecasting
// ---------------------------------------------------------
export const getSalesForForecast = async (req, res) => {
  const { startDate, endDate, productId } = req.query;

  const saleDateFilter = {};
  if (startDate) saleDateFilter.gte = new Date(startDate);
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    saleDateFilter.lte = end;
  }

  try {
    const where = {
      ...(Object.keys(saleDateFilter).length ? { sale: { createdAt: saleDateFilter } } : {}),
      ...(productId ? { productId: parseInt(productId, 10) } : {}),
    };

    const items = await prisma.saleItem.findMany({
      where,
      include: { sale: { select: { createdAt: true } } },
      orderBy: { sale: { createdAt: "asc" } },
    });

    // Group by date and productId
    const grouped = {};

    for (const it of items) {
      const date = new Date(it.sale.createdAt).toISOString().slice(0, 10); // YYYY-MM-DD
      const key = `${date}_${it.productId}`;
      if (!grouped[key]) grouped[key] = { date, productId: it.productId, quantity: 0, revenue: 0 };
      grouped[key].quantity += it.quantity;
      grouped[key].revenue += it.total;
    }

    return res.status(200).json(Object.values(grouped));
  } catch (error) {
    return handlePrismaError(res, error, "fetching forecast data");
  }
};
