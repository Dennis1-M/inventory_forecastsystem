import colors from 'colors';
import { prisma } from '../index.js'; // Assuming prisma client is initialized and exported from index.js

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
 * @desc Record a new sale and update inventory
 * @access Protected
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
        // Use a Prisma transaction to ensure atomicity: 
        // 1. Check stock
        // 2. Decrement stock
        // 3. Create sale record
        const transactionResult = await prisma.$transaction(async (tx) => {
            
            // 1. Check current stock level
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

            // 2. Decrement stock
            const updatedProduct = await tx.product.update({
                where: { id: pId },
                data: {
                    currentStock: {
                        decrement: qty,
                    },
                },
            });

            // 3. Create the sale record
            const newSale = await tx.sale.create({
                data: {
                    productId: pId,
                    quantitySold: qty,
                    unitPriceSold: price,
                    totalSaleAmount: qty * price,
                    saleDate: saleDate ? new Date(saleDate) : new Date(),
                    notes: notes || null,
                    // Link the user who recorded the sale
                    userId: req.user.id,
                },
            });

            // 4. Record the inventory movement for reporting/audit purposes
            await tx.inventoryMovement.create({
                data: {
                    productId: pId,
                    type: 'SALE', // Custom enum value for sales
                    quantity: -qty, // Negative quantity for removal
                    description: `Sale recorded. Inventory decreased by ${qty}.`,
                    timestamp: newSale.saleDate,
                    userId: req.user.id,
                }
            });

            return newSale;

        }); // End of transaction

        res.status(201).json(transactionResult);

    } catch (error) {
        if (error.message === 'ProductNotFound') {
            return res.status(404).json({ message: 'Product not found.' });
        }
        if (error.message === 'InsufficientStock') {
            const product = await prisma.product.findUnique({ where: { id: pId } }); // Re-fetch to get product name
            return res.status(400).json({ 
                message: `Insufficient stock for ${product?.name || 'product'}. Available: ${product?.currentStock || 'unknown'}, Requested: ${qty}.` 
            });
        }
        handlePrismaError(res, error, 'recording sale');
    }
};


/**
 * @route GET /api/sales
 * @desc Get all sales records (with optional filtering/searching)
 * @access Protected
 */
export const getSales = async (req, res) => {
    const { startDate, endDate, productId, page = 1, limit = 25 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    let where = {};
    
    // Date filtering
    if (startDate || endDate) {
        where.saleDate = {};
        if (startDate) {
            where.saleDate.gte = new Date(startDate); // greater than or equal to start date
        }
        if (endDate) {
            // Set end date to the end of the day for inclusive filtering
            let end = new Date(endDate);
            end.setHours(23, 59, 59, 999); 
            where.saleDate.lte = end; // less than or equal to end date
        }
    }

    // Product filtering
    if (productId) {
        where.productId = parseInt(productId);
    }

    try {
        const [sales, totalCount] = await prisma.$transaction([
            prisma.sale.findMany({
                where,
                include: {
                    product: {
                        select: { name: true, sku: true, unitPrice: true }
                    },
                    user: {
                        select: { name: true }
                    }
                },
                orderBy: {
                    saleDate: 'desc', // Most recent sales first
                },
                skip,
                take,
            }),
            prisma.sale.count({ where }),
        ]);

        res.status(200).json({
            data: sales,
            total: totalCount,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(totalCount / limit),
        });
    } catch (error) {
        handlePrismaError(res, error, 'fetching sales');
    }
};

/**
 * @route GET /api/sales/:id
 * @desc Get sale record by ID
 * @access Protected
 */
export const getSaleById = async (req, res) => {
    const { id } = req.params;

    try {
        const sale = await prisma.sale.findUnique({
            where: {
                id: parseInt(id),
            },
            include: {
                product: {
                    select: { name: true, sku: true, unitPrice: true }
                },
                user: {
                    select: { name: true }
                }
            }
        });

        if (!sale) {
            return res.status(404).json({ message: 'Sale record not found.' });
        }
        res.status(200).json(sale);
    } catch (error) {
        handlePrismaError(res, error, 'fetching sale by ID');
    }
};

/**
 * @route PUT /api/sales/:id
 * @desc Update a sale record (Note: Updating a sale should NOT automatically affect inventory as it breaks historical data integrity)
 * @access Protected
 */
export const updateSale = async (req, res) => {
    const { id } = req.params;
    const { quantitySold, unitPriceSold, saleDate, notes } = req.body;

    // IMPORTANT: In a real system, changing the quantity of a historical sale is complex 
    // and requires an inventory adjustment transaction (not just a PUT). 
    // We only allow simple metadata updates here to maintain data integrity.
    if (quantitySold !== undefined || unitPriceSold !== undefined) {
        return res.status(403).json({ 
            message: 'Historical sales quantity or price cannot be directly updated via this endpoint. Please use the inventory adjustment endpoint to correct stock levels.' 
        });
    }

    try {
        const updatedSale = await prisma.sale.update({
            where: {
                id: parseInt(id),
            },
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
 * @desc Delete a sale record (Requires inventory reversal via transaction)
 * @access Protected
 */
export const deleteSale = async (req, res) => {
    const { id } = req.params;

    try {
        // Use a transaction to ensure deletion and stock reversal are atomic
        await prisma.$transaction(async (tx) => {
            
            // 1. Get the sale record to find the product ID and quantity sold
            const saleToDelete = await tx.sale.findUnique({
                where: { id: parseInt(id) },
                select: { productId: true, quantitySold: true }
            });

            if (!saleToDelete) {
                throw new Error('SaleNotFound');
            }

            const { productId, quantitySold } = saleToDelete;
            
            // 2. Increment the product stock (reverse the sale)
            await tx.product.update({
                where: { id: productId },
                data: {
                    currentStock: {
                        increment: quantitySold,
                    },
                },
            });

            // 3. Delete the sale record
            await tx.sale.delete({
                where: { id: parseInt(id) },
            });

            // 4. Record the inventory reversal movement
            await tx.inventoryMovement.create({
                data: {
                    productId: productId,
                    type: 'SALE_REVERSAL', // Custom enum value for reversal
                    quantity: quantitySold, // Positive quantity for addition
                    description: `Sale ID ${id} deleted and inventory reversed. Stock increased by ${quantitySold}.`,
                    timestamp: new Date(),
                    userId: req.user.id,
                }
            });
        });

        res.status(204).send(); // 204 No Content
        
    } catch (error) {
        if (error.message === 'SaleNotFound') {
            return res.status(404).json({ message: 'Sale record not found.' });
        }
        handlePrismaError(res, error, 'deleting sale and reversing stock');
    }
};