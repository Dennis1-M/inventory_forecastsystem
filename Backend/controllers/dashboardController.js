// Backend/controllers/dashboardController.js
// Controller for admin dashboard data aggregation


import prisma from "../config/prisma.js";

export const getAdminDashboard = async (req, res) => {
  try {
    const user = req.user;
    const { period } = req.query;

    // Calculate date range based on period parameter
    let startDate = new Date();
    switch(period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30); // Default to 30 days
    }

    // Low stock using JS filter
    const allProducts = await prisma.product.findMany();
    const lowStockItems = allProducts.filter(p => p.currentStock < p.lowStockThreshold).length;

    const [totalProducts, teamMembers, activeAlerts, recentMovements, salesTrend] = await Promise.all([
      prisma.product.count(),
      prisma.user.count({
        where: { role: { not: "SUPERADMIN" }, isActive: true },
      }),
      prisma.alert.count({ where: { isResolved: false } }),
      prisma.inventoryMovement.findMany({
        take: 10,
        orderBy: { timestamp: "desc" },
        include: {
          product: { select: { id: true, name: true } },
          user: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true } },
        },
      }),
      prisma.sale.groupBy({
        by: ['createdAt'],
        _sum: { totalAmount: true },
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    // Fetch recent sales with items for analytics
    const recentSales = await prisma.sale.findMany({
      where: { createdAt: { gte: startDate } },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: { 
              select: { 
                id: true,
                name: true, 
                categoryId: true,
                category: { select: { name: true } }
              } 
            }
          }
        }
      }
    });

    // Calculate total sales amount
    const totalSalesAmount = recentSales.reduce((sum, sale) => sum + Number(sale.totalAmount || 0), 0);

    // Transform sales for frontend
    const transactions = recentSales.flatMap(sale => 
      sale.items.map(item => ({
        date: sale.createdAt,
        productName: item.product?.name || 'Unknown',
        quantity: item.quantity,
        amount: Number(item.total || 0)
      }))
    );

    // Group by category
    const byCategory = recentSales.reduce((acc, sale) => {
      sale.items.forEach(item => {
        const category = item.product?.category?.name || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = { total: 0, count: 0 };
        }
        acc[category].total += Number(item.total || 0);
        acc[category].count += 1;
      });
      return acc;
    }, {});

    // Transform sales trend for frontend charts (dailySalesData)
    const dailySalesData = salesTrend.map(trend => ({
      date: new Date(trend.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sales: Number(trend._sum?.totalAmount || 0)
    }));

    // Transform category data for frontend charts
    const categoryData = Object.entries(byCategory).map(([category, data]) => ({
      category: category,
      sales: Number(data.total || 0)
    }));

    // Calculate top products by sales
    const productSales = recentSales.reduce((acc, sale) => {
      sale.items.forEach(item => {
        const productId = item.product?.id;
        const productName = item.product?.name || 'Unknown';
        if (!acc[productId]) {
          acc[productId] = {
            id: productId,
            name: productName,
            sales: 0,
            revenue: 0
          };
        }
        acc[productId].sales += item.quantity;
        acc[productId].revenue += Number(item.total || 0);
      });
      return acc;
    }, {});

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Transform payment methods data to percentages
    const paymentCounts = recentSales.reduce((acc, sale) => {
      const method = sale.paymentMethod || 'Other';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});

    const totalPayments = recentSales.length;
    const paymentData = Object.entries(paymentCounts).map(([name, count]) => ({
      name: name,
      value: totalPayments > 0 ? Math.round((count / totalPayments) * 100) : 0
    }));

    res.json({
      stats: { totalProducts, lowStockItems, teamMembers, activeAlerts },
      recentMovements,
      salesTrend,
      // Sales analytics for frontend charts
      dailySalesData,
      categoryData,
      paymentData,
      topProducts,
      totalAmount: totalSalesAmount,
      count: recentSales.length,
      transactions,
      byCategory
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
};
