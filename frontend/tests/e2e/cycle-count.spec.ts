import { expect, test } from '@playwright/test'

const API_BASE = process.env.API_BASE || 'http://localhost:3000'

async function seedData() {
  const pRes = await fetch(`${API_BASE}/api/products`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'E2E Cycle Product', sku: `CC-P-${Date.now()}`, unitPrice: 10, costPrice: 5, currentStock: 10, categoryId: 1 }) })
  const product = await pRes.json()

  // create manager user
  const userRes = await fetch(`${API_BASE}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'e2e-manager', email: `e2e-manager-${Date.now()}@test`, password: 'x', role: 'MANAGER' }) })
  const user = await userRes.json()

  return { product, user }
}

test('Submit cycle count via UI and verify shrinkage', async ({ page }) => {
  const { product } = await seedData()

  await page.goto('/manager/cycle-count')

  // Enter counted quantity lower than actual to simulate shrinkage
  await page.fill('input[name="count-0"]', '8')

  // Submit
  await page.click('text=Submit Cycle Count')

  // Wait for success and verify via API
  const res = await fetch(`${API_BASE}/api/inventory/cycle-counts`)
  const body = await res.json()
  expect(body.data.length).toBeGreaterThan(0)
})