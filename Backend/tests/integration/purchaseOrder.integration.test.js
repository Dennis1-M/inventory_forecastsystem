import jwt from 'jsonwebtoken'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import prisma from '../../config/prisma.js'
import app from '../../server.js'

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123'

describe('Integration: purchase orders and receiving', () => {
  let token
  let adminUser
  let supplier
  let category
  let product
  let po

  beforeAll(async () => {
    adminUser = await prisma.user.create({ data: { name: 'po-admin', email: `po-admin-${Date.now()}@test`, password: 'x', role: 'ADMIN' } })
    token = jwt.sign({ id: adminUser.id }, JWT_SECRET)

    // create supplier
    supplier = await prisma.supplier.create({ data: { name: `Supp-${Date.now()}` } })

    // ensure category
    const cat = await prisma.category.create({ data: { name: `Cat-${Date.now()}` } })
    category = cat

    // create product
    const prod = await prisma.product.create({ data: { name: `PO Prod ${Date.now()}`, sku: `PO-${Date.now()}`, unitPrice: 10.0, categoryId: cat.id, currentStock: 0 } })
    product = prod
  })

  afterAll(async () => {
    try {
      await prisma.purchaseOrderItem.deleteMany({ where: { productId: product.id } })
      await prisma.purchaseOrder.deleteMany({ where: { supplierId: supplier.id } })
      await prisma.inventoryMovement.deleteMany({ where: { productId: product.id } })
      await prisma.product.delete({ where: { id: product.id } })
      await prisma.supplier.delete({ where: { id: supplier.id } })
      await prisma.category.delete({ where: { id: category.id } })
      await prisma.user.delete({ where: { id: adminUser.id } })
    } catch (err) {
      // ignore
    }
    await prisma.$disconnect()
  })

  it('creates a purchase order', async () => {
    const res = await request(app)
      .post('/api/purchase-orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ supplierId: supplier.id, expectedDate: new Date().toISOString(), items: [{ productId: product.id, quantity: 5, unitCost: 4.0 }] })

    expect(res.status).toBe(201)
    expect(res.body.po).toBeTruthy()
    po = res.body.po
  })

  it('receives the purchase order and updates stock and cost', async () => {
    // fetch PO item id
    const poDetail = await request(app).get(`/api/purchase-orders/${po.id}`).set('Authorization', `Bearer ${token}`)
    const item = poDetail.body.items[0]

    const recv = await request(app)
      .post(`/api/purchase-orders/${po.id}/receive`)
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [{ itemId: item.id, quantityReceived: 5 }] })

    expect(recv.status).toBe(200)
    const updated = await prisma.product.findUnique({ where: { id: product.id } })
    expect(updated.currentStock).toBe(5)
    expect(updated.costPrice).toBeCloseTo(4.0)
  })
})