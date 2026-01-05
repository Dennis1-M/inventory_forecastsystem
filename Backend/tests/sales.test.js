import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSale } from '../controllers/saleController.js'

// Mock express req/res helpers
const mockRes = () => {
  const res = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  res.send = vi.fn().mockReturnValue(res)
  return res
}

describe('createSale controller (unit)', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('returns 400 when items array is missing', async () => {
    const req = { body: {} }
    const res = mockRes()

    await createSale(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ message: 'items array is required and cannot be empty.' })
  })

  it('returns 404 when product not found', async () => {
    const mockTx = {
      product: { findMany: vi.fn().mockResolvedValue([]) }
    }

    const prismaMock = { $transaction: vi.fn().mockImplementation(async (fn) => fn(mockTx)) }
    vi.stubGlobal('prisma', prismaMock)

    const req = { body: { items: [{ productId: 999, quantity: 1, unitPrice: 1.0 }] }, user: { id: 1 } }
    const res = mockRes()

    await createSale(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ message: 'One or more products not found.' })
  })
})
