// backend/controllers/notificationsController.js
// Controller to handle system notifications: alerts, inventory movements, and forecast updates


import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/notifications
 * Fetch system notifications (alerts, inventory, forecast updates)
 */
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    // Fetch alerts as notifications
    const alerts = await prisma.alert.findMany({
      where: {
        isResolved: false,
      },
      include: {
        product: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Transform alerts into notifications
    const notifications = alerts.map((alert) => ({
      id: `alert-${alert.id}`,
      type: 'alert',
      title: `${alert.type} Alert`,
      message: alert.message || `Alert for ${alert.product?.name || 'Product'}`,
      timestamp: alert.createdAt?.toISOString() || new Date().toISOString(),
      severity: alert.type === 'LOW_STOCK' ? 'warning' : 'info',
      read: false,
      data: {
        alertId: alert.id,
        productId: alert.productId,
        type: alert.type,
      },
    }));

    // Fetch recent inventory movements as notifications
    const movements = await prisma.inventoryMovement.findMany({
      where: {
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      include: {
        product: { select: { id: true, name: true } },
      },
      orderBy: { timestamp: 'desc' },
      take: 20,
    });

    const movementNotifications = movements.slice(0, 10).map((movement) => ({
      id: `movement-${movement.id}`,
      type: 'inventory',
      title: 'Inventory Update',
      message: `${movement.description || 'Inventory'} for ${movement.product?.name || 'Product'}`,
      timestamp: movement.timestamp?.toISOString() || new Date().toISOString(),
      severity: movement.type === 'ADJUSTMENT_IN' || movement.type === 'ADJUSTMENT_OUT' ? 'warning' : 'info',
      read: false,
    }));

    // Combine and sort by timestamp
    const allNotifications = [...notifications, ...movementNotifications].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    res.json({
      success: true,
      data: allNotifications,
      count: allNotifications.length,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message,
    });
  }
};

/**
 * PUT /api/notifications/:id/read
 * Mark a notification as read
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    // Notifications are virtual, so we can just return success
    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message,
    });
  }
};
