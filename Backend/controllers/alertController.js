import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper function to handle common try/catch logic
const handleControllerError = (res, error, message) => {
    console.error(message, error);
    res.status(500).json({ 
        message: message || "Internal server error.", 
        error: error.message || "An unknown error occurred." 
    });
};

/**
 * GET list of products currently below their low stock threshold.
 */
export const getLowStockAlerts = async (req, res) => {
    const userId = req.user.id;

    try {
        // Find all products and their associated inventory for the user
        const productsWithInventory = await prisma.product.findMany({
            where: { userId: userId },
            select: {
                id: true,
                name: true,
                lowStockThreshold: true,
                unitPrice: true,
                category: { select: { name: true } },
                inventory: { 
                    where: { userId: userId }, // Should only be one per product due to composite key
                    select: { quantity: true } 
                }
            }
        });

        // Filter the results in memory to identify low stock items
        const lowStockAlerts = productsWithInventory
            .filter(product => {
                const currentStock = product.inventory[0]?.quantity || 0;
                return currentStock <= product.lowStockThreshold;
            })
            .map(product => ({
                productId: product.id,
                productName: product.name,
                currentStock: product.inventory[0]?.quantity || 0,
                threshold: product.lowStockThreshold,
                category: product.category.name,
                // Add an alert message
                alertMessage: `${product.name} is critically low (Stock: ${product.inventory[0]?.quantity || 0}, Threshold: ${product.lowStockThreshold}).`
            }));

        res.status(200).json(lowStockAlerts);
    } catch (error) {
        handleControllerError(res, error, "Failed to retrieve low stock alerts.");
    }
};