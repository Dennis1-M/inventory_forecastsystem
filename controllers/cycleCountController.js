import colors from 'colors'
import prisma from '../config/prisma.js'

const handleError = (res, err, op) => {
  console.error(colors.red(`Error during ${op}:`), err)
  return res.status(500).json({ message: `Failed to ${op}.`, error: err.message })
}

// POST /api/inventory/cycle-counts
// Body: { items: [{ productId, countedQuantity }], reason }
export const createCycleCount = async (req, res) => {
  const { items, reason } = req.body
  if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'items array required.' })

  try {
    const result = await prisma.$transaction(async (tx) => {
      const cycle = await tx.cycleCount.create({ data: { createdById: req.user?.id || 1, reason: reason || null } })
      const report = []

      for (const it of items) {
        const pid = Number(it.productId)
        const counted = Number(it.countedQuantity)
        if (!pid || Number.isNaN(counted)) continue

        const p = await tx.product.findUnique({ where: { id: pid }, select: { id: true, sku: true, name: true, currentStock: true, unitPrice: true } })
        if (!p) throw new Error(`ProductNotFound:${pid}`)

        const expected = p.currentStock || 0
        const delta = counted - expected
        const valueDelta = delta < 0 ? (-delta) * (p.unitPrice || 0) : 0

        // Update product stock to counted value (apply even if delta === 0 to ensure audit trail)
        if (delta !== 0) {
          await tx.product.update({ where: { id: pid }, data: { currentStock: counted } })

          const isIn = delta > 0
          await tx.inventoryMovement.create({
            data: {
              productId: pid,
              type: isIn ? 'ADJUSTMENT_IN' : 'ADJUSTMENT_OUT',
              quantity: isIn ? delta : -Math.abs(delta),
              description: reason || `Cycle count adjustment to ${counted}`,
              userId: req.user?.id || 1,
            },
          })
        }

        // Persist cycle count item
        await tx.cycleCountItem.create({ data: { cycleCountId: cycle.id, productId: pid, expectedQty: expected, countedQty: counted, delta, valueDelta } })

        report.push({ productId: pid, sku: p.sku, name: p.name, expected, counted, delta, valueDelta })
      }

      const totalShrinkageQty = report.reduce((s, r) => s + (r.delta < 0 ? -r.delta : 0), 0)
      const totalShrinkageValue = report.reduce((s, r) => s + (r.valueDelta || 0), 0)

      await tx.cycleCount.update({ where: { id: cycle.id }, data: { totalShrinkageQty, totalShrinkageValue } })

      const full = await tx.cycleCount.findUnique({ where: { id: cycle.id }, include: { items: { include: { product: true } }, createdBy: true } })

      return { cycle: full, report, totalShrinkageQty, totalShrinkageValue }
    })

    res.status(201).json({ success: true, message: 'Cycle count recorded and processed.', ...result })
  } catch (err) {
    if (err.message && err.message.startsWith('ProductNotFound')) {
      return res.status(404).json({ message: err.message })
    }
    return handleError(res, err, 'process cycle count')
  }
}

export const listCycleCounts = async (req, res) => {
  try {
    const cycles = await prisma.cycleCount.findMany({ orderBy: { createdAt: 'desc' }, include: { createdBy: { select: { id: true, name: true } } } })
    res.status(200).json({ success: true, data: cycles })
  } catch (err) {
    return handleError(res, err, 'list cycle counts')
  }
}

export const getCycleCount = async (req, res) => {
  const { id } = req.params
  try {
    const cycle = await prisma.cycleCount.findUnique({ where: { id: Number(id) }, include: { items: { include: { product: true } }, createdBy: true } })
    if (!cycle) return res.status(404).json({ message: 'Cycle count not found.' })
    res.status(200).json({ success: true, data: cycle })
  } catch (err) {
    return handleError(res, err, 'get cycle count')
  }
}
