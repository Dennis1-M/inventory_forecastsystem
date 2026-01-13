import request from 'supertest'
import prisma from '../config/prisma.js'
import app from '../server.js'

let token = null

let productId

beforeAll(async () => {
  // Create a test product and capture its id
  await prisma.product.createMany({ data: [
    { sku: 'TC-001', name: 'Test Product A', unitPrice: 100, costPrice: 60, currentStock: 10, categoryId: 1 }
  ], skipDuplicates: true })

  const p = await prisma.product.findUnique({ where: { sku: 'TC-001' } })
  productId = p.id

  // create manager user for protected endpoints
  const user = await prisma.user.create({ data: { name: 'tc-manager', email: `tc-manager-${Date.now()}@test`, password: 'x', role: 'MANAGER' } })
  token = require('jsonwebtoken').sign({ id: user.id }, process.env.JWT_SECRET || 'supersecretkey123')
})

afterAll(async () => {
  // Clean up created cycle counts and products
  await prisma.cycleCountItem.deleteMany({})
  await prisma.cycleCount.deleteMany({})
  // delete related inventory movements first to satisfy FK
  await prisma.inventoryMovement.deleteMany({ where: { product: { sku: 'TC-001' } } })
  await prisma.product.deleteMany({ where: { sku: { in: ['TC-001'] } } })
  await prisma.$disconnect()
})

describe('Cycle Count endpoints', () => {
  test('Create cycle count and persist items', async () => {
    const res = await request(app)
      .post('/api/inventory/cycle-counts')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [{ productId: productId, countedQuantity: 8 }], reason: 'Test cycle' })
      .set('Accept', 'application/json')

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('cycle')
    expect(res.body.cycle).toHaveProperty('items')
    expect(res.body.totalShrinkageQty).toBeGreaterThanOrEqual(0)
  })

  test('List cycle counts', async () => {
    const res = await request(app).get('/api/inventory/cycle-counts').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('data')
  })
})
