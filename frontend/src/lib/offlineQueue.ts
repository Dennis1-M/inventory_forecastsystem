// Minimal offline queue using IndexedDB (no external deps)
// Provides: enqueueSale, getQueue, clearQueue, processQueue

const DB_NAME = 'pos-offline-db'
const STORE_NAME = 'sales-queue'
const DB_VERSION = 1

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (ev) => {
      const db = (ev.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function enqueueSale(sale: any) {
  const db = await openDb()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.add({ sale, createdAt: Date.now() })
    tx.oncomplete = () => { resolve() }
    tx.onerror = () => reject(tx.error)
  })
}

export async function getQueue() {
  const db = await openDb()
  return new Promise<any[]>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const req = store.getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function clearQueue(ids: number[]) {
  if (!ids || ids.length === 0) return
  const db = await openDb()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    ids.forEach((id) => store.delete(id))
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function processQueue({ endpoint = '/api/sync', token }: { endpoint?: string; token?: string } = {}) {
  const items = await getQueue()
  if (!items || items.length === 0) return { results: [] }

  const sales = items.map((i) => ({ clientId: i.id, ...i.sale }))

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ sales }),
  })

  if (!res.ok) throw new Error('sync_failed')

  const json = await res.json()

  // remove successful ones (by clientId == id)
  const successIds = []
  if (json && json.results) {
    json.results.forEach((r) => { if (r.success) successIds.push(Number(r.clientId)) })
  }

  await clearQueue(successIds)
  return json
}
