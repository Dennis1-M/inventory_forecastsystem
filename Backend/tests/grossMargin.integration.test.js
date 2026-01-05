import request from 'supertest'
import prisma from '../config/prisma.js'
import app from '../server.js'

beforeAll(async () => {
  // create a product and a sale with known cost and price
  await prisma.product.createMany({ data: [{ sku: 'GM-001', name: 'GM Product', unitPrice: 300, costPrice: 200, currentStock: 10, categoryId: 1 }], skipDuplicates: true })
  const p = await prisma.product.findUnique({ where: { sku: 'GM-001' } })

  await prisma.sale.create({ data: { totalAmount: 600, paymentMethod: 'CASH', userId: 1, items: { create: [{ productId: p.id, quantity: 2, unitPrice: 300, total: 600 }] } } })
})

afterAll(async () => {
  await prisma.saleItem.deleteMany({ where: { } })
  await prisma.sale.deleteMany({ where: { } })
  await prisma.product.deleteMany({ where: { sku: 'GM-001' } })
  await prisma.$disconnect()
})

describe('Gross margin report', () => {
  test('returns product and category margins', async () => {
    const res = await request(app).get('/api/manager/reports/gross-margin')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty('productMargins')
    expect(res.body.data.productMargins.length).toBeGreaterThan(0)
  })
})
