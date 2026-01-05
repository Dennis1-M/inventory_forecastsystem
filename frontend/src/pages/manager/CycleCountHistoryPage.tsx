import { inventoryAPI } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const CycleCountHistoryPage = () => {
  const { data, isLoading } = useQuery(['cycleCounts'], inventoryAPI.getCycleCounts)
  const [selected, setSelected] = useState(null as any)

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Cycle Count History</h2>
      <div className="mb-4">
        <Link to="/manager/cycle-counts">New Cycle Count</Link>
      </div>
      <div className="space-y-3">
        {data.data && data.data.length ? data.data.map((c:any)=>(
          <div key={c.id} className="p-4 border rounded flex items-center justify-between">
            <div>
              <div className="font-semibold">Cycle #{c.id}</div>
              <div className="text-sm text-muted">By: {c.createdBy?.name || c.createdById} at {new Date(c.createdAt).toLocaleString()}</div>
              <div className="text-sm text-muted">Shrinkage: {c.totalShrinkageQty} units KES {c.totalShrinkageValue.toFixed(2)}</div>
            </div>
            <div>
              <Link className="px-3 py-1 bg-primary text-white rounded" to={`/manager/cycle-counts/${c.id}`}>View</Link>
            </div>
          </div>
        )) : <div>No cycles recorded</div>}
      </div>
    </div>
  )
}

export default CycleCountHistoryPage
