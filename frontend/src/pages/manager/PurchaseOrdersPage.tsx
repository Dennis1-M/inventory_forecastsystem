import { inventoryAPI } from '@/lib/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

const PurchaseOrdersPage = () => {
  const qc = useQueryClient()
  const { data: pos = { data: [] }, isLoading } = useQuery<{ data: any[] }>({ queryKey: ['purchaseOrders'], queryFn: inventoryAPI.getPurchaseOrders })
  const createPO = useMutation({
    mutationFn: (payload: { supplierId: number; items: any[] }) => inventoryAPI.createPurchaseOrder(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['purchaseOrders'] })
  })
  const receivePO = useMutation({
    mutationFn: ({ id, items }: { id: number; items: any[] }) => inventoryAPI.receivePurchaseOrder(id, items),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['purchaseOrders'] })
  })

  // Fetch products and suppliers for selectors
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: inventoryAPI.getProducts,
  })
  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: inventoryAPI.getUsers,
  })

  const [supplierId, setSupplierId] = useState('')
  const [poItems, setPoItems] = useState([{ productId: '', quantity: 1, unitCost: 0 }])

  const addItemRow = () => setPoItems([...poItems, { productId: '', quantity: 1, unitCost: 0 }])
  const updateItem = (idx:number, field:string, value:any) => { const s = [...poItems]; (s[idx] as any)[field] = value; setPoItems(s) }

  const handleCreate = async () => {
    try {
      const items = poItems.map((it:any) => ({ productId: Number(it.productId), quantity: Number(it.quantity), unitCost: Number(it.unitCost) }))
      await createPO.mutateAsync({ supplierId: Number(supplierId), items })
      setSupplierId('')
    } catch (e:any) {
      alert('Invalid items')
    }
  }

  const [receiveInputs, setReceiveInputs] = useState<Record<number, number>>({})

  const handleReceive = async (po:any) => {
    const items = po.items.map((it:any) => ({ itemId: it.id, quantityReceived: Number(receiveInputs[it.id] ?? (it.quantityOrdered - it.quantityReceived)) }))
    if (!items.length) return
    await receivePO.mutateAsync({ id: po.id, items })
    setReceiveInputs({})
  }

  if (isLoading) return <div>Loading POs...</div>

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Purchase Orders</h2>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded">
          <h3 className="font-semibold">Create Purchase Order</h3>
          <div className="mt-2">
            <label className="text-sm">Supplier</label>
            <select value={supplierId} onChange={(e)=>setSupplierId(e.target.value)} className="w-full border rounded p-2">
              <option value="">Select supplier</option>
              {suppliers.map((s:any)=>(<option key={s.id} value={s.id}>{s.name}</option>))}
            </select>
          </div>

          <div className="mt-2">
            <label className="text-sm">Items</label>
            {poItems.map((row, idx)=>(
              <div key={idx} className="grid grid-cols-3 gap-2 mt-2">
                <select value={row.productId} onChange={(e)=>updateItem(idx, 'productId', e.target.value)} className="border rounded p-2">
                  <option value="">Select product</option>
                  {products.map((p:any)=>(<option key={p.id} value={p.id}>{p.name} ({p.sku})</option>))}
                </select>
                <input type="number" value={row.quantity} onChange={(e)=>updateItem(idx, 'quantity', e.target.value)} className="border rounded p-2" />
                <input type="number" value={row.unitCost} onChange={(e)=>updateItem(idx, 'unitCost', e.target.value)} className="border rounded p-2" />
              </div>
            ))}
            <div className="mt-2"><button className="px-2 py-1 bg-secondary rounded" onClick={addItemRow}>Add item</button></div>

          </div>

          <button className="mt-2 px-3 py-1 bg-primary text-white rounded" onClick={handleCreate}>Create PO</button>
        </div>
      </div>

      <div className="space-y-3">
        {pos.data && pos.data.length ? pos.data.map((po:any)=>(
          <div key={po.id} className="p-4 border rounded">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">PO #{po.id} - {po.status}</div>
                <div className="text-sm text-muted">Supplier: {po.supplier?.name || 'N/A'}</div>
                <div className="text-sm text-muted">Created: {new Date(po.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex gap-2">
                {(po.status === 'ORDERED' || po.status === 'PARTIALLY_RECEIVED') && <button className="px-3 py-1 bg-mpesa text-white rounded" onClick={()=>handleReceive(po)}>Receive Remaining</button>}
              </div>
            </div>

            <div className="mt-3">
              <table className="w-full text-sm">
                <thead>
                  <tr><th>Item</th><th>Ordered</th><th>Received</th><th>UnitCost</th><th>Receive</th></tr>
                </thead>
                <tbody>
                  {po.items.map((it:any)=>(<tr key={it.id}><td>{it.product?.name || it.productId}</td><td>{it.quantityOrdered}</td><td>{it.quantityReceived}</td><td>{it.unitCost}</td><td><input type="number" defaultValue={it.quantityOrdered - it.quantityReceived} onChange={(e)=>setReceiveInputs({...receiveInputs, [it.id]: Number(e.target.value)})} className="border p-1 w-20" /></td></tr>))}
                </tbody>
              </table>
            </div>
          </div>
        )) : <div>No purchase orders found.</div>}
      </div>
    </div>
  )
}

export default PurchaseOrdersPage
