import { Calendar, DollarSign, Package, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge, Button, Card, CardBody, CardHeader, Loading } from '../../components/ui';
import apiService from '../../services/api';

interface SalesData {
  id: number;
  totalAmount: number;
  createdAt: string;
  paymentMethod: string;
  items: Array<{
    productId: number;
    quantity: number;
    unitPrice: number;
    total: number;
    product: {
      name: string;
      sku: string;
      category?: { name: string };
    };
  }>;
  user?: {
    name: string;
    role?: string;
  };
}

interface SalesMetrics {
  totalRevenue: number;
  totalTransactions: number;
  averageOrderValue: number;
  itemsSold: number;
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  categoryBreakdown: Array<{ category: string; revenue: number; percentage: number }>;
  paymentMethods: Array<{ method: string; count: number; percentage: number }>;
  dailyTrend: Array<{ date: string; revenue: number; transactions: number }>;
  hourlyDistribution: Array<{ hour: string; transactions: number }>;
  topStaff: Array<{ name: string; sales: number; revenue: number }>;
}

const SalesAnalyticsPage = () => {
  const [sales, setSales] = useState<SalesData[]>([]);
  const [metrics, setMetrics] = useState<SalesMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('7d');

  useEffect(() => {
    fetchSalesData();
  }, [dateRange]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate date filter
      const now = new Date();
      let startDate: Date | null = null;
      
      if (dateRange === '7d') {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (dateRange === '30d') {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else if (dateRange === '90d') {
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      }

      // Fetch sales data
      const params = startDate ? { startDate: startDate.toISOString() } : {};
      const response = await apiService.get('/sales', { params });
      const salesData: SalesData[] = response.data?.data || [];
      setSales(salesData);

      // Calculate metrics
      calculateMetrics(salesData);
    } catch (err: any) {
      console.error('Error fetching sales:', err);
      setError(err.message || 'Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (salesData: SalesData[]) => {
    if (salesData.length === 0) {
      setMetrics(null);
      return;
    }

    // Total revenue and transactions
    const totalRevenue = salesData.reduce((sum, sale) => sum + Number(sale.totalAmount || 0), 0);
    const totalTransactions = salesData.length;
    const averageOrderValue = totalRevenue / totalTransactions;

    // Total items sold
    const itemsSold = salesData.reduce((sum, sale) => 
      sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );

    // Top products by quantity and revenue
    const productMap = new Map<string, { quantity: number; revenue: number }>();
    salesData.forEach(sale => {
      sale.items.forEach(item => {
        const existing = productMap.get(item.product.name) || { quantity: 0, revenue: 0 };
        productMap.set(item.product.name, {
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + Number(item.total || 0)
        });
      });
    });
    const topProducts = Array.from(productMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Category breakdown
    const categoryMap = new Map<string, number>();
    salesData.forEach(sale => {
      sale.items.forEach(item => {
        const category = item.product.category?.name || 'Uncategorized';
        categoryMap.set(category, (categoryMap.get(category) || 0) + Number(item.total || 0));
      });
    });
    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, revenue]) => ({
        category,
        revenue,
        percentage: (revenue / totalRevenue) * 100
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Payment methods
    const paymentMap = new Map<string, number>();
    salesData.forEach(sale => {
      const method = sale.paymentMethod || 'Unknown';
      paymentMap.set(method, (paymentMap.get(method) || 0) + 1);
    });
    const paymentMethods = Array.from(paymentMap.entries())
      .map(([method, count]) => ({
        method,
        count,
        percentage: (count / totalTransactions) * 100
      }))
      .sort((a, b) => b.count - a.count);

    // Daily trend (last 7 days)
    const dailyMap = new Map<string, { revenue: number; transactions: number }>();
    salesData.forEach(sale => {
      const date = new Date(sale.createdAt).toLocaleDateString();
      const existing = dailyMap.get(date) || { revenue: 0, transactions: 0 };
      dailyMap.set(date, {
        revenue: existing.revenue + Number(sale.totalAmount || 0),
        transactions: existing.transactions + 1
      });
    });
    const dailyTrend = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Hourly distribution
    const hourlyMap = new Map<number, number>();
    salesData.forEach(sale => {
      const hour = new Date(sale.createdAt).getHours();
      hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
    });
    const hourlyDistribution = Array.from(hourlyMap.entries())
      .map(([hour, transactions]) => ({
        hour: `${hour}:00`,
        transactions
      }))
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

    // Top performing staff (only STAFF role)
    const staffMap = new Map<string, { sales: number; revenue: number }>();
    salesData.forEach(sale => {
      // Only include users with STAFF role or if role is not provided (backward compatibility)
      if (sale.user && (!sale.user.role || sale.user.role === 'STAFF')) {
        const staffName = sale.user.name || 'Unknown';
        const existing = staffMap.get(staffName) || { sales: 0, revenue: 0 };
        staffMap.set(staffName, {
          sales: existing.sales + 1,
          revenue: existing.revenue + Number(sale.totalAmount || 0)
        });
      }
    });
    const topStaff = Array.from(staffMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    setMetrics({
      totalRevenue,
      totalTransactions,
      averageOrderValue,
      itemsSold,
      topProducts,
      categoryBreakdown,
      paymentMethods,
      dailyTrend,
      hourlyDistribution,
      topStaff
    });
  };

  if (loading) return <Loading />;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!metrics) return <div className="p-6 text-gray-500">No sales data available for the selected period</div>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold">Sales Analytics</h2>
          <p className="text-gray-600 mt-2">
            Comprehensive insights into your sales performance
            {loading && <span className="ml-2 text-indigo-600 animate-pulse">• Updating...</span>}
          </p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', 'all'] as const).map((range) => (
            <Button
              key={range}
              label={range === 'all' ? 'All Time' : `Last ${range.slice(0, -1)} Days`}
              variant={dateRange === range ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setDateRange(range)}
              disabled={loading}
            />
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-8 w-8 text-green-600" />
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-gray-600 text-sm">Total Revenue</p>
            <p className="text-3xl font-bold text-green-600">Ksh {metrics.totalRevenue.toLocaleString()}</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-gray-600 text-sm">Total Transactions</p>
            <p className="text-3xl font-bold text-blue-600">{metrics.totalTransactions.toLocaleString()}</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-gray-600 text-sm">Avg Order Value</p>
            <p className="text-3xl font-bold text-purple-600">Ksh {metrics.averageOrderValue.toFixed(0)}</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Package className="h-8 w-8 text-amber-600" />
            </div>
            <p className="text-gray-600 text-sm">Items Sold</p>
            <p className="text-3xl font-bold text-amber-600">{metrics.itemsSold.toLocaleString()}</p>
          </div>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Products */}
        <Card>
          <CardHeader title="🏆 Top 5 Products" subtitle="By revenue generated" />
          <CardBody>
            <div className="space-y-4">
              {metrics.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.quantity} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">Ksh {product.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader title="📊 Sales by Category" subtitle="Revenue distribution" />
          <CardBody>
            <div className="space-y-3">
              {metrics.categoryBreakdown.map((cat, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{cat.category}</span>
                    <span className="text-sm text-gray-600">{cat.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                  <div className="text-right text-sm font-semibold text-green-600">
                    Ksh {cat.revenue.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Payment Methods & Top Staff */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Payment Methods */}
        <Card>
          <CardHeader title="💳 Payment Methods" subtitle="Transaction distribution" />
          <CardBody>
            <div className="space-y-4">
              {metrics.paymentMethods.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge label={payment.method} variant="info" size="sm" />
                    <span className="text-gray-600">{payment.percentage.toFixed(1)}%</span>
                  </div>
                  <span className="font-bold">{payment.count} transactions</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Top Staff */}
        <Card>
          <CardHeader title="🌟 Top Performing Staff" subtitle="By total revenue" />
          <CardBody>
            <div className="space-y-4">
              {metrics.topStaff.map((staff, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{staff.name}</p>
                      <p className="text-sm text-gray-600">{staff.sales} sales</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">Ksh {staff.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Daily Trend & Hourly Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trend */}
        <Card>
          <CardHeader title="📈 Daily Sales Trend" subtitle="Revenue & transaction volume" />
          <CardBody>
            <div className="space-y-3">
              {metrics.dailyTrend.slice(-7).map((day, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{day.date}</p>
                      <p className="text-sm text-gray-600">{day.transactions} transactions</p>
                    </div>
                  </div>
                  <p className="font-bold text-green-600">Ksh {day.revenue.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Peak Hours */}
        <Card>
          <CardHeader title="⏰ Peak Sales Hours" subtitle="Transaction distribution by hour" />
          <CardBody>
            <div className="space-y-2">
              {metrics.hourlyDistribution.slice(0, 10).map((hour, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{hour.hour}</span>
                    <span className="text-sm font-semibold">{hour.transactions} sales</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full"
                      style={{ 
                        width: `${(hour.transactions / Math.max(...metrics.hourlyDistribution.map(h => h.transactions))) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default SalesAnalyticsPage;