import prisma from "../config/prisma.js";

export const getAdminDashboard = async (req, res) => {
  try {
    const user = req.user;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Low stock using JS filter
    const allProducts = await prisma.product.findMany();
    const lowStockItems = allProducts.filter(p => p.currentStock < p.lowStockThreshold).length;

    const [totalProducts, teamMembers, activeAlerts, recentMovements, salesTrend] = await Promise.all([
      prisma.product.count(),
      prisma.user.count({
        where: user.role === "MANAGER"
          ? { createdBy: user.id, isActive: true }
          : { role: { not: "SUPERADMIN" }, isActive: true },
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
        by: ['saleDate'],
        _sum: { totalSaleAmount: true },
        where: { saleDate: { gte: sevenDaysAgo } },
        orderBy: { saleDate: 'asc' },
      }),
    ]);

    // Fetch recent sales with items for analytics
    const recentSales = await prisma.sale.findMany({
      take: 20,
      orderBy: { saleDate: 'desc' },
      include: {
        items: {
          include: {
            product: { select: { name: true, category: true } }
          }
        }
      }
    });

    // Calculate total sales amount
    const totalSalesAmount = recentSales.reduce((sum, sale) => sum + Number(sale.totalAmount || 0), 0);

    // Transform sales for frontend
    const transactions = recentSales.flatMap(sale => 
      sale.items.map(item => ({
        date: sale.saleDate,
        productName: item.product?.name || 'Unknown',
        quantity: item.quantity,
        amount: Number(item.total || 0)
      }))
    );

    // Group by category
    const byCategory = recentSales.reduce((acc, sale) => {
      sale.items.forEach(item => {
        const category = item.product?.category || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = { total: 0, count: 0 };
        }
        acc[category].total += Number(item.total || 0);
        acc[category].count += 1;
      });
      return acc;
    }, {});

    res.json({
      stats: { totalProducts, lowStockItems, teamMembers, activeAlerts },
      recentMovements,
      salesTrend,
      // Sales analytics for admin monitoring
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
