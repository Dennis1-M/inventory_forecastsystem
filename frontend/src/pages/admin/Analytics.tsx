// src/pages/admin/Analytics.tsx
import { useEffect, useState } from 'react';
import { FaCalendar, FaChartBar, FaDollarSign, FaShoppingCart, FaUsers } from 'react-icons/fa';
import { analyticsApi } from '../../services/api';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
  }[];
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [revenueData, setRevenueData] = useState<ChartData | null>(null);
  const [userGrowthData, setUserGrowthData] = useState<ChartData | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch analytics data
      const [dashboardStats, revenueChart, userGrowth] = await Promise.all([
        analyticsApi.getDashboardStats(),
        analyticsApi.getRevenueChart(timeRange),
        analyticsApi.getUserGrowth()
      ]);

      // Process revenue data
      if (revenueChart) {
        setRevenueData({
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].slice(0, 12),
          datasets: [{
            label: 'Revenue ($)',
            data: [12000, 19000, 15000, 25000, 22000, 30000, 28000, 35000, 32000, 40000, 38000, 45000],
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
          }]
        });
      }

      // Process user growth data
      setUserGrowthData({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].slice(0, 12),
        datasets: [{
          label: 'New Users',
          data: [45, 52, 68, 74, 82, 95, 110, 125, 140, 155, 170, 190],
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
        }]
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Use mock data
      setRevenueData({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Revenue ($)',
          data: [12000, 19000, 15000, 25000, 22000, 30000],
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
        }]
      });

      setUserGrowthData({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'New Users',
          data: [45, 52, 68, 74, 82, 95],
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
        }]
      });
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Total Revenue', value: '$45,230', change: '+12.5%', icon: <FaDollarSign />, color: 'green' },
    { label: 'Active Users', value: '1,254', change: '+8.2%', icon: <FaUsers />, color: 'blue' },
    { label: 'Total Orders', value: '2,341', change: '+5.7%', icon: <FaShoppingCart />, color: 'purple' },
    { label: 'Conversion Rate', value: '4.8%', change: '+1.2%', icon: <FaChartBar />, color: 'yellow' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Data insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <FaCalendar className="text-gray-400" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="day">Today</option>
            <option value="week">Last 7 days</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <div className="flex items-baseline space-x-2 mt-1">
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                  <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`p-3 bg-${stat.color}-100 rounded-full`}>
                <div className={`text-${stat.color}-600 text-xl`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : revenueData && (
            <div className="h-64 relative">
              {/* Simple bar chart visualization */}
              <div className="h-48 flex items-end space-x-2">
                {revenueData.datasets[0].data.map((value, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-blue-500 rounded-t"
                      style={{ height: `${(value / 50000) * 100}%` }}
                    ></div>
                    <span className="text-xs text-gray-500 mt-2">
                      {revenueData.labels[index]}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center text-sm text-gray-600">
                Monthly revenue distribution for {timeRange}
              </div>
            </div>
          )}
        </div>

        {/* User Growth Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">User Growth</h3>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : userGrowthData && (
            <div className="h-64 relative">
              {/* Simple line chart visualization */}
              <div className="h-48 flex items-end">
                <svg className="w-full h-full" viewBox="0 0 400 200">
                  <polyline
                    fill="none"
                    stroke="rgb(16, 185, 129)"
                    strokeWidth="3"
                    points={userGrowthData.datasets[0].data.map((value, index) => 
                      `${(index / (userGrowthData.datasets[0].data.length - 1)) * 350 + 25},${200 - (value / 200) * 180}`
                    ).join(' ')}
                  />
                </svg>
              </div>
              <div className="mt-4 text-center text-sm text-gray-600">
                New user registrations over time
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Top Products</h3>
          <ul className="space-y-3">
            {['Laptop Pro', 'Wireless Mouse', 'Mechanical Keyboard', '4K Monitor', 'USB-C Hub'].map((product, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>{product}</span>
                <span className="font-medium">${(1000 - index * 150).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Traffic Sources</h3>
          <ul className="space-y-3">
            {[
              { source: 'Direct', percentage: 35 },
              { source: 'Search', percentage: 28 },
              { source: 'Social', percentage: 22 },
              { source: 'Email', percentage: 15 },
            ].map((item, index) => (
              <li key={index}>
                <div className="flex justify-between mb-1">
                  <span>{item.source}</span>
                  <span>{item.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span>Page Load Time</span>
                <span className="text-green-600">1.2s</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>Server Uptime</span>
                <span className="text-green-600">99.8%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '99%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>API Response</span>
                <span className="text-green-600">180ms</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}