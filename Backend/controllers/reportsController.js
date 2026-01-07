import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/reports/manager-export
 * Export manager reports in various formats
 */
export const exportManagerReport = async (req, res) => {
  try {
    const { type = 'sales', format = 'json' } = req.body;
    const userId = req.user?.id;

    // Get user info for audit
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });

    // Verify user is manager or admin
    if (!['MANAGER', 'ADMIN', 'SUPERADMIN'].includes(user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only managers and admins can export reports',
      });
    }

    let data = {};

    switch (type) {
      case 'sales':
        data = await getSalesReport();
        break;
      case 'inventory':
        data = await getInventoryReport();
        break;
      case 'staff-performance':
        data = await getStaffPerformanceReport();
        break;
      case 'alerts':
        data = await getAlertsReport();
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type',
        });
    }

    // Log the export activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'EXPORT',
        description: `Exported ${type} report in ${format} format`,
        status: 'success',
        timestamp: new Date(),
      },
    });

    // Return based on format
    if (format === 'csv') {
      return res.csv(data, `${type}-report.csv`);
    }

    res.json({
      success: true,
      reportType: type,
      format,
      generatedAt: new Date().toISOString(),
      generatedBy: user?.email,
      data,
    });
  } catch (error) {
    console.error('Error exporting report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export report',
      error: error.message,
    });
  }
};

/**
 * POST /api/reports/admin-export
 * Export admin-level reports
 */
export const exportAdminReport = async (req, res) => {
  try {
    const { type = 'system', format = 'json' } = req.body;

    // Verify admin-only access
    if (!['ADMIN', 'SUPERADMIN'].includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    let data = {};

    switch (type) {
      case 'system':
        data = await getSystemReport();
        break;
      case 'users':
        data = await getUsersReport();
        break;
      case 'audit':
        data = await getAuditReport();
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type',
        });
    }

    res.json({
      success: true,
      reportType: type,
      format,
      generatedAt: new Date().toISOString(),
      data,
    });
  } catch (error) {
    console.error('Error exporting admin report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export admin report',
      error: error.message,
    });
  }
};

// Helper functions
async function getSalesReport() {
  const sales = await prisma.sale.findMany({
    include: {
      items: {
        include: {
          product: { select: { name: true } },
        },
      },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 500,
  });

  return {
    totalSales: sales.length,
    totalRevenue: sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0),
    sales: sales.map((s) => ({
      date: s.createdAt,
      items: s.items.map((i) => ({
        product: i.product?.name,
        quantity: i.quantity,
        amount: i.total,
      })),
      totalAmount: s.totalAmount,
      paymentMethod: s.paymentMethod,
      staff: s.user?.name,
    })),
  };
}

async function getInventoryReport() {
  const movements = await prisma.inventoryMovement.findMany({
    include: {
      product: { select: { name: true } },
      user: { select: { name: true } },
    },
    orderBy: { timestamp: 'desc' },
    take: 500,
  });

  return {
    totalMovements: movements.length,
    movements: movements.map((m) => ({
      date: m.timestamp,
      product: m.product?.name,
      type: m.type,
      quantity: m.quantity,
      description: m.description,
      user: m.user?.name,
    })),
  };
}

async function getStaffPerformanceReport() {
  const staffSales = await prisma.sale.groupBy({
    by: ['userId'],
    _count: { id: true },
    _sum: { totalAmount: true },
  });

  const staffDetails = await prisma.user.findMany({
    where: { role: 'STAFF' },
    select: { id: true, name: true, email: true },
  });

  return {
    totalStaff: staffDetails.length,
    performance: staffSales.map((stat) => {
      const staff = staffDetails.find((s) => s.id === stat.userId);
      return {
        staff: staff?.name,
        salesCount: stat._count.id,
        totalRevenue: stat._sum.totalAmount || 0,
      };
    }),
  };
}

async function getAlertsReport() {
  const alerts = await prisma.alert.findMany({
    include: { product: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 500,
  });

  return {
    totalAlerts: alerts.length,
    alerts: alerts.map((a) => ({
      date: a.createdAt,
      type: a.type,
      product: a.product?.name,
      message: a.message,
      resolved: a.resolved,
    })),
  };
}

async function getSystemReport() {
  const users = await prisma.user.count();
  const products = await prisma.product.count();
  const sales = await prisma.sale.count();

  return {
    systemHealth: 'operational',
    timestamp: new Date(),
    statistics: {
      totalUsers: users,
      totalProducts: products,
      totalSales: sales,
    },
  };
}

async function getUsersReport() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return {
    totalUsers: users.length,
    users,
  };
}

async function getAuditReport() {
  const logs = await prisma.activityLog.findMany({
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: { timestamp: 'desc' },
    take: 1000,
  });

  return {
    totalLogs: logs.length,
    logs: logs.map((l) => ({
      timestamp: l.timestamp,
      user: l.user?.email,
      action: l.action,
      description: l.description,
      status: l.status,
    })),
  };
}
