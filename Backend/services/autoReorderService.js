import prisma from '../config/prisma.js';

/**
 * Auto-Reorder Service
 * Automatically creates purchase orders when stock falls below reorder point
 */

export const checkAndCreateAutoReorders = async () => {
  try {
    console.log('🔄 Checking for auto-reorder triggers...');

    // Find all products with auto-reorder enabled and a supplier
    const productsWithAutoReorder = await prisma.product.findMany({
      where: {
        autoReorderEnabled: true,
        supplierId: { not: null }, // Must have a supplier
      },
      include: {
        supplier: true,
      },
    });

    // Filter products where currentStock <= reorderPoint
    const productsNeedingReorder = productsWithAutoReorder.filter(
      product => product.currentStock <= product.reorderPoint
    );

    if (productsNeedingReorder.length === 0) {
      console.log('✅ No products need auto-reordering');
      return { success: true, ordersCreated: 0 };
    }

    console.log(`📦 Found ${productsNeedingReorder.length} products needing reorder`);

    // Group products by supplier to create bulk orders
    const ordersBySupplier = {};
    
    for (const product of productsNeedingReorder) {
      // Check if there's already a pending order for this product
      const existingPendingOrder = await prisma.purchaseOrderItem.findFirst({
        where: {
          productId: product.id,
          purchaseOrder: {
            status: 'PENDING',
          },
        },
      });

      if (existingPendingOrder) {
        console.log(`⏭️  Skipping ${product.name} - pending order exists`);
        continue;
      }

      const supplierId = product.supplierId;
      if (!ordersBySupplier[supplierId]) {
        ordersBySupplier[supplierId] = [];
      }

      ordersBySupplier[supplierId].push({
        productId: product.id,
        productName: product.name,
        quantity: product.reorderQuantity,
        unitPrice: product.costPrice || 0,
      });
    }

    // Create purchase orders for each supplier
    const ordersCreated = [];
    
    for (const [supplierId, items] of Object.entries(ordersBySupplier)) {
      const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      
      // Expected delivery in 7 days
      const expectedDeliveryDate = new Date();
      expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 7);

      const purchaseOrder = await prisma.purchaseOrder.create({
        data: {
          supplierId: parseInt(supplierId),
          expectedDeliveryDate,
          totalAmount,
          status: 'PENDING',
          notes: `Auto-generated order - ${items.length} items below reorder point`,
          items: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
        include: {
          supplier: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      ordersCreated.push(purchaseOrder);

      // Create activity log
      await prisma.activityLog.create({
        data: {
          userId: 1, // System user
          action: 'CREATE',
          description: `Auto-reorder: Created PO #${purchaseOrder.id} for ${items.map(i => i.productName).join(', ')}`,
          status: 'success',
          timestamp: new Date(),
        },
      });

      // Auto-resolve related alerts (low stock alerts) since action has been taken
      for (const item of items) {
        const resolvedCount = await prisma.alert.updateMany({
          where: {
            productId: item.productId,
            type: { in: ['LOW_STOCK', 'OUT_OF_STOCK'] },
            isResolved: false,
          },
          data: {
            isResolved: true,  // Auto-resolve since auto-order created
            isRead: true,
            message: prisma.raw(`message || ' (Auto-order PO#${purchaseOrder.id} created)'`),
          },
        });
        
        if (resolvedCount.count > 0) {
          console.log(`✅ Auto-resolved ${resolvedCount.count} alert(s) for ${item.productName}`);
        }
      }

      console.log(`✅ Created auto-order PO#${purchaseOrder.id} for supplier: ${purchaseOrder.supplier.name}`);
    }

    return {
      success: true,
      ordersCreated: ordersCreated.length,
      orders: ordersCreated,
    };
  } catch (error) {
    console.error('❌ Auto-reorder error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Toggle auto-reorder for a product
 */
export const toggleProductAutoReorder = async (productId, enabled) => {
  return await prisma.product.update({
    where: { id: productId },
    data: { autoReorderEnabled: enabled },
  });
};

/**
 * Update auto-reorder settings for a product
 */
export const updateAutoReorderSettings = async (productId, settings) => {
  const { reorderPoint, reorderQuantity, autoReorderEnabled } = settings;
  
  return await prisma.product.update({
    where: { id: productId },
    data: {
      ...(reorderPoint !== undefined && { reorderPoint }),
      ...(reorderQuantity !== undefined && { reorderQuantity }),
      ...(autoReorderEnabled !== undefined && { autoReorderEnabled }),
    },
  });
};

export default {
  checkAndCreateAutoReorders,
  toggleProductAutoReorder,
  updateAutoReorderSettings,
};
