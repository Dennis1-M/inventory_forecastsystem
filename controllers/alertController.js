import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Shared error handler */
const handleControllerError = (res, error, message) => {
    console.error(message, error);
    res.status(500).json({
        message: message || "Internal server error.",
        error: error.message || "An unknown error occurred.",
    });
};

/**
 * GET low stock alerts (generated dynamically from Product + Inventory)
 */
export const getLowStockAlerts = async (req, res) => {
    const userId = req.user.id;

    try {
        const productsWithInventory = await prisma.product.findMany({
            where: { userId },
            select: {
                id: true,
                name: true,
                lowStockThreshold: true,
                category: { select: { name: true } },
                inventory: {
                    where: { userId },
                    select: { quantity: true },
                },
            },
        });

        const lowStockAlerts = productsWithInventory
            .filter((p) => {
                const stock = p.inventory[0]?.quantity || 0;
                return stock <= p.lowStockThreshold;
            })
            .map((p) => ({
                productId: p.id,
                productName: p.name,
                currentStock: p.inventory[0]?.quantity || 0,
                threshold: p.lowStockThreshold,
                category: p.category.name,
                alertMessage: `${p.name} is critically low (Stock: ${
                    p.inventory[0]?.quantity || 0
                }, Threshold: ${p.lowStockThreshold}).`,
            }));

        res.status(200).json(lowStockAlerts);
    } catch (error) {
        handleControllerError(res, error, "Failed to retrieve low stock alerts.");
    }
};

/**
 * GET stored alerts table (only if you store alerts in DB)
 */
export const getAlerts = async (req, res) => {
    const userId = req.user.id;
    try {
        const alerts = await prisma.alert.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json(alerts);
    } catch (error) {
        handleControllerError(res, error, "Failed to load alerts.");
    }
};

/**
 * POST create an alert
 */
export const createAlert = async (req, res) => {
    const userId = req.user.id;
    const { message, productId } = req.body;

    try {
        const alert = await prisma.alert.create({
            data: { userId, message, productId },
        });
        res.status(201).json(alert);
    } catch (error) {
        handleControllerError(res, error, "Failed to create alert.");
    }
};

/**
 * PATCH resolve an alert
 */
export const resolveAlert = async (req, res) => {
    const alertId = parseInt(req.params.id);

    try {
        const updated = await prisma.alert.update({
            where: { id: alertId },
            data: { resolved: true },
        });
        res.status(200).json(updated);
    } catch (error) {
        handleControllerError(res, error, "Failed to resolve alert.");
    }
};

/**
 * POST push alerts to client/mobile
 */
export const pushAlerts = async (req, res) => {
    try {
        // Push logic (Firebase, Websockets, etc.)
        res.status(200).json({ message: "Alerts pushed successfully." });
    } catch (error) {
        handleControllerError(res, error, "Failed to push alerts.");
    }
};
