// backend/routes/manager.js - Add these to your existing backend
import { PrismaClient } from '@prisma/client';
import express from 'express';
const router = express.Router();
const prisma = new PrismaClient();

// ====================
// MANAGER DASHBOARD
// ====================

// Get dashboard statistics
router.get('/dashboard-stats', async (req, res) => {
  try {
    // Get current user from auth middleware
    const userId = req.user.id;
    
    // Get all data in parallel
    const [
      products,
      staffUsers,
      recentSales,
      inventoryMovements,
      alerts
    ] = await Promise.all([
      prisma.product.findMany({
        include: { category: true, supplier: true }
      }),
      prisma.user.findMany({
        where: { role: { in: ['STAFF', 'MANAGER'] } }
      }),
      prisma.sale.findMany({
        where: {
          saleDate: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        include: { product: true, user: true },
        orderBy: { saleDate: 'desc' },
        take: 100
      }),
      prisma.inventoryMovement.findMany({
        where: {
          timestamp: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        include: { product: true, user: true, supplier: true },
        orderBy: { timestamp: 'desc' },
        take: 50
      }),
      prisma.alert.findMany({
        where: { isResolved: false },
        include: { product: true },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // Calculate statistics
    const pendingOrders = recentSales.filter(sale => 
      new Date(sale.saleDate).toDateString() === new Date().toDateString()
    ).length;

    const lowStockItems = products.filter(product => 
      product.currentStock <= product.lowStockThreshold
    ).length;

    const activeStaff = staffUsers.filter(user => user.isActive).length;

    const today = new Date().toDateString();
    const todayShipments = recentSales.filter(sale => 
      new Date(sale.saleDate).toDateString() === today
    ).length;

    const totalSalesValue = recentSales.reduce((sum, sale) => 
      sum + sale.totalSaleAmount, 0
    );

    const totalInventoryValue = products.reduce((sum, product) => 
      sum + (product.currentStock * product.unitPrice), 0
    );

    res.json({
      success: true,
      data: {
        pendingOrders,
        lowStockItems,
        activeStaff,
        totalStaff: staffUsers.length,
        pendingTasks: alerts.length,
        todayShipments,
        warehouseUtilization: Math.min((totalInventoryValue / 100000) * 100, 100),
        orderAccuracy: 98.5,
        totalSales: totalSalesValue,
        totalInventoryValue
      }
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ====================
// MANAGER-SPECIFIC ENDPOINTS
// ====================

// Get low stock items
router.get('/products/low-stock', async (req, res) => {
  try {
    const lowStockProducts = await prisma.product.findMany({
      where: {
        currentStock: {
          lte: prisma.product.fields.lowStockThreshold
        }
      },
      include: {
        category: true,
        supplier: true
      },
      orderBy: { currentStock: 'asc' }
    });

    res.json({ success: true, data: lowStockProducts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Record inventory adjustment (manager can adjust stock)
router.post('/inventory/adjust', async (req, res) => {
  try {
    const { productId, newStock, reason, adjustmentType } = req.body;
    const userId = req.user.id;

    // Get current product
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Calculate difference
    const difference = newStock - product.currentStock;
    const movementType = difference > 0 ? 'ADJUSTMENT_IN' : 'ADJUSTMENT_OUT';

    // Update product stock
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { currentStock: newStock }
    });

    // Record inventory movement
    const movement = await prisma.inventoryMovement.create({
      data: {
        productId,
        type: movementType,
        quantity: Math.abs(difference),
        description: reason || `Stock adjustment by manager. ${adjustmentType || ''}`,
        userId
      },
      include: {
        product: true,
        user: true
      }
    });

    // Check if we need to create alerts
    if (newStock <= product.lowStockThreshold) {
      await prisma.alert.create({
        data: {
          productId,
          type: 'LOW_STOCK',
          message: `Product ${product.name} is low on stock (${newStock} units left)`
        }
      });
    } else if (newStock >= product.overStockLimit) {
      await prisma.alert.create({
        data: {
          productId,
          type: 'OVERSTOCK',
          message: `Product ${product.name} is overstocked (${newStock} units)`
        }
      });
    }

    res.json({
      success: true,
      data: {
        product: updatedProduct,
        movement
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get staff performance (sales by staff)
router.get('/staff/performance', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const sales = await prisma.sale.groupBy({
      by: ['userId'],
      where: {
        saleDate: {
          gte: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          lte: endDate ? new Date(endDate) : new Date()
        }
      },
      _sum: {
        quantitySold: true,
        totalSaleAmount: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          totalSaleAmount: 'desc'
        }
      }
    });

    // Get user details for each staff member
    const staffPerformance = await Promise.all(
      sales.map(async (sale) => {
        const user = await prisma.user.findUnique({
          where: { id: sale.userId }
        });
        
        return {
          userId: sale.userId,
          userName: user?.name || 'Unknown',
          totalSales: sale._sum.totalSaleAmount || 0,
          totalUnits: sale._sum.quantitySold || 0,
          saleCount: sale._count.id || 0,
          averageSaleValue: (sale._sum.totalSaleAmount || 0) / (sale._count.id || 1)
        };
      })
    );

    res.json({ success: true, data: staffPerformance });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create stock request (manager requests stock from supplier)
router.post('/stock-requests', async (req, res) => {
  try {
    const { productId, quantityRequested, urgency, reason, notes } = req.body;
    const userId = req.user.id;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { supplier: true }
    });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Create stock request (you'll need to add this model to your Prisma schema)
    // For now, we'll create an alert
    const alert = await prisma.alert.create({
      data: {
        productId,
        type: 'LOW_STOCK',
        message: `STOCK REQUEST: ${product.name} - ${quantityRequested} units (${urgency} priority). Reason: ${reason}. Notes: ${notes || 'None'}`
      },
      include: { product: true }
    });

    res.json({
      success: true,
      message: 'Stock request submitted',
      data: alert
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Assign task to staff (using alerts as tasks for now)
router.post('/tasks/assign', async (req, res) => {
  try {
    const { title, description, assignedTo, priority, dueDate, taskType } = req.body;
    const createdBy = req.user.id;

    // Create an alert as a task (you should add a proper Task model)
    const alert = await prisma.alert.create({
      data: {
        productId: 0, // No product for general tasks
        type: 'LOW_STOCK', // Using LOW_STOCK as task indicator
        message: `TASK: ${title} - ${description}. Assigned to user ${assignedTo}. Priority: ${priority}. Due: ${dueDate}`
      }
    });

    res.json({
      success: true,
      message: 'Task assigned',
      data: alert
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get manager-specific reports
router.get('/reports/inventory', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        supplier: true,
        inventoryMovements: {
          take: 10,
          orderBy: { timestamp: 'desc' }
        }
      },
      orderBy: { currentStock: 'asc' }
    });

    const totalValue = products.reduce((sum, product) => 
      sum + (product.currentStock * product.unitPrice), 0
    );

    const lowStockCount = products.filter(p => p.currentStock <= p.lowStockThreshold).length;
    const overStockCount = products.filter(p => p.currentStock >= p.overStockLimit).length;

    res.json({
      success: true,
      data: {
        products,
        totalValue,
        lowStockCount,
        overStockCount,
        summary: {
          totalProducts: products.length,
          totalCategories: new Set(products.map(p => p.categoryId)).size,
          totalSuppliers: new Set(products.map(p => p.supplierId).filter(id => id)).size
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get gross margin report
// Optional query params: from (ISO date), to (ISO date)
router.get('/reports/gross-margin', async (req, res) => {
  try {
    const { from, to } = req.query;

    const where = {};
    if (from || to) {
      where.sale = {};
      if (from) where.sale.createdAt = { ...(where.sale.createdAt || {}), gte: new Date(from) };
      if (to) where.sale.createdAt = { ...(where.sale.createdAt || {}), lte: new Date(to) };
    }

    // Fetch sale items in range with product and category
    const items = await prisma.saleItem.findMany({
      where,
      include: { product: { include: { category: true } }, sale: true }
    });

    const productMap = new Map();
    let totalRevenue = 0;
    let totalCost = 0;

    for (const it of items) {
      const pid = it.productId;
      const prod = it.product;
      const revenue = (it.unitPrice || 0) * (it.quantity || 0);
      const cost = (prod?.costPrice || 0) * (it.quantity || 0);

      totalRevenue += revenue;
      totalCost += cost;

      if (!productMap.has(pid)) {
        productMap.set(pid, { productId: pid, sku: prod?.sku, name: prod?.name, category: prod?.category?.name || null, revenue: 0, cost: 0, qty: 0 });
      }

      const agg = productMap.get(pid);
      agg.revenue += revenue;
      agg.cost += cost;
      agg.qty += it.quantity;
    }

    const productMargins = Array.from(productMap.values()).map((p) => ({
      ...p,
      grossProfit: p.revenue - p.cost,
      grossMarginPercent: p.revenue > 0 ? ((p.revenue - p.cost) / p.revenue) * 100 : 0
    }));

    // Aggregate by category
    const catMap = new Map();
    for (const p of productMargins) {
      const key = p.category || 'Uncategorized';
      if (!catMap.has(key)) catMap.set(key, { category: key, revenue: 0, cost: 0, grossProfit: 0 });
      const c = catMap.get(key);
      c.revenue += p.revenue;
      c.cost += p.cost;
      c.grossProfit += p.grossProfit;
    }

    const categoryMargins = Array.from(catMap.values()).map((c) => ({
      ...c,
      grossMarginPercent: c.revenue > 0 ? (c.grossProfit / c.revenue) * 100 : 0
    }));

    res.json({ success: true, data: { productMargins, categoryMargins, totalRevenue, totalCost, totalGrossProfit: totalRevenue - totalCost } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;