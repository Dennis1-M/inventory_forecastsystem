import { beforeEach, describe, expect, it, vi } from 'vitest'
import { processSync } from '../controllers/syncController.js'

const mockRes = () => {
  const res = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

describe('processSync controller (unit)', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('returns 400 when sales array missing', async () => {
    const req = { body: {} }
    const res = mockRes()

    await processSync(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ message: 'sales array is required and cannot be empty.' })
  })

  it('handles insufficient stock', async () => {
    const tx = {
      product: { findMany: vi.fn().mockResolvedValue([{ id: 1, name: 'X', currentStock: 0 }]) }
    }
    const prismaMock = { $transaction: vi.fn().mockImplementation(async (fn) => { return await fn(tx) }) }
    vi.stubGlobal('prisma', prismaMock)

    const req = { body: { sales: [{ clientId: 'c1', items: [{ productId: 1, quantity: 1, unitPrice: 1.0 }] }] }, user: { id: 1 } }
    const res = mockRes()

    await processSync(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    // response should include results array with failure for insufficient stock
    const call = res.json.mock.calls[0][0]
    expect(call).toHaveProperty('results')
    expect(call.results[0].success).toBe(false)
  })
})