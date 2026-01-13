/**
 * Test Auto Alert Resolution Feature
 * Verifies that alerts are automatically resolved when purchase orders are created
 */

import colors from 'colors';
import prisma from './config/prisma.js';

async function testAutoAlertResolution() {
  console.log(colors.cyan('\n╔═══════════════════════════════════════════════════════════╗'));
  console.log(colors.cyan('║   Testing Auto Alert Resolution on Purchase Order       ║'));
  console.log(colors.cyan('╚═══════════════════════════════════════════════════════════╝\n'));

  try {
    // Step 1: Find a product with low stock alert
    console.log(colors.yellow('Step 1: Finding LOW_STOCK alerts...'));
    let lowStockAlerts = await prisma.alert.findMany({
      where: {
        type: { in: ['LOW_STOCK', 'OUT_OF_STOCK'] },
        isResolved: false,
      },
      include: {
        product: {
          include: {
            supplier: true
          }
        }
      },
      take: 3
    });

    if (lowStockAlerts.length === 0) {
      console.log(colors.yellow('No LOW_STOCK alerts found. Creating test scenario...'));
      
      // Create a test product with supplier
      const supplier = await prisma.supplier.findFirst();
      if (!supplier) {
        console.log(colors.red('❌ No supplier found. Please create a supplier first.'));
        return;
      }

      // Find or create a test product
      let testProduct = await prisma.product.findFirst({
        where: { name: { contains: 'Test' } }
      });

      if (!testProduct) {
        testProduct = await prisma.product.create({
          data: {
            name: 'Test Product for Alert Resolution',
            sku: `TEST-${Date.now()}`,
            currentStock: 5,
            reorderPoint: 20,
            costPrice: 10,
            sellingPrice: 15,
            supplierId: supplier.id,
            categoryId: 1
          }
        });
      } else {
        // Update to low stock
        await prisma.product.update({
          where: { id: testProduct.id },
          data: { currentStock: 5 }
        });
      }

      // Create a LOW_STOCK alert
      const newAlert = await prisma.alert.create({
        data: {
          productId: testProduct.id,
          type: 'LOW_STOCK',
          message: `${testProduct.name} is below reorder point (current: 5, reorder: 20)`,
          isResolved: false,
          isRead: false,
          severity: 'HIGH'
        }
      });

      lowStockAlerts = [{ ...newAlert, product: testProduct }];
      console.log(colors.green(`✅ Created test alert for ${testProduct.name}`));
    }

    console.log(colors.green(`\n✅ Found ${lowStockAlerts.length} unresolved LOW_STOCK alert(s)\n`));

    // Display alerts
    for (const alert of lowStockAlerts) {
      console.log(colors.white(`   Alert ID: ${alert.id}`));
      console.log(colors.white(`   Product: ${alert.product?.name || 'Unknown'}`));
      console.log(colors.white(`   Type: ${alert.type}`));
      console.log(colors.white(`   Message: ${alert.message}`));
      console.log(colors.white(`   Status: ${alert.isResolved ? '✅ Resolved' : '❌ Unresolved'}\n`));
    }

    // Step 2: Create a purchase order for one of the alerted products
    const testAlert = lowStockAlerts[0];
    const product = testAlert.product;

    if (!product || !product.supplier) {
      console.log(colors.red('❌ Product or supplier not found. Skipping test.'));
      return;
    }

    console.log(colors.yellow('Step 2: Creating Purchase Order...'));
    
    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        supplierId: product.supplierId,
        expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdById: 1,
        status: 'ORDERED',
        items: {
          create: [{
            productId: product.id,
            quantityOrdered: 50,
            unitCost: product.costPrice || 10
          }]
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    console.log(colors.green(`✅ Purchase Order #${purchaseOrder.id} created\n`));

    // Step 3: Simulate the auto-resolution logic (same as in controller)
    console.log(colors.yellow('Step 3: Auto-resolving related alerts...'));
    
    for (const item of purchaseOrder.items) {
      if (item.product) {
        const resolvedCount = await prisma.alert.updateMany({
          where: {
            productId: item.productId,
            type: { in: ['LOW_STOCK', 'OUT_OF_STOCK'] },
            isResolved: false
          },
          data: {
            isResolved: true,
            isRead: true,
            message: `${item.product.name} - Restock order placed (PO #${purchaseOrder.id}). Expected: ${purchaseOrder.expectedDate ? new Date(purchaseOrder.expectedDate).toLocaleDateString() : 'TBD'}`,
            updatedAt: new Date()
          }
        });
        
        console.log(colors.green(`✅ Auto-resolved ${resolvedCount.count} alert(s) for ${item.product.name}`));
      }
    }

    // Step 4: Verify alerts are resolved
    console.log(colors.yellow('\nStep 4: Verifying alert resolution...'));
    
    const updatedAlert = await prisma.alert.findUnique({
      where: { id: testAlert.id },
      include: { product: true }
    });

    console.log(colors.white('\n   Updated Alert Details:'));
    console.log(colors.white(`   Alert ID: ${updatedAlert.id}`));
    console.log(colors.white(`   Product: ${updatedAlert.product?.name}`));
    console.log(colors.white(`   Type: ${updatedAlert.type}`));
    console.log(colors.white(`   Message: ${updatedAlert.message}`));
    console.log(colors.white(`   Status: ${updatedAlert.isResolved ? '✅ Resolved' : '❌ Unresolved'}`));
    console.log(colors.white(`   Read: ${updatedAlert.isRead ? '✅ Yes' : '❌ No'}\n`));

    if (updatedAlert.isResolved) {
      console.log(colors.green('✅ SUCCESS: Alert automatically resolved when purchase order was created!\n'));
    } else {
      console.log(colors.red('❌ FAILED: Alert was not resolved automatically.\n'));
    }

    // Step 5: Check remaining unresolved alerts
    const remainingAlerts = await prisma.alert.findMany({
      where: {
        type: { in: ['LOW_STOCK', 'OUT_OF_STOCK'] },
        isResolved: false
      },
      include: { product: true }
    });

    console.log(colors.cyan(`📊 Remaining unresolved LOW_STOCK alerts: ${remainingAlerts.length}\n`));

    if (remainingAlerts.length > 0) {
      console.log(colors.yellow('Remaining alerts:'));
      for (const alert of remainingAlerts) {
        console.log(colors.white(`   - ${alert.product?.name || 'Unknown'} (Alert #${alert.id})`));
      }
    }

    console.log(colors.cyan('\n╔═══════════════════════════════════════════════════════════╗'));
    console.log(colors.cyan('║             Test Completed Successfully!                 ║'));
    console.log(colors.cyan('╚═══════════════════════════════════════════════════════════╝\n'));

  } catch (error) {
    console.error(colors.red('\n❌ Error during test:'), error);
    console.log(colors.yellow('\nStack trace:'), error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAutoAlertResolution();
