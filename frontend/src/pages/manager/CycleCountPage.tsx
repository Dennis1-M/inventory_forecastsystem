import { inventoryAPI } from '@/lib/api'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'

const CycleCountPage = () => {
  const { data: products = [], isLoading } = useQuery<any[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products')
      const json = await res.json()
      return json.data || json
    }
  })

  const [counts, setCounts] = useState<Record<number, number>>({})
  const [reason, setReason] = useState('Cycle count')
  const [report, setReport] = useState<any>(null)

  const postCount = useMutation<any, Error, { items: { productId: number; countedQuantity: number }[]; reason: string }>({
    mutationFn: (payload: { items: { productId: number; countedQuantity: number }[]; reason: string }) => inventoryAPI.postCycleCount(payload),
    onSuccess: (data: any) => setReport(data)
  })

  const handleSubmit = async () => {
    const items = Object.keys(counts).map((k) => ({ productId: Number(k), countedQuantity: Number(counts[Number(k)]) }))
    if (!items.length) return alert('No counts provided')
    await postCount.mutateAsync({ items, reason })
  }

  if (isLoading) return <div>Loading products...</div>

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Cycle Count</h2>
      <div className="mb-4">
        <label className="text-sm">Reason</label>
        <input value={reason} onChange={(e)=>setReason(e.target.value)} className="w-full border rounded p-2" />
      </div>

      <div className="space-y-2 max-h-96 overflow-auto">
        {products.map((p:any)=>(
          <div key={p.id} className="flex items-center gap-4 border-b py-2">
            <div className="w-64">{p.name} ({p.sku})</div>
            <div>Current: {p.currentStock}</div>
            <div>
              <input className="border p-1 w-24" type="number" defaultValue={p.currentStock} onChange={(e)=>setCounts({...counts, [p.id]: Number(e.target.value)})} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <button className="px-3 py-1 bg-primary text-white rounded" onClick={handleSubmit}>Submit Cycle Count</button>
      </div>

      {report && (
        <div className="mt-6 p-4 border rounded bg-muted">
          <h3 className="font-semibold">Shrinkage Report</h3>
          <div>Total Shrinkage Qty: {report.totalShrinkageQty}</div>
          <div>Total Shrinkage Value: {report.totalShrinkageValue}</div>
          <div className="mt-2">
            {report.report.map((r:any)=>(<div key={r.productId}>{r.name}: expected {r.expected} counted {r.counted} delta {r.delta}</div>))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CycleCountPage
