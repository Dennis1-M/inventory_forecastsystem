// Backend/controllers/purchaseOrderController.js
// Controller for managing purchase orders


import colors from 'colors'
import prisma from '../config/prisma.js'
import { emitProductUpdate } from '../sockets/index.js'

const handleError = (res, err, op) => {
  console.error(colors.red(`Error during ${op}:`), err)
  return res.status(500).json({ message: `Failed to ${op}.`, error: err.message })
}

// POST /api/purchase-orders
export const createPurchaseOrder = async (req, res) => {
  const { supplierId, expectedDate, items } = req.body
  if (!supplierId || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'supplierId and items are required.' })
  }

  try {
    const supplier = await prisma.supplier.findUnique({ where: { id: Number(supplierId) } })
    if (!supplier) return res.status(400).json({ message: 'Supplier not found.' })

    const po = await prisma.purchaseOrder.create({
      data: {
        supplierId: Number(supplierId),
        expectedDate: expectedDate ? new Date(expectedDate) : null,
        createdById: req.user?.id || 1,
        status: 'ORDERED',
        items: {
          create: items.map((it) => ({ productId: Number(it.productId), quantityOrdered: Number(it.quantity), unitCost: Number(it.unitCost) }))
        }
      },
      include: { items: { include: { product: true } } }
    })

    // Auto-resolve alerts for items in the purchase order
    // Mark LOW_STOCK and OUT_OF_STOCK alerts as resolved since reorder has been placed
    for (const item of po.items) {
      if (item.product) {
        const resolvedCount = await prisma.alert.updateMany({
          where: {
            productId: item.productId,
            type: { in: ['LOW_STOCK', 'OUT_OF_STOCK'] },
            isResolved: false
          },
          data: {
            isResolved: true,  // Auto-resolve since action taken
            isRead: true,
            message: `${item.product.name} - Restock order placed (PO #${po.id}). Expected: ${expectedDate ? new Date(expectedDate).toLocaleDateString() : 'TBD'}`,
            updatedAt: new Date()
          }
        })
        
        if (resolvedCount.count > 0) {
          console.log(colors.green(`✅ Auto-resolved ${resolvedCount.count} alert(s) for ${item.product.name}`))
        }
      }
    }

    return res.status(201).json({ message: 'Purchase order created.', po })
  } catch (err) {
    return handleError(res, err, 'create purchase order')
  }
}

// GET /api/purchase-orders
export const listPurchaseOrders = async (req, res) => {
  try {
    const pos = await prisma.purchaseOrder.findMany({ include: { supplier: true, items: { include: { product: true } }, createdBy: true }, orderBy: { createdAt: 'desc' } })
    res.json({ data: pos })
  } catch (err) {
    return handleError(res, err, 'list purchase orders')
  }
}

// GET /api/purchase-orders/:id
export const getPurchaseOrder = async (req, res) => {
  const { id } = req.params
  try {
    const po = await prisma.purchaseOrder.findUnique({ where: { id: Number(id) }, include: { supplier: true, items: { include: { product: true } }, createdBy: true } })
    if (!po) return res.status(404).json({ message: 'Purchase order not found.' })
    res.json(po)
  } catch (err) {
    return handleError(res, err, 'get purchase order')
  }
}

// POST /api/purchase-orders/:id/receive
// body: { items: [{ itemId, quantityReceived }] }
export const receivePurchaseOrder = async (req, res) => {
  const { id } = req.params
  const { items } = req.body

  if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'items array required.' })

  try {
    const result = await prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.findUnique({ where: { id: Number(id) }, include: { items: true } })
      if (!po) throw new Error('PONotFound')

      const receiptSummary = []

      for (const rec of items) {
        const itemId = Number(rec.itemId)
        const qty = Number(rec.quantityReceived)
        if (!itemId || qty <= 0) continue

        const poItem = po.items.find((i) => i.id === itemId)
        if (!poItem) throw new Error('POItemNotFound')

        const remaining = poItem.quantityOrdered - poItem.quantityReceived
        const toReceive = Math.min(remaining, qty)
        if (toReceive <= 0) continue

        // update po item
        await tx.purchaseOrderItem.update({ where: { id: itemId }, data: { quantityReceived: { increment: toReceive } } })

        // update product stock
        const product = await tx.product.update({ where: { id: poItem.productId }, data: { currentStock: { increment: toReceive } } })

        // create inventory movement
        await tx.inventoryMovement.create({ data: { productId: poItem.productId, type: 'RECEIPT', quantity: toReceive, costPrice: poItem.unitCost, userId: req.user?.id || 1, supplierId: po.supplierId } })

        // update average costPrice on product (weighted average)
        const oldQty = product.currentStock - toReceive // product is already updated
        const oldCost = product.costPrice || 0
        const newQty = oldQty + toReceive
        const newCost = newQty > 0 ? ((oldCost * oldQty) + (poItem.unitCost * toReceive)) / newQty : poItem.unitCost

        await tx.product.update({ where: { id: poItem.productId }, data: { costPrice: newCost } })

        // Auto-resolve LOW_STOCK and OUT_OF_STOCK alerts if stock is now sufficient
        if (product.currentStock > product.lowStockThreshold) {
          const resolvedAlerts = await tx.alert.updateMany({
            where: {
              productId: poItem.productId,
              type: { in: ['LOW_STOCK', 'OUT_OF_STOCK'] },
              isResolved: false
            },
            data: {
              isResolved: true,
              updatedAt: new Date()
            }
          })
          
          // Log resolved alerts count
          if (resolvedAlerts.count > 0) {
            console.log(`✅ Auto-resolved ${resolvedAlerts.count} alert(s) for product ${poItem.productId}`)
          }
        }

        // emit product update (post-transaction will ensure DB visibility)
        try { emitProductUpdate({ productId: poItem.productId, currentStock: product.currentStock }); } catch (e) { console.warn('Emit product update failed', e.message); }

        receiptSummary.push({ itemId, received: toReceive })
      }

      // Refresh PO status
      const itemsAfter = await tx.purchaseOrderItem.findMany({ where: { purchaseOrderId: po.id } })
      const allReceived = itemsAfter.every((it) => it.quantityReceived >= it.quantityOrdered)
      const anyReceived = itemsAfter.some((it) => it.quantityReceived > 0)

      const newStatus = allReceived ? 'RECEIVED' : (anyReceived ? 'PARTIALLY_RECEIVED' : 'ORDERED')
      await tx.purchaseOrder.update({ where: { id: po.id }, data: { status: newStatus } })

      return { receipt: receiptSummary, newStatus }
    })

    res.status(200).json({ message: 'PO received', result })

    // Emit PO status change and alert resolution notifications
    try {
      if (result && result.newStatus) {
        // Use a dedicated event for PO status
        const po = await prisma.purchaseOrder.findUnique({ where: { id: Number(id) }, include: { supplier: true, items: { include: { product: true } } } })
        emitProductUpdate({ type: 'po:status', poId: id, status: result.newStatus, supplier: po?.supplier?.name || null })
        
        // Emit alert resolution event for each product that had alerts resolved
        if (po && po.items) {
          for (const item of po.items) {
            if (item.product && item.product.currentStock > item.product.lowStockThreshold) {
              emitProductUpdate({ 
                type: 'alert:resolved', 
                productId: item.productId, 
                productName: item.product.name,
                alertTypes: ['LOW_STOCK', 'OUT_OF_STOCK'],
                message: `Stock replenished for ${item.product.name}. Current stock: ${item.product.currentStock}`
              })
            }
          }
        }
      }
    } catch (e) { console.warn('Emit PO status failed', e.message) }
  } catch (err) {
    if (err.message === 'PONotFound') return res.status(404).json({ message: 'Purchase order not found.' })
    if (err.message === 'POItemNotFound') return res.status(404).json({ message: 'PO item not found.' })
    return handleError(res, err, 'receive purchase order')
  }
}
