// backend/services/stockService.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function checkStockAlerts(productId) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return [];

  const alerts = [];

  // treat reorderLevel falling back to lowStockThreshold if null
  const reorderLevel = product.reorderLevel ?? product.lowStockThreshold ?? 10;
  if (product.currentStock <= 0) {
    alerts.push({ type: 'STOCK_OUT', message: 'Product is out of stock' });
  } else if (product.currentStock <= reorderLevel) {
    alerts.push({ type: 'LOW_STOCK', message: 'Low stock - reorder soon' });
  }

  if (product.maxStock && product.currentStock >= product.maxStock) {
    alerts.push({ type: 'OVERSTOCK', message: 'Overstock - consider promotions or halt purchases' });
  }

  // persist alerts
  for (const a of alerts) {
    await prisma.alert.create({
      data: {
        productId,
        type: a.type,
        message: a.message
      }
    });
  }

  return alerts;
}

export async function applySaleAndCheck(productId, quantity, userId = null) {
  // decrement stock (ensure no negative)
  const product = await prisma.product.findUnique({ where: { id: productId }});
  if (!product) throw new Error('Product not found');
  if (product.currentStock < quantity) throw new Error('Not enough stock');

  await prisma.product.update({
    where: { id: productId },
    data: { currentStock: { decrement: quantity } }
  });

  // record inventory movement & sale if you want
  await prisma.sale.create({
    data: {
      productId,
      quantitySold: quantity,
      saleDate: new Date(),
      unitPriceSold: product.unitPrice,
      totalSaleAmount: product.unitPrice * quantity,
      userId: userId ?? 1
    }
  });

  return await checkStockAlerts(productId);
}

export async function applyStockIn(productId, quantity, supplierId = null, userId = null) {
  await prisma.product.update({
    where: { id: productId },
    data: { currentStock: { increment: quantity } }
  });

  // create inventory movement record
  await prisma.inventoryMovement.create({
    data: {
      productId,
      type: 'RESTOCK',
      quantity: quantity,
      timestamp: new Date(),
      supplierId,
      userId: userId ?? 1,
      description: `Received ${quantity} units`
    }
  });

  return await checkStockAlerts(productId);
}
