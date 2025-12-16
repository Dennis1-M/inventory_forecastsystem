// routes/admin.js
import { PrismaClient } from '@prisma/client';
import express from 'express';
import { adminOrSuperAdmin, protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// ====================
// TEST ENDPOINT (NO AUTH FOR TESTING)
// ====================
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Admin API is working!',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/admin/users',
      'GET /api/admin/stats',
      'GET /api/admin/system-health',
      'PATCH /api/admin/users/:id/status'
    ]
  });
});

// ====================
// USER MANAGEMENT (PROTECTED - ADMIN & SUPERADMIN ONLY)
// ====================
router.get('/users', protect, adminOrSuperAdmin, async (req, res) => {
  try {
    console.log('Admin fetching users...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
    
  } catch (error) {
    console.error('Error in /api/admin/users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// ====================
// SYSTEM STATISTICS
// ====================
router.get('/stats', protect, adminOrSuperAdmin, async (req, res) => {
  try {
    // Get counts in parallel
    const [
      totalUsers,
      totalProducts,
      totalSales,
      totalAlerts,
      activeAlerts
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.sale.count(),
      prisma.alert.count(),
      prisma.alert.count({ where: { isResolved: false } })
    ]);
    
    // Get user count by role
    const userRoles = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true
      }
    });
    
    const byRole = {};
    userRoles.forEach(role => {
      byRole[role.role] = role._count.id;
    });
    
    // Get low stock products
    const lowStockProducts = await prisma.product.findMany({
      where: {
        currentStock: {
          lte: prisma.product.fields.lowStockThreshold
        }
      },
      take: 5,
      select: {
        id: true,
        name: true,
        sku: true,
        currentStock: true,
        lowStockThreshold: true
      }
    });
    
    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          byRole: byRole
        },
        products: {
          total: totalProducts,
          lowStock: lowStockProducts.length,
          lowStockProducts: lowStockProducts
        },
        sales: {
          total: totalSales
        },
        alerts: {
          total: totalAlerts,
          active: activeAlerts
        }
      }
    });
    
  } catch (error) {
    console.error('Error in /api/admin/stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system statistics',
      error: error.message
    });
  }
});

// ====================
// SYSTEM HEALTH
// ====================
router.get('/system-health', protect, adminOrSuperAdmin, async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      success: true,
      data: {
        api_status: true,
        database_status: true,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        memory_usage: {
          rss: process.memoryUsage().rss,
          heapTotal: process.memoryUsage().heapTotal,
          heapUsed: process.memoryUsage().heapUsed,
          external: process.memoryUsage().external
        }
      }
    });
    
  } catch (error) {
    console.error('System health error:', error);
    res.status(500).json({
      success: false,
      message: 'System health check failed',
      error: error.message
    });
  }
});

// ====================
// UPDATE USER STATUS
// ====================
router.patch('/users/:id/status', protect, adminOrSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    // Validate
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean'
      });
    }
    
    // Don't allow deactivating yourself
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }
    
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isActive: isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true
      }
    });
    
    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
    
  } catch (error) {
    console.error('Error updating user status:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
});


// TEST ENDPOINT
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Admin API is working!',
    timestamp: new Date().toISOString(),
    endpoints: ['/test']
  });
});




export default router;