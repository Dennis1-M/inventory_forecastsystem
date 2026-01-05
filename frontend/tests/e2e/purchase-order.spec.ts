import { expect, test } from '@playwright/test'

// E2E: Purchase Order creation and receive flow
// Assumes Backend running at http://localhost:3000 and Frontend at http://localhost:5173

const API_BASE = process.env.API_BASE || 'http://localhost:3000'

async function seedData() {
  // create supplier
  const supRes = await fetch(`${API_BASE}/api/suppliers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'E2E Supplier' }) })
  const supplier = await supRes.json()

  // create product
  const prodRes = await fetch(`${API_BASE}/api/products`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'E2E Product', sku: `E2E-P-${Date.now()}`, unitPrice: 10, costPrice: 6, currentStock: 0, categoryId: 1, supplierId: supplier.id }) })
  const product = await prodRes.json()

  // create admin user and token by hitting /api/auth/register or user creation
  const userRes = await fetch(`${API_BASE}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'e2e-admin', email: `e2e-admin-${Date.now()}@test`, password: 'x', role: 'ADMIN' }) })
  const user = await userRes.json()

  return { supplier, product, user }
}

test('Create and receive PO via UI', async ({ page }) => {
  const { supplier, product } = await seedData()

  // Open PO page
  await page.goto('/manager/purchase-orders')

  // Select supplier
  await page.selectOption('select', { value: String(supplier.id) })

  // Select product in first row
  await page.selectOption('select:nth-of-type(2)', { value: String(product.id) })

  // enter quantity
  await page.fill('input[type=number]', '5')

  // create PO
  await page.click('text=Create PO')

  // wait for PO to appear
  await page.waitForSelector(`text=PO #`)

  // Click Receive Remaining
  await page.click('text=Receive Remaining')

  // wait for stock to reflect (backend call) and check product via API
  const prodResp = await fetch(`${API_BASE}/api/products/${product.id}`)
  const prodBody = await prodResp.json()
  expect(prodBody.product.currentStock).toBeGreaterThanOrEqual(5)
})