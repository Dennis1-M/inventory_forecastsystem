import { Download } from 'lucide-react';
import React, { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button, Card, CardBody, CardHeader } from '../../components/ui';
import { useSalesAnalytics } from '../../hooks';

const AnalyticsPage: React.FC = () => {
  const { analytics, loading, error } = useSalesAnalytics();
  const [dateRange, setDateRange] = useState('30d');

  // Use real data from API or fallback to mock
  const dailySalesData = analytics?.dailySalesData || [];

  const categoryData = analytics?.categoryData || [];

  const paymentData = analytics?.paymentData || [
    { name: 'Cash', value: 35 },
    { name: 'M-Pesa', value: 45 },
    { name: 'Card', value: 20 },
  ];

  const COLORS = ['#4f46e5', '#06b6d4', '#10b981'];

  const stats = analytics?.stats || [];

  const topProducts = analytics?.topProducts || [];

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
          <h2 className="text-3xl font-bold">Sales Analytics</h2>
          <p className="text-gray-600 mt-2">Comprehensive sales performance insights</p>
        </div>
        <Button label="Export Report" variant="primary" icon={<Download className="h-5 w-5" />} />
      </div>

      {/* Date Range Selector */}
      <Card className="mb-8">
        <CardHeader title="Period" />
        <CardBody>
          <div className="flex gap-2">
            {['7d', '30d', '90d', '1y'].map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  dateRange === range
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : range === '90d' ? 'Last 90 Days' : 'Last Year'}
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat: any, index: number) => (
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
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailySalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `Ksh ${value}`} />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={2} dot={{ fill: '#4f46e5' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Payment Method Distribution */}
        <Card>
          <CardHeader title="Payment Method Distribution" subtitle="Transaction breakdown" />
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentData.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Sales by Category */}
        <Card className="lg:col-span-2">
          <CardHeader title="Sales by Category" subtitle="Performance by product category" />
          <CardBody>
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
          </CardBody>
        </Card>
      </div>

      {/* Top Products Table */}
      <Card>
        <CardHeader title="Top Products" subtitle="Best selling products" />
        <CardBody>
          <div className="space-y-3">
            {topProducts.map((product: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.sales} units sold</p>
                </div>
                <p className="font-bold text-indigo-600">{product.revenue}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
