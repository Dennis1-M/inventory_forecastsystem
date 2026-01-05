import { inventoryAPI } from '@/lib/api'
import { useEffect, useState } from 'react'

const GrossMarginPage = () => {
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    (async ()=>{
      setLoading(true)
      const res = await inventoryAPI.getGrossMarginReport()
      setReport(res.data)
      setLoading(false)
    })()
  },[])

  if (loading) return <div>Loading gross margin report...</div>

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Gross Margin Report</h2>
      {!report && <div>No data</div>}

      {report && (
        <div>
          <h3 className="font-semibold mt-2">Top Products</h3>
          <table className="w-full text-sm mb-4">
            <thead><tr><th>Product</th><th>Revenue</th><th>Cost</th><th>Gross Profit</th><th>Margin %</th></tr></thead>
            <tbody>
              {report.productMargins.map((p:any)=>(<tr key={p.productId}><td>{p.name}</td><td>{p.revenue.toFixed(2)}</td><td>{p.cost.toFixed(2)}</td><td>{p.grossProfit.toFixed(2)}</td><td>{p.grossMarginPercent.toFixed(2)}%</td></tr>))}
            </tbody>
          </table>

          <h3 className="font-semibold mt-2">By Category</h3>
          <table className="w-full text-sm">
            <thead><tr><th>Category</th><th>Revenue</th><th>Cost</th><th>Gross Profit</th><th>Margin %</th></tr></thead>
            <tbody>
              {report.categoryMargins.map((c:any)=>(<tr key={c.category}><td>{c.category}</td><td>{c.revenue.toFixed(2)}</td><td>{c.cost.toFixed(2)}</td><td>{c.grossProfit.toFixed(2)}</td><td>{c.grossMarginPercent.toFixed(2)}%</td></tr>))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default GrossMarginPage
