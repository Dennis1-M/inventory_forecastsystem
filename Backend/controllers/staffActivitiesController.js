// Backend/controllers/staffActivitiesController.js
// Controller for managing staff member activities and work logs


import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/staff-activities
 * Fetch staff member activities and work logs
 */
export const getStaffActivities = async (req, res) => {
  try {
    const { staffId, limit = 50 } = req.query;

    // Build where clause
    let whereClause = {
      user: {
        role: 'STAFF',
      },
    };

    if (staffId) {
      whereClause.userId = parseInt(staffId);
    }

    // Fetch sales records as staff activities
    const sales = await prisma.sale.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true },
            },
          },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit) || 50,
    });

    // Transform sales into staff activities
    const activities = sales.map((sale) => ({
      id: `sale-${sale.id}`,
      staffId: sale.userId,
      staffName: sale.user?.name,
      staffEmail: sale.user?.email,
      type: 'sale',
      action: 'Sale',
      description: `Processed sale with ${sale.items?.length || 0} item(s)`,
      timestamp: sale.createdAt?.toISOString(),
      details: {
        saleId: sale.id,
        items: sale.items.map((i) => ({
          productId: i.productId,
          productName: i.product?.name,
          quantity: i.quantity,
          amount: i.total,
        })),
        totalAmount: sale.totalAmount,
      },
    }));

    // Fetch inventory movements by staff
    const movements = await prisma.inventoryMovement.findMany({
      where: {
        user: {
          role: 'STAFF',
        },
        ...(staffId && { userId: parseInt(staffId) }),
      },
      include: {
        product: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { timestamp: 'desc' },
      take: 20,
    });

    const movementActivities = movements.map((movement) => ({
      id: `movement-${movement.id}`,
      staffId: movement.userId,
      staffName: movement.user?.name,
      staffEmail: movement.user?.email,
      type: 'inventory',
      action: movement.type || 'Inventory Update',
      description: movement.description,
      timestamp: movement.timestamp?.toISOString(),
      details: {
        movementId: movement.id,
        productId: movement.productId,
        quantity: movement.quantity,
      },
    }));

    // Combine and sort
    const allActivities = [...activities, ...movementActivities].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    res.json({
      success: true,
      data: allActivities,
      count: allActivities.length,
    });
  } catch (error) {
    console.error('Error fetching staff activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch staff activities',
      error: error.message,
    });
  }
};

/**
 * GET /api/staff-activities/:staffId
 * Fetch activities for a specific staff member
 */
export const getStaffMemberActivities = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { limit = 50 } = req.query;

    const staffUser = await prisma.user.findUnique({
      where: { id: parseInt(staffId) },
    });

    if (!staffUser) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found',
      });
    }

    // Fetch sales
    const sales = await prisma.sale.findMany({
      where: { userId: parseInt(staffId) },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
    });

    const activities = sales.map((sale) => ({
      id: `sale-${sale.id}`,
      type: 'sale',
      description: `Processed sale with ${sale.items?.length || 0} item(s)`,
      timestamp: sale.createdAt?.toISOString(),
      details: {
        items: sale.items.map((i) => i.product?.name).join(', '),
        quantity: sale.items?.reduce((sum, i) => sum + i.quantity, 0) || 0,
        amount: sale.totalAmount,
      },
    }));

    res.json({
      success: true,
      staff: {
        id: staffUser.id,
        name: staffUser.name,
        email: staffUser.email,
      },
      data: activities,
      count: activities.length,
    });
  } catch (error) {
    console.error('Error fetching staff activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch staff activities',
      error: error.message,
    });
  }
};
