// sales.controller.js
import colors from "colors";
import prisma  from "../config/prisma.js"

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
  const { productId, quantitySold, saleDate, unitPriceSold, notes } = req.body;

  if (!productId || quantitySold == null || unitPriceSold == null) {
    return res.status(400).json({
      message: "Product ID, quantity sold, and unit price are required.",
    });
  }

  const qty = parseInt(quantitySold, 10);
  const price = parseFloat(unitPriceSold);
  const pId = parseInt(productId, 10);

  if (Number.isNaN(qty) || Number.isNaN(price) || Number.isNaN(pId)) {
    return res
      .status(400)
      .json({ message: "productId, quantitySold and unitPriceSold must be numbers." });
  }

  if (qty <= 0) {
    return res
      .status(400)
      .json({ message: "Quantity sold must be a positive number." });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Validate product
      const product = await tx.product.findUnique({
        where: { id: pId },
        select: {
          currentStock: true,
          name: true,
          reorderPoint: true,
          overStockLimit: true,
        },
      });

      if (!product) throw new Error("ProductNotFound");
      if (product.currentStock < qty) throw new Error("InsufficientStock");

      // 2. Reduce stock
      await tx.product.update({
        where: { id: pId },
        data: { currentStock: { decrement: qty } },
      });

      // 3. Re-fetch for updated values
      const updatedProduct = await tx.product.findUnique({
        where: { id: pId },
        select: {
          name: true,
          currentStock: true,
          reorderPoint: true,
          overStockLimit: true,
        },
      });

      // ---------- AUTO ALERTS ----------
      if (
        updatedProduct.reorderPoint !== null &&
        updatedProduct.currentStock <= updatedProduct.reorderPoint
      ) {
        await tx.alert.create({
          data: {
            productId: pId,
            type: "LOW_STOCK",
            message: `Low stock alert for ${updatedProduct.name}. Current stock: ${updatedProduct.currentStock}`,
            isRead: false,
          },
        });
      }

      if (
        updatedProduct.overStockLimit !== null &&
        updatedProduct.currentStock >= updatedProduct.overStockLimit
      ) {
        await tx.alert.create({
          data: {
            productId: pId,
            type: "OVERSTOCK",
            message: `Overstock alert for ${updatedProduct.name}. Current stock: ${updatedProduct.currentStock}`,
            isRead: false,
          },
        });
      }

      // 4. Create sale
      const newSale = await tx.sale.create({
        data: {
          productId: pId,
          quantitySold: qty,
          unitPriceSold: price,
          totalSaleAmount: qty * price,
          saleDate: saleDate ? new Date(saleDate) : new Date(),
          notes: notes || null,
          userId: req.user.id,
        },
      });

      // 5. Record inventory movement
      await tx.inventoryMovement.create({
        data: {
          productId: pId,
          type: "SALE",
          quantity: -qty,
          description: `Sale recorded. Inventory reduced by ${qty}.`,
          timestamp: newSale.saleDate,
          userId: req.user.id,
        },
      });

      return newSale;
    });

    return res.status(201).json(result);
  } catch (error) {
    if (error.message === "ProductNotFound") {
      return res.status(404).json({ message: "Product not found." });
    }

    if (error.message === "InsufficientStock") {
      // try to fetch the product name/stock for a better message (non-transactional)
      try {
        const product = await prisma.product.findUnique({
          where: { id: productId ? parseInt(productId, 10) : undefined },
        });

        return res.status(400).json({
          message: `Insufficient stock for ${product?.name}. Available: ${product?.currentStock}, Requested: ${qty}`,
        });
      } catch (fetchError) {
        // If fetching product fails for some reason, return a generic insufficient stock message
        return res.status(400).json({
          message: `Insufficient stock. Requested: ${qty}`,
        });
      }
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
    where.saleDate = {};
    if (startDate) where.saleDate.gte = new Date(startDate);

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.saleDate.lte = end;
    }
  }

  if (productId) where.productId = parseInt(productId, 10);

  try {
    const [sales, totalCount] = await prisma.$transaction([
      prisma.sale.findMany({
        where,
        include: {
          product: { select: { name: true, sku: true, unitPrice: true } },
          user: { select: { name: true } },
        },
        orderBy: { saleDate: "desc" },
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
        product: { select: { name: true, sku: true, unitPrice: true } },
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
        select: { productId: true, quantitySold: true },
      });

      if (!sale) throw new Error("SaleNotFound");

      await tx.product.update({
        where: { id: sale.productId },
        data: { currentStock: { increment: sale.quantitySold } },
      });

      await tx.sale.delete({ where: { id: parseInt(id, 10) } });

      await tx.inventoryMovement.create({
        data: {
          productId: sale.productId,
          type: "SALE_REVERSAL",
          quantity: sale.quantitySold,
          description: `Sale ID ${id} deleted; inventory restored.`,
          timestamp: new Date(),
          userId: req.user.id,
        },
      });
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

  let where = {};

  if (startDate || endDate) {
    where.saleDate = {};
    if (startDate) where.saleDate.gte = new Date(startDate);

    if (endDate) {
      let end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.saleDate.lte = end;
    }
  }

  if (productId) where.productId = parseInt(productId, 10);

  try {
    const data = await prisma.sale.groupBy({
      by: ["saleDate", "productId"],
      where,
      _sum: {
        quantitySold: true,
        totalSaleAmount: true,
      },
      orderBy: { saleDate: "asc" },
    });

    return res.status(200).json(data);
  } catch (error) {
    return handlePrismaError(res, error, "fetching forecast data");
  }
};
