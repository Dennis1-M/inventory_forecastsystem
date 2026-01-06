import { TrendingUp } from 'lucide-react';
import { useSalesAnalytics } from '../../hooks';

const SalesMonitoringPage = () => {
  const { analytics, loading, error } = useSalesAnalytics();

  if (loading) return <div className="p-6">Loading sales data...</div>;
  if (error) return <div className="p-6 text-red-500">Error loading sales: {error}</div>;

  // Calculate metrics from analytics data
  const totalSales = analytics?.totalAmount || 0;
  const totalTransactions = analytics?.count || 0;
  const averageSale = totalTransactions > 0 ? (totalSales / totalTransactions).toFixed(2) : 0;

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Sales</p>
              <p className="text-2xl font-bold text-green-600">KES {(totalSales / 1000).toFixed(1)}K</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div>
            <p className="text-gray-500 text-sm">Total Transactions</p>
            <p className="text-2xl font-bold text-blue-600">{totalTransactions}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div>
            <p className="text-gray-500 text-sm">Average Sale</p>
            <p className="text-2xl font-bold text-indigo-600">KES {averageSale}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Sales Transactions</h3>
        </div>
        <div className="p-6">
          {analytics?.transactions && analytics.transactions.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analytics.transactions.slice(0, 10).map((transaction: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.productName || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      KES {transaction.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-gray-500">No sales transactions found</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Summary by Category</h3>
        {analytics?.byCategory && Object.keys(analytics.byCategory).length > 0 ? (
          <div className="space-y-2">
            {Object.entries(analytics.byCategory).map(([category, data]: [string, any]) => (
              <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-gray-700">{category}</span>
                <span className="font-semibold text-gray-900">KES {(data.total / 1000).toFixed(1)}K ({data.count} sales)</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No category data available</p>
        )}
      </div>
    </div>
  );
};

export default SalesMonitoringPage;
