import { Download } from 'lucide-react';
import React, { useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ComposedChart,
    Legend,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import { Button, Card, CardBody, CardHeader } from '../../components/ui';
import { useSalesAnalytics } from '../../hooks';

const AnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState('30d');
  const { analytics, loading, error } = useSalesAnalytics(dateRange);

  // Use real data from API or fallback to mock
  const dailySalesData = analytics?.dailySalesData || [];

  const categoryData = analytics?.categoryData || [];

  const paymentData = analytics?.paymentData || [
    { name: 'Cash', value: 35 },
    { name: 'M-Pesa', value: 45 },
    { name: 'Card', value: 20 },
  ];

  const COLORS = ['#4f46e5', '#06b6d4', '#10b981'];

  const stats = analytics?.stats || {};

  const topProducts = analytics?.topProducts || [];

  // Transform stats object into array for rendering
  const statsArray = [
    {
      label: 'Total Products',
      value: stats.totalProducts || 0,
      change: '+0 this month'
    },
    {
      label: 'Low Stock Items',
      value: stats.lowStockItems || 0,
      change: 'Requires attention'
    },
    {
      label: 'Team Members',
      value: stats.teamMembers || 0,
      change: 'Active staff'
    },
    {
      label: 'Active Alerts',
      value: stats.activeAlerts || 0,
      change: 'Pending resolution'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-700 font-medium">Error loading analytics</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold">Charts & Graphs</h2>
          <p className="text-gray-600 mt-2">
            Comprehensive sales performance insights
            {loading && <span className="ml-2 text-indigo-600 animate-pulse">• Updating...</span>}
          </p>
        </div>
        <Button 
          label="Export Report" 
          variant="primary" 
          icon={<Download className="h-5 w-5" />}
          disabled={loading}
        />
      </div>

      {/* Date Range Selector */}
      <Card className="mb-8">
        <CardHeader title="Period" />
        <CardBody>
          <div className="flex gap-2 flex-wrap">
            {['7d', '30d', '90d', '1y'].map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                disabled={loading}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  dateRange === range
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : range === '90d' ? 'Last 90 Days' : 'Last Year'}
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsArray.map((stat: any, index: number) => (
          <Card key={index}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-green-600 text-sm mt-2">{stat.change}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Daily Sales Trend */}
        <Card>
          <CardHeader title="Daily Sales Trend" subtitle="Sales performance over time" />
          <CardBody>
            {dailySalesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={dailySalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `Ksh ${value}`} />
                  <Legend />
                  <Bar dataKey="sales" fill="#a5b4fc" radius={[8, 8, 0, 0]} />
                  <Line type="linear" dataKey="sales" stroke="#4f46e5" strokeWidth={3} dot={{ fill: '#4f46e5', r: 5 }} activeDot={{ r: 7 }} connectNulls />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No sales data available for this period
              </div>
            )}
          </CardBody>
        </Card>

        {/* Payment Method Distribution */}
        <Card>
          <CardHeader title="Payment Method Distribution" subtitle="Transaction breakdown" />
          <CardBody>
            {paymentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={paymentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                  <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No payment data available
              </div>
            )}
          </CardBody>
        </Card>

        {/* Sales by Category */}
        <Card className="lg:col-span-2">
          <CardHeader title="Sales by Category" subtitle="Performance by product category" />
          <CardBody>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value) => `Ksh ${value}`} />
                  <Legend />
                  <Bar dataKey="sales" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No category data available
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Top Products Table */}
      <Card>
        <CardHeader title="Top Products" subtitle="Best selling products" />
        <CardBody>
          {topProducts && topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((product: any, index: number) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name || 'Unknown Product'}</p>
                      <p className="text-sm text-gray-600">{product.sales || 0} units sold</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-bold text-indigo-600 text-lg">
                      {typeof product.revenue === 'number' 
                        ? `Ksh ${product.revenue.toLocaleString()}` 
                        : product.revenue || 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <div className="text-center">
                <p className="text-lg font-medium mb-2">No product data available</p>
                <p className="text-sm">Top selling products will appear here</p>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
