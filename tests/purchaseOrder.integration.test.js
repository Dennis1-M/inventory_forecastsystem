import request from 'supertest'
import prisma from '../config/prisma.js'
import app from '../server.js'

let supplier, product, token

beforeAll(async () => {
  // ensure supplier and product exist
  supplier = await prisma.supplier.upsert({ where: { name: 'Test Supplier' }, update: {}, create: { name: 'Test Supplier' } })
  product = await prisma.product.upsert({ where: { sku: 'PO-PR-001' }, update: {}, create: { sku: 'PO-PR-001', name: 'PO Product', unitPrice: 200, costPrice: 120, currentStock: 0, categoryId: 1, supplierId: supplier.id } })

  // create admin user and token for protected routes
  const user = await prisma.user.create({ data: { name: 'po-int-admin', email: `po-int-admin-${Date.now()}@test`, password: 'x', role: 'ADMIN' } })
  token = require('jsonwebtoken').sign({ id: user.id }, process.env.JWT_SECRET || 'supersecretkey123')
})

afterAll(async () => {
  await prisma.purchaseOrderItem.deleteMany({ where: { productId: product.id } })
  await prisma.purchaseOrder.deleteMany({ where: { supplierId: supplier.id } })
  // delete inventory movements referencing the product first
  await prisma.inventoryMovement.deleteMany({ where: { productId: product.id } })
  await prisma.product.deleteMany({ where: { sku: 'PO-PR-001' } })
  await prisma.supplier.deleteMany({ where: { name: 'Test Supplier' } })
  await prisma.$disconnect()
})

describe('Purchase Order receive flow', () => {
  test('create and receive purchase order', async () => {
    const createRes = await request(app).post('/api/purchase-orders').set('Authorization', `Bearer ${token}`).send({ supplierId: supplier.id, items: [{ productId: product.id, quantity: 5, unitCost: 100 }] })
    expect(createRes.status).toBe(201)
    const po = createRes.body.po

    const receiveRes = await request(app).post(`/api/purchase-orders/${po.id}/receive`).set('Authorization', `Bearer ${token}`).send({ items: [{ itemId: po.items[0].id, quantityReceived: 5 }] })
    expect(receiveRes.status).toBe(200)
    const updatedProduct = await prisma.product.findUnique({ where: { id: product.id } })
    expect(updatedProduct.currentStock).toBeGreaterThanOrEqual(5)
  })
})
