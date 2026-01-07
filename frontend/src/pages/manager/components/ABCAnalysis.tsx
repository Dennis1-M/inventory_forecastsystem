import { BarChart3 } from 'lucide-react';

interface ABCItem {
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  category: 'A' | 'B' | 'C';
  percentOfRevenue: number;
}

const ABCAnalysis = ({ inventory }: { inventory: any[] }) => {
  const calculateABC = (): ABCItem[] => {
    if (!inventory || inventory.length === 0) return [];

    // Calculate total value for each product
    const withValue = inventory.map((item: any) => ({
      productId: item.id,
      name: item.name || 'Unknown',
      quantity: item.quantity || 0,
      unitPrice: item.unitPrice || 0,
      totalValue: (item.quantity || 0) * (item.unitPrice || 0),
    }));

    // Sort by value descending
    const sorted = withValue.sort((a, b) => b.totalValue - a.totalValue);

    // Calculate total inventory value
    const totalValue = sorted.reduce((sum, item) => sum + item.totalValue, 0);

    // Assign categories
    let cumulativePercent = 0;
    return sorted.map((item: any) => {
      const percentOfRevenue = totalValue > 0 ? (item.totalValue / totalValue) * 100 : 0;
      cumulativePercent += percentOfRevenue;

      let category: 'A' | 'B' | 'C' = 'A';
      if (cumulativePercent > 80) category = 'B';
      if (cumulativePercent > 95) category = 'C';

      return {
        ...item,
        percentOfRevenue: Math.round(percentOfRevenue * 100) / 100,
        category,
      };
    });
  };

  const items = calculateABC();
  const categoryA = items.filter(i => i.category === 'A');
  const categoryB = items.filter(i => i.category === 'B');
  const categoryC = items.filter(i => i.category === 'C');

  const categoryStats = [
    {
      category: 'A',
      label: 'High Value - Focus Items',
      items: categoryA,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-300',
      recommendation: 'Strict inventory control, frequent monitoring, high service levels',
      percentage: ((categoryA.length / items.length) * 100).toFixed(1),
      revenuePercent: categoryA.reduce((sum, i) => sum + i.percentOfRevenue, 0).toFixed(1),
    },
    {
      category: 'B',
      label: 'Medium Value - Regular Items',
      items: categoryB,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-300',
      recommendation: 'Moderate control, regular reviews, standard service levels',
      percentage: ((categoryB.length / items.length) * 100).toFixed(1),
      revenuePercent: categoryB.reduce((sum, i) => sum + i.percentOfRevenue, 0).toFixed(1),
    },
    {
      category: 'C',
      label: 'Low Value - Bulk Items',
      items: categoryC,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-300',
      recommendation: 'Loose control, simple ordering, bulk purchasing strategies',
      percentage: ((categoryC.length / items.length) * 100).toFixed(1),
      revenuePercent: categoryC.reduce((sum, i) => sum + i.percentOfRevenue, 0).toFixed(1),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Pareto Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          ABC Analysis (Pareto Principle)
        </h3>

        {/* Category Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {categoryStats.map((stat) => (
            <div key={stat.category} className={`${stat.bg} border-2 ${stat.border} rounded-lg p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className={`text-xl font-bold ${stat.color}`}>Category {stat.category}</h4>
                <span className="text-3xl font-bold text-gray-400">{stat.percentage}%</span>
              </div>
              <p className="text-sm font-semibold text-gray-700 mb-3">{stat.label}</p>
              <div className="space-y-2 mb-4 text-sm">
                <p><span className="text-gray-600">Items:</span> <span className="font-semibold">{stat.items.length}</span></p>
                <p><span className="text-gray-600">Revenue Impact:</span> <span className="font-semibold text-green-700">{stat.revenuePercent}%</span></p>
              </div>
              <p className="text-xs text-gray-700 italic border-t pt-3">{stat.recommendation}</p>
            </div>
          ))}
        </div>

        {/* Visual Representation */}
        <div className="bg-gradient-to-r from-red-100 via-amber-100 to-green-100 rounded-lg p-1 mb-8">
          <div className="bg-white rounded p-4">
            <div className="flex h-12 rounded overflow-hidden shadow-inner">
              <div
                className="bg-red-500"
                style={{ width: `${Math.round((categoryA.reduce((sum, i) => sum + i.percentOfRevenue, 0) / 100) * 100)}%` }}
                title={`Category A: ${categoryA.reduce((sum, i) => sum + i.percentOfRevenue, 0).toFixed(1)}%`}
              />
              <div
                className="bg-amber-500"
                style={{ width: `${Math.round((categoryB.reduce((sum, i) => sum + i.percentOfRevenue, 0) / 100) * 100)}%` }}
                title={`Category B: ${categoryB.reduce((sum, i) => sum + i.percentOfRevenue, 0).toFixed(1)}%`}
              />
              <div
                className="bg-green-500"
                style={{ width: `${Math.round((categoryC.reduce((sum, i) => sum + i.percentOfRevenue, 0) / 100) * 100)}%` }}
                title={`Category C: ${categoryC.reduce((sum, i) => sum + i.percentOfRevenue, 0).toFixed(1)}%`}
              />
            </div>
            <p className="text-center text-xs text-gray-600 mt-2">Revenue Distribution by Category</p>
          </div>
        </div>
      </div>

      {/* Detailed Lists */}
      {categoryStats.map((stat) => (
        <div key={stat.category} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className={`${stat.bg} border-b border-gray-200 px-6 py-4`}>
            <h4 className={`text-lg font-bold ${stat.color}`}>Category {stat.category}: {stat.label}</h4>
            <p className="text-sm text-gray-600 mt-1">{stat.items.length} items • {stat.revenuePercent}% of inventory value</p>
          </div>

          {stat.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Product</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Stock</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Unit Price</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Total Value</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">% of Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stat.items.slice(0, 10).map((item) => (
                    <tr key={item.productId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 text-right text-sm text-gray-600">{item.quantity}</td>
                      <td className="px-6 py-4 text-right text-sm text-gray-600">Ksh {item.unitPrice.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Ksh {item.totalValue.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-sm">{item.percentOfRevenue}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-6 py-4 text-center text-gray-500">No items in this category</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default ABCAnalysis;
