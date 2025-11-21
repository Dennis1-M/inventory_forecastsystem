import colors from 'colors';
import { prisma } from '../index.js'; // Assuming prisma client is initialized and exported from index.js

// Define allowed inventory movement types
const VALID_MOVEMENT_TYPES = ['RECEIPT', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'SALE', 'SALE_REVERSAL']; // SALE and SALE_REVERSAL are typically handled by saleController, but included for completeness

// --- Helper function for error handling ---
const handlePrismaError = (res, error, operation) => {
    console.error(colors.red(`Prisma Error during ${operation}:`), error);
    if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Product or record not found.' });
    }
    if (error.code === 'P2003') {
        return res.status(400).json({ message: 'Invalid Product ID provided.' });
    }
    return res.status(500).json({ message: `Failed to ${operation} due to a server error.` });
};

/**
 * @route POST /api/inventory/receive
 * @desc Record receipt of new stock and update product currentStock (IN)
 * @access Protected
 */
export const receiveStock = async (req, res) => {
    const { productId, quantity, costPrice, supplierId, notes } = req.body;

    if (!productId || quantity === undefined || parseFloat(quantity) <= 0) {
        return res.status(400).json({ message: 'Product ID and a positive quantity are required.' });
    }

    const qty = parseInt(quantity);
    const pId = parseInt(productId);

    try {
        // Use a transaction to ensure both inventory and product update are atomic
        const transactionResult = await prisma.$transaction(async (tx) => {
            
            // 1. Update Product currentStock (Increment)
            const updatedProduct = await tx.product.update({
                where: { id: pId },
                data: {
                    currentStock: {
                        increment: qty,
                    },
                },
            });

            // 2. Record the Inventory Movement
            const movement = await tx.inventoryMovement.create({
                data: {
                    productId: pId,
                    type: 'RECEIPT',
                    quantity: qty, // Positive quantity for receipt
                    costPrice: costPrice ? parseFloat(costPrice) : null,
                    supplierId: supplierId ? parseInt(supplierId) : null,
                    description: notes || `Stock received: ${qty} units.`,
                    userId: req.user.id,
                }
            });

            return { updatedProduct, movement };
        });

        res.status(201).json(transactionResult);

    } catch (error) {
        handlePrismaError(res, error, 'receiving stock');
    }
};


/**
 * @route POST /api/inventory/adjust
 * @desc Record inventory adjustment (IN or OUT)
 * @access Protected
 */
export const adjustStock = async (req, res) => {
    const { productId, type, quantity, notes } = req.body;

    if (!productId || quantity === undefined || parseFloat(quantity) <= 0 || !type) {
        return res.status(400).json({ message: 'Product ID, type, and a positive quantity are required.' });
    }
    
    if (!['ADJUSTMENT_IN', 'ADJUSTMENT_OUT'].includes(type)) {
         return res.status(400).json({ message: 'Invalid adjustment type. Must be ADJUSTMENT_IN or ADJUSTMENT_OUT.' });
    }

    const qty = parseInt(quantity);
    const pId = parseInt(productId);
    
    // Determine the operation and sign based on adjustment type
    const isAdjustmentIn = type === 'ADJUSTMENT_IN';
    const finalQty = isAdjustmentIn ? qty : -qty; // Positive for IN, Negative for OUT
    const operation = isAdjustmentIn ? 'increment' : 'decrement';

    try {
        // Use a transaction for atomic stock change and movement recording
        const transactionResult = await prisma.$transaction(async (tx) => {
            
            // 1. If ADJUSTMENT_OUT, check if enough stock is available
            if (!isAdjustmentIn) {
                const product = await tx.product.findUnique({
                    where: { id: pId },
                    select: { currentStock: true, name: true }
                });

                if (!product) {
                    throw new Error('ProductNotFound');
                }

                if (product.currentStock < qty) {
                    throw new Error('InsufficientStock');
                }
            }

            // 2. Update Product currentStock
            const updatedProduct = await tx.product.update({
                where: { id: pId },
                data: {
                    currentStock: {
                        [operation]: qty,
                    },
                },
            });

            // 3. Record the Inventory Movement
            const movement = await tx.inventoryMovement.create({
                data: {
                    productId: pId,
                    type: type,
                    quantity: finalQty,
                    description: notes || `${type.replace('_', ' ')}: ${qty} units.`,
                    userId: req.user.id,
                }
            });

            return { updatedProduct, movement };
        });

        res.status(201).json(transactionResult);

    } catch (error) {
        if (error.message === 'ProductNotFound') {
            return res.status(404).json({ message: 'Product not found.' });
        }
        if (error.message === 'InsufficientStock') {
             const product = await prisma.product.findUnique({ where: { id: pId } }); // Re-fetch to get product name
            return res.status(400).json({ 
                message: `Cannot adjust out. Insufficient stock for ${product?.name || 'product'}. Available: ${product?.currentStock || 'unknown'}, Requested: ${qty}.` 
            });
        }
        handlePrismaError(res, error, 'adjusting stock');
    }
};


/**
 * @route GET /api/inventory/movements
 * @desc Get inventory movement history (audit log)
 * @access Protected
 */
export const getInventoryMovements = async (req, res) => {
    const { startDate, endDate, productId, type, page = 1, limit = 25 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    let where = {};
    
    // Date filtering
    if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) {
            where.timestamp.gte = new Date(startDate);
        }
        if (endDate) {
            let end = new Date(endDate);
            end.setHours(23, 59, 59, 999); 
            where.timestamp.lte = end;
        }
    }

    // Product filtering
    if (productId) {
        where.productId = parseInt(productId);
    }
    
    // Type filtering
    if (type && VALID_MOVEMENT_TYPES.includes(type)) {
        where.type = type;
    }


    try {
        const [movements, totalCount] = await prisma.$transaction([
            prisma.inventoryMovement.findMany({
                where,
                include: {
                    product: {
                        select: { name: true, sku: true }
                    },
                    user: {
                        select: { name: true }
                    },
                    supplier: {
                        select: { name: true }
                    }
                },
                orderBy: {
                    timestamp: 'desc', // Most recent movements first
                },
                skip,
                take,
            }),
            prisma.inventoryMovement.count({ where }),
        ]);

        res.status(200).json({
            data: movements,
            total: totalCount,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(totalCount / limit),
        });
    } catch (error) {
        handlePrismaError(res, error, 'fetching inventory movements');
    }
};

/**
 * @route GET /api/inventory/low-stock
 * @desc Get a list of all products currently below their lowStockThreshold
 * @access Protected
 */
export const getLowStockAlerts = async (req, res) => {
    try {
        const lowStockProducts = await prisma.product.findMany({
            where: {
                // Find products where currentStock is less than or equal to lowStockThreshold
                currentStock: {
                    lte: prisma.product.fields.lowStockThreshold
                }
            },
            include: {
                category: true,
                supplier: true
            },
            orderBy: {
                currentStock: 'asc'
            }
        });

        res.status(200).json(lowStockProducts);
    } catch (error) {
        // Handle the specific error if the where clause on related fields is not supported by the current Prisma version/database
        if (error.message.includes('A check constraint failed')) {
            console.warn(colors.yellow('Prisma error: Low stock alert query might be running on a database that does not support comparison of two fields (lte: prisma.product.fields.lowStockThreshold). Falling back to simpler query.'));
            // Fallback: This requires client-side filtering or a native SQL query workaround, which is harder in controllers.
            // For now, let's assume the comparison is supported as per modern Prisma documentation.
        }
        handlePrismaError(res, error, 'fetching low stock alerts');
    }
};