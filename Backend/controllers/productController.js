import colors from 'colors';
import { prisma } from '../index.js'; // Assuming prisma client is initialized and exported from index.js

// --- Helper function for error handling ---
const handlePrismaError = (res, error, operation) => {
    console.error(colors.red(`Prisma Error during ${operation}:`), error);
    if (error.code === 'P2002') {
        return res.status(409).json({ message: 'A product with that SKU or name already exists.' });
    }
    if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Product not found.' });
    }
    if (error.code === 'P2003') {
        return res.status(400).json({ message: 'Invalid Category ID or Supplier ID provided.' });
    }
    return res.status(500).json({ message: `Failed to ${operation} due to a server error.` });
};

/**
 * @route POST /api/products
 * @desc Create a new product
 * @access Protected
 */
export const createProduct = async (req, res) => {
    // Note: initial stock is set via the Inventory module, not here.
    const { name, sku, description, unitPrice, categoryId, supplierId, lowStockThreshold } = req.body;

    // Validate required fields
    if (!name || !sku || unitPrice === undefined || categoryId === undefined) {
        return res.status(400).json({ message: 'Product name, SKU, unit price, and category are required.' });
    }

    try {
        const newProduct = await prisma.product.create({
            data: {
                name,
                sku,
                description: description || null,
                unitPrice: parseFloat(unitPrice),
                categoryId: parseInt(categoryId),
                supplierId: supplierId ? parseInt(supplierId) : null,
                lowStockThreshold: lowStockThreshold !== undefined ? parseInt(lowStockThreshold) : 10, // Default threshold
                currentStock: 0, // Products start with 0 stock, stock is added via inventory/receive
            },
        });
        res.status(201).json(newProduct);
    } catch (error) {
        handlePrismaError(res, error, 'creating product');
    }
};

/**
 * @route GET /api/products
 * @desc Get all products (with optional filtering/searching)
 * @access Protected
 */
export const getProducts = async (req, res) => {
    const { search, category, supplier, page = 1, limit = 25 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build the filtering conditions
    let where = {};
    if (search) {
        // Search by name or SKU
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
        ];
    }
    if (category) {
        where.categoryId = parseInt(category);
    }
    if (supplier) {
        where.supplierId = parseInt(supplier);
    }

    try {
        const [products, totalCount] = await prisma.$transaction([
            prisma.product.findMany({
                where,
                include: {
                    category: true, // Include category details
                    supplier: true, // Include supplier details
                },
                orderBy: {
                    name: 'asc',
                },
                skip,
                take,
            }),
            prisma.product.count({ where }),
        ]);

        res.status(200).json({
            data: products,
            total: totalCount,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(totalCount / limit),
        });
    } catch (error) {
        handlePrismaError(res, error, 'fetching products');
    }
};

/**
 * @route GET /api/products/:id
 * @desc Get product by ID
 * @access Protected
 */
export const getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await prisma.product.findUnique({
            where: {
                id: parseInt(id),
            },
            include: {
                category: true,
                supplier: true,
            },
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        res.status(200).json(product);
    } catch (error) {
        handlePrismaError(res, error, 'fetching product by ID');
    }
};

/**
 * @route PUT /api/products/:id
 * @desc Update product details
 * @access Protected
 */
export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, sku, description, unitPrice, categoryId, supplierId, lowStockThreshold } = req.body;

    try {
        const updatedProduct = await prisma.product.update({
            where: {
                id: parseInt(id),
            },
            data: {
                ...(name && { name }),
                ...(sku && { sku }),
                ...(description !== undefined && { description: description || null }),
                ...(unitPrice !== undefined && { unitPrice: parseFloat(unitPrice) }),
                ...(categoryId !== undefined && { categoryId: parseInt(categoryId) }),
                ...(supplierId !== undefined && { supplierId: supplierId ? parseInt(supplierId) : null }),
                ...(lowStockThreshold !== undefined && { lowStockThreshold: parseInt(lowStockThreshold) }),
            },
        });
        res.status(200).json(updatedProduct);
    } catch (error) {
        handlePrismaError(res, error, 'updating product');
    }
};

/**
 * @route DELETE /api/products/:id
 * @desc Delete a product
 * @access Protected
 */
export const deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.product.delete({
            where: {
                id: parseInt(id),
            },
        });
        // Note: Prisma cascade delete rules (set in schema) should handle related Sales and Inventory movements.
        res.status(204).send();
    } catch (error) {
        if (error.code === 'P2003') {
             // This might happen if cascade rules are not set correctly, or if there's a unique constraint on something
            return res.status(400).json({ 
                message: 'Cannot delete product. Associated data (e.g., sales history) still references this product.' 
            });
        }
        handlePrismaError(res, error, 'deleting product');
    }
};