import colors from 'colors';
import { prisma } from '../index.js';

// --- Helper function for error handling ---
const handlePrismaError = (res, error, operation) => {
    console.error(colors.red(`Prisma Error during ${operation}:`), error);
    if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Sale or related Product not found.' });
    }
    if (error.code === 'P2003') {
        return res.status(400).json({ message: 'Invalid Product ID provided for the sale.' });
    }
    return res.status(500).json({ message: `Failed to ${operation} due to a server error.` });
};

/**
 * @route POST /api/sales
 * @desc Record a new sale + update inventory
 */
export const createSale = async (req, res) => {
    const { productId, quantitySold, saleDate, unitPriceSold, notes } = req.body;

    if (!productId || quantitySold === undefined || unitPriceSold === undefined) {
        return res.status(400).json({ message: 'Product ID, quantity, and unit price sold are required.' });
    }

    const qty = parseInt(quantitySold);
    const price = parseFloat(unitPriceSold);
    const pId = parseInt(productId);

    if (qty <= 0) {
        return res.status(400).json({ message: 'Quantity sold must be a positive number.' });
    }

    try {
        const result = await prisma.$transaction(async (tx) => {

            const product = await tx.product.findUnique({
                where: { id: pId },
                select: { currentStock: true, name: true }
            });

            if (!product) throw new Error('ProductNotFound');
            if (product.currentStock < qty) throw new Error('InsufficientStock');

            await tx.product.update({
                where: { id: pId },
                data: { currentStock: { decrement: qty } }
            });

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

            await tx.inventoryMovement.create({
                data: {
                    productId: pId,
                    type: 'SALE',
                    quantity: -qty,
                    description: `Sale recorded. Inventory decreased by ${qty}.`,
                    timestamp: newSale.saleDate,
                    userId: req.user.id,
                }
            });

            return newSale;
        });

        res.status(201).json(result);

    } catch (error) {
        if (error.message === 'ProductNotFound') {
            return res.status(404).json({ message: 'Product not found.' });
        }
        if (error.message === 'InsufficientStock') {
            const product = await prisma.product.findUnique({ where: { id: pId } });
            return res.status(400).json({
                message: `Insufficient stock for ${product?.name}. Available: ${product?.currentStock}, Requested: ${qty}.`
            });
        }
        handlePrismaError(res, error, 'recording sale');
    }
};

/**
 * @route GET /api/sales
 * @desc Get all sales with pagination + filters
 */
export const getSales = async (req, res) => {
    const { startDate, endDate, productId, page = 1, limit = 25 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

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

    if (productId) where.productId = parseInt(productId);

    try {
        const [sales, totalCount] = await prisma.$transaction([
            prisma.sale.findMany({
                where,
                include: {
                    product: { select: { name: true, sku: true, unitPrice: true } },
                    user: { select: { name: true } }
                },
                orderBy: { saleDate: 'desc' },
                skip,
                take,
            }),
            prisma.sale.count({ where }),
        ]);

        res.status(200).json({
            data: sales,
            total: totalCount,
            page: parseInt(page),
            limit: take,
            totalPages: Math.ceil(totalCount / take),
        });
    } catch (error) {
        handlePrismaError(res, error, 'fetching sales');
    }
};

/**
 * @route GET /api/sales/:id
 * @desc Get sale by ID
 */
export const getSaleById = async (req, res) => {
    const { id } = req.params;

    try {
        const sale = await prisma.sale.findUnique({
            where: { id: parseInt(id) },
            include: {
                product: { select: { name: true, sku: true, unitPrice: true } },
                user: { select: { name: true } }
            }
        });

        if (!sale) return res.status(404).json({ message: 'Sale record not found.' });

        res.status(200).json(sale);

    } catch (error) {
        handlePrismaError(res, error, 'fetching sale by ID');
    }
};

/**
 * @route PUT /api/sales/:id
 * @desc Update metadata of a sale (NOT quantity or price)
 */
export const updateSale = async (req, res) => {
    const { id } = req.params;
    const { saleDate, notes } = req.body;

    try {
        const updatedSale = await prisma.sale.update({
            where: { id: parseInt(id) },
            data: {
                ...(saleDate && { saleDate: new Date(saleDate) }),
                ...(notes !== undefined && { notes: notes || null }),
            },
        });

        res.status(200).json(updatedSale);

    } catch (error) {
        handlePrismaError(res, error, 'updating sale');
    }
};

/**
 * @route DELETE /api/sales/:id
 * @desc Delete sale and restore inventory
 */
export const deleteSale = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.$transaction(async (tx) => {

            const sale = await tx.sale.findUnique({
                where: { id: parseInt(id) },
                select: { productId: true, quantitySold: true }
            });

            if (!sale) throw new Error('SaleNotFound');

            await tx.product.update({
                where: { id: sale.productId },
                data: { currentStock: { increment: sale.quantitySold } },
            });

            await tx.sale.delete({ where: { id: parseInt(id) } });

            await tx.inventoryMovement.create({
                data: {
                    productId: sale.productId,
                    type: 'SALE_REVERSAL',
                    quantity: sale.quantitySold,
                    description: `Sale ID ${id} deleted and inventory reversed.`,
                    timestamp: new Date(),
                    userId: req.user.id,
                }
            });
        });

        res.status(204).send();

    } catch (error) {
        if (error.message === 'SaleNotFound') {
            return res.status(404).json({ message: 'Sale record not found.' });
        }
        handlePrismaError(res, error, 'deleting sale');
    }
};

/**
 * @route GET /api/sales/forecast
 * @desc Returns grouped sales data for forecasting
 */
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

    if (productId) where.productId = parseInt(productId);

    try {
        const data = await prisma.sale.groupBy({
            by: ["saleDate", "productId"],
            where,
            _sum: {
                quantitySold: true,
                totalSaleAmount: true
            },
            orderBy: { saleDate: "asc" }
        });

        res.status(200).json(data);

    } catch (error) {
        handlePrismaError(res, error, "fetching sales forecast data");
    }
};
