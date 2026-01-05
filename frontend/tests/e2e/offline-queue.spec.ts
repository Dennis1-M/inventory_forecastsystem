import { expect, test } from '@playwright/test'

const BACKEND = process.env.BACKEND_BASE_URL || 'http://localhost:5001'

let adminToken: string
let product: any

// Create a fresh superadmin for E2E runs and seed a product
test.beforeAll(async () => {
  const email = `e2e-super-${Date.now()}@test`
  const password = 'password123'

  // register a superadmin (unique email per run)
  const reg = await fetch(`${BACKEND}/api/auth/register-superuser`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'E2E Super', email, password }),
  })

  let token
  if (reg.status === 201) {
    const json = await reg.json()
    token = json.token
  } else {
    // fallback: login if already exists
    const login = await fetch(`${BACKEND}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
    const j = await login.json()
    token = j.token
  }

  adminToken = token

  // create category
  const catRes = await fetch(`${BACKEND}/api/categories`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: `E2E-Cat-${Date.now()}` }) })
  const catJson = await catRes.json()
  const categoryId = (catJson && (catJson.id || catJson)) || catJson

  // create product
  const prodRes = await fetch(`${BACKEND}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: `E2E Product ${Date.now()}`, sku: `E2E-${Date.now()}`, unitPrice: 5.0, categoryId }),
  })
  const prodJson = await prodRes.json()
  product = prodJson.product || prodJson

  // set stock via admin adjust (authenticated)
  await fetch(`${BACKEND}/api/inventory/adjust`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ productId: product.id, newStock: 10, reason: 'e2e-seed' }),
  })
})

test('offline queue -> sync when online', async ({ page }) => {
  await page.goto('/staff/pos')

  // search for product
  await page.fill('input[placeholder="Search (name or sku)"]', product.name)
  await page.click('text=Search')

  // add to cart
  await page.click(`text=${product.name} >> xpath=.. >> text=Add`)

  // force queue (simulate offline)
  await page.click('text=Force Queue (Offline)')

  // verify IndexedDB has queued item
  const queued = await page.evaluate<any[]>(async () => {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('pos-offline-db')
      req.onsuccess = () => {
        const db = req.result
        const tx = db.transaction('sales-queue', 'readonly')
        const store = tx.objectStore('sales-queue')
        const r = store.getAll()
        r.onsuccess = () => resolve(r.result)
        r.onerror = () => reject(r.error)
      }
      req.onerror = () => reject(req.error)
    })
  })

  expect(Array.isArray(queued)).toBeTruthy()
  expect(queued.length).toBeGreaterThan(0)

  // Trigger sync by reading queue in page and POSTing to /api/sync with admin token
  const syncResult = await page.evaluate<{ status: number; json: any }>(async (token) => {
    const getAll = () => new Promise((resolve, reject) => {
      const req = indexedDB.open('pos-offline-db')
      req.onsuccess = () => {
        const db = req.result
        const tx = db.transaction('sales-queue', 'readonly')
        const store = tx.objectStore('sales-queue')
        const r = store.getAll()
        r.onsuccess = () => resolve(r.result)
        r.onerror = () => reject(r.error)
      }
      req.onerror = () => reject(req.error)
    })

    const items = await getAll()
    const sales = (items as any[]).map((i: any) => ({ clientId: i.id, ...i.sale }))

    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ sales })
    })

    return { status: res.status, json: await res.json() }
  }, adminToken)

  expect(syncResult.status).toBe(200)
  expect(syncResult.json.results[0].success).toBe(true)

  // verify queue cleared
  const cleared = await page.evaluate<any[]>(async () => {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('pos-offline-db')
      req.onsuccess = () => {
        const db = req.result
        const tx = db.transaction('sales-queue', 'readonly')
        const store = tx.objectStore('sales-queue')
        const r = store.getAll()
        r.onsuccess = () => resolve(r.result)
        r.onerror = () => reject(r.error)
      }
      req.onerror = () => reject(req.error)
    })
  })
  expect(cleared.length).toBe(0)

  // verify backend stock reduced by 1
  const prodResp = await (await fetch(`${BACKEND}/api/products/${product.id}`)).json()
  const fresh = prodResp.product || prodResp
  expect(fresh.currentStock).toBe(9)
})
