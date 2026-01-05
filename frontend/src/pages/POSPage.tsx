import { useAuth } from '@/contexts/AuthContext'
import { useOfflineSync } from '@/hooks/useOfflineSync'
import api from '@/lib/axiosClient'
import { enqueueSale } from '@/lib/offlineQueue'
import { useState } from 'react'

export default function POSPage() {
  const { token } = useAuth()
  useOfflineSync({ token })

  const [q, setQ] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [cart, setCart] = useState<any[]>([])
  const [message, setMessage] = useState<string | null>(null)

  const search = async () => {
    try {
      const res = await api.get(`/products?q=${encodeURIComponent(q)}`)
      setResults(res.data.data || res.data)
    } catch (err: any) {
      setMessage('Search failed')
    }
  }

  const addToCart = (product: any) => {
    const existing = cart.find((c) => c.product.id === product.id)
    if (existing) {
      setCart(cart.map((c) => (c.product.id === product.id ? { ...c, qty: c.qty + 1 } : c)))
    } else {
      setCart([...cart, { product, qty: 1, unitPrice: product.unitPrice }])
    }
  }

  const checkout = async ({ offline = false } = {}) => {
    if (!cart.length) return setMessage('Cart is empty')

    const items = cart.map((c) => ({ productId: c.product.id, quantity: c.qty, unitPrice: c.unitPrice }))

    // If offline or browser indicates offline, enqueue
    if (!navigator.onLine || offline) {
      await enqueueSale({ items, paymentMethod: 'CASH' })
      setCart([])
      setMessage('Sale queued for sync when online')
      return
    }

    try {
      const res = await api.post('/sales', { items, paymentMethod: 'CASH' }, { headers: { Authorization: `Bearer ${token}` } })
      if (res.status === 201) {
        setCart([])
        setMessage('Sale recorded successfully')
      }
    } catch (err) {
      // fallback to enqueue
      await enqueueSale({ items, paymentMethod: 'CASH' })
      setCart([])
      setMessage('Offline or server error — sale queued for sync')
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>POS — Cashier</h2>
      <div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search (name or sku)" />
        <button onClick={search}>Search</button>
      </div>

      <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
        <div style={{ flex: 1 }}>
          <h3>Results</h3>
          <ul>
            {results.map((p) => (
              <li key={p.id}>
                {p.name} — <b>{p.currentStock}</b> in stock — ${p.unitPrice.toFixed(2)}{' '}
                <button onClick={() => addToCart(p)}>Add</button>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ width: 340 }}>
          <h3>Cart</h3>
          <ul>
            {cart.map((c) => (
              <li key={c.product.id}>
                {c.product.name} x {c.qty} — ${ (c.unitPrice * c.qty).toFixed(2) }
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 8 }}>
            <button onClick={() => checkout()}>Checkout (Online)</button>{' '}
            <button onClick={() => checkout({ offline: true })}>Force Queue (Offline)</button>
          </div>

          {message && <div style={{ marginTop: 8, color: 'green' }}>{message}</div>}
        </div>
      </div>
    </div>
  )
}
