// Backend/controllers/supplierController.js
// Controller for managing suppliers: CRUD operations and dashboard analytics


import colors from "colors";
import prisma from "../config/prisma.js";
/**
 * Get all suppliers
 */
export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({ orderBy: { name: "asc" } });
    res.json(suppliers);
  } catch (error) {
    console.error(colors.red("Error fetching suppliers:"), error);
    res.status(500).json({ message: "Failed to load suppliers." });
  }
};

/**
 * Get supplier by ID
 */
export const getSupplierById = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid supplier id." });

  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: { products: true, movements: true },
    });
    if (!supplier) return res.status(404).json({ message: "Supplier not found." });
    res.json(supplier);
  } catch (error) {
    console.error(colors.red("Error fetching supplier by id:"), error);
    res.status(500).json({ message: "Failed to fetch supplier.", error: error.message });
  }
};

/**
 * Create supplier
 */
export const createSupplier = async (req, res) => {
  const { name, contactEmail, contactPhone } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Supplier name is required." });
  }

  try {
    const newSupplier = await prisma.supplier.create({
      data: {
        name,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
      },
    });
    res.status(201).json({ message: "Supplier created successfully.", supplier: newSupplier });
  } catch (error) {
    console.error(colors.red("Prisma Error creating supplier:"), error);
    res.status(500).json({ message: "Failed to create supplier.", error: error.message });
  }
};

/**
 * Update supplier
 */
export const updateSupplier = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid supplier id." });

  const { name, contactEmail, contactPhone } = req.body;

  try {
    const updated = await prisma.supplier.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(contactEmail !== undefined && { contactEmail: contactEmail || null }),
        ...(contactPhone !== undefined && { contactPhone: contactPhone || null }),
      },
    });
    res.json({ message: "Supplier updated.", supplier: updated });
  } catch (error) {
    console.error(colors.red("Prisma Error updating supplier:"), error);
    res.status(500).json({ message: "Failed to update supplier.", error: error.message });
  }
};

/**
 * Delete supplier
 */
export const deleteSupplier = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid supplier id." });

  try {
    await prisma.supplier.delete({ where: { id } });
    res.json({ message: "Supplier deleted." });
  } catch (error) {
    console.error(colors.red("Prisma Error deleting supplier:"), error);
    res.status(500).json({ message: "Failed to delete supplier.", error: error.message });
  }
};

/**
 * Supplier Dashboard analytics
 * GET /api/suppliers/:id/dashboard
 * Returns:
 * - summary: totalProducts, totalStock, totalMovements
 * - topProductsByStock (limit 5)
 * - recentMovements (limit 10)
 * - salesSummary: totalSalesAmount, totalUnitsSold (last 90 days)
 */
export const getSupplierDashboard = async (req, res) => {
  const supplierId = Number(req.params.id);
  if (!supplierId) return res.status(400).json({ message: "Invalid supplier id." });

  try {
    const [summary, topProducts, recentMovements, salesSummary] = await Promise.all([
      // summary
      prisma.product.count({ where: { supplierId } })
        .then(async (count) => {
          const totalStockObj = await prisma.product.aggregate({
            _sum: { currentStock: true },
            where: { supplierId },
          });
          const totalStock = totalStockObj._sum.currentStock || 0;
          const totalMovements = await prisma.inventoryMovement.count({ where: { supplierId } });
          return { totalProducts: count, totalStock, totalMovements };
        }),

      // top products by stock
      prisma.product.findMany({
        where: { supplierId },
        orderBy: { currentStock: "desc" },
        take: 5,
        select: { id: true, name: true, currentStock: true, sku: true },
      }),

      // recent movements
      prisma.inventoryMovement.findMany({
        where: { supplierId },
        orderBy: { timestamp: "desc" },
        take: 10,
        include: { product: { select: { name: true, sku: true } }, user: { select: { name: true } } },
      }),

      // sales summary last 90 days
      (async () => {
        const since = new Date();
        since.setDate(since.getDate() - 90);
        const salesAgg = await prisma.sale.aggregate({
          _sum: { totalSaleAmount: true, quantitySold: true },
          where: {
            product: { supplierId },
            saleDate: { gte: since },
          },
        });
        return {
          totalSalesAmount: salesAgg._sum.totalSaleAmount || 0,
          totalUnitsSold: salesAgg._sum.quantitySold || 0,
        };
      })(),
    ]);

    res.json({ summary, topProducts, recentMovements, salesSummary });
  } catch (error) {
    console.error(colors.red("Error generating supplier dashboard:"), error);
    res.status(500).json({ message: "Failed to generate supplier dashboard.", error: error.message });
  }
};
