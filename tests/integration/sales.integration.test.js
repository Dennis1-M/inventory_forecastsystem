import jwt from 'jsonwebtoken'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import prisma from '../../config/prisma.js'
import app from '../../server.js'

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123'

describe('Integration: sales & sync flows', () => {
  let token
  let adminUser
  let category
  let product

  beforeAll(async () => {
    // create admin user
    adminUser = await prisma.user.create({ data: { name: 'int-admin', email: `int-admin-${Date.now()}@test`, password: 'x', role: 'ADMIN' } })
    token = jwt.sign({ id: adminUser.id }, JWT_SECRET)

    // create category
    const catRes = await request(app).post('/api/categories').send({ name: 'IntegrationCat' })
    category = catRes.body && (catRes.body.data || catRes.body.category || catRes.body)

    // create product
    const prodRes = await request(app)
      .post('/api/products')
      .send({ name: 'Integration Product', sku: `INT-P-${Date.now()}`, unitPrice: 2.5, categoryId: category.id || category[0]?.id })

    product = prodRes.body && (prodRes.body.product || prodRes.body)

    // set stock via admin inventory adjust
    await request(app)
      .post('/api/inventory/adjust')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product.id, newStock: 10, reason: 'seed' })
  })

  afterAll(async () => {
    // cleanup created data
    try {
      await prisma.saleItem.deleteMany({ where: { productId: product.id } })
      await prisma.sale.deleteMany({ where: {} })
      await prisma.inventoryMovement.deleteMany({ where: { productId: product.id } })
      await prisma.product.delete({ where: { id: product.id } })
      await prisma.category.delete({ where: { id: category.id } })
      await prisma.user.delete({ where: { id: adminUser.id } })
    } catch (err) {
      // ignore
    }
    await prisma.$disconnect()
  })

  it('creates a sale via /api/sales and reduces stock', async () => {
    // perform sale
    const saleResp = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [{ productId: product.id, quantity: 3, unitPrice: 2.5 }], paymentMethod: 'CASH' })

    expect(saleResp.status).toBe(201)
    expect(saleResp.body).toBeTruthy()

    const prod = await prisma.product.findUnique({ where: { id: product.id } })
    expect(prod.currentStock).toBe(7)
  })

  it('processes sync queue via /api/sync and reduces stock accordingly', async () => {
    // prepare a queued sale
    const sales = [{ clientId: 'c1', paymentMethod: 'CASH', items: [{ productId: product.id, quantity: 2, unitPrice: 2.5 }] }]

    const syncResp = await request(app)
      .post('/api/sync')
      .set('Authorization', `Bearer ${token}`)
      .send({ sales })

    expect(syncResp.status).toBe(200)
    expect(syncResp.body.results[0].success).toBe(true)

    const prod = await prisma.product.findUnique({ where: { id: product.id } })
    expect(prod.currentStock).toBe(5)
  })
})