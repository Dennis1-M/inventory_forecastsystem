import { Activity, AlertCircle, BarChart3, Target, TrendingUp } from 'lucide-react';
import React, { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Button, Card, CardBody, CardHeader, Table } from '../../components/ui';
import { useForecast } from '../../hooks';

const ForecastingPage: React.FC = () => {
  const { forecast, loading, error, refetch } = useForecast();

  // Use real data from API
  const forecastData = forecast?.forecastData || [];
  const reorderRecommendations = forecast?.reorderRecommendations || [];
  const highRiskItems = forecast?.highRiskItems || [];
  const stats = forecast?.stats || {};
  const insights = forecast?.insights || [];

  // Transform forecast data for chart visualization with confidence intervals
  // MUST be defined before any conditional returns
  const chartData = useMemo(() => {
    if (!forecastData.length) return [];
    
    // Aggregate all forecast points by period
    const periodMap = new Map<number, any>();
    
    forecastData.forEach((product: any) => {
      product.forecastPoints?.forEach((point: any) => {
        const period = point.period;
        if (!periodMap.has(period)) {
          periodMap.set(period, {
            period: `Day ${period}`,
            dayNum: period,
            predicted: [],
            lower95: [],
            upper95: [],
            count: 0,
          });
        }
        const entry = periodMap.get(period);
        entry.predicted.push(point.predicted || 0);
        if (point.lower95) entry.lower95.push(point.lower95);
        if (point.upper95) entry.upper95.push(point.upper95);
        entry.count++;
      });
    });

    // Calculate averages
    return Array.from(periodMap.values())
      .sort((a: any, b: any) => a.dayNum - b.dayNum)
      .map((entry: any) => ({
        period: entry.period,
        avgPredicted: Math.round(entry.predicted.reduce((a: number, b: number) => a + b, 0) / entry.count * 10) / 10,
        avgLower: entry.lower95.length > 0 
          ? Math.round(entry.lower95.reduce((a: number, b: number) => a + b, 0) / entry.lower95.length * 10) / 10
          : Math.round((entry.predicted.reduce((a: number, b: number) => a + b, 0) / entry.count) * 0.7 * 10) / 10,
        avgUpper: entry.upper95.length > 0
          ? Math.round(entry.upper95.reduce((a: number, b: number) => a + b, 0) / entry.upper95.length * 10) / 10
          : Math.round((entry.predicted.reduce((a: number, b: number) => a + b, 0) / entry.count) * 1.3 * 10) / 10,
      }));
  }, [forecastData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">Loading forecast...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-700 font-medium">Error loading forecast</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const tableColumns = [
    { key: 'productName', label: 'Product', width: '20%' },
    { key: 'currentStock', label: 'Current Stock', width: '12%' },
    { key: 'forecastedDemand', label: 'Forecasted Demand (14d)', width: '15%' },
    { key: 'recommendedOrder', label: 'Recommended Order', width: '15%' },
    { key: 'confidence', label: 'Confidence', width: '12%' },
    { key: 'riskLevel', label: 'Risk Level', width: '12%' },
  ];

  const tableData = reorderRecommendations.map((rec: any) => ({
    productName: rec.productName || 'Unknown',
    currentStock: `${rec.currentStock || 0} units`,
    forecastedDemand: `${rec.forecastedDemand || 0} units`,
    recommendedOrder: rec.recommendedOrder > 0 ? `${rec.recommendedOrder} units` : 'Adequate',
    confidence: (
      <span className={`font-semibold ${rec.confidence >= 80 ? 'text-green-600' : rec.confidence >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
        {rec.confidence || 0}%
      </span>
    ),
    riskLevel: (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        rec.riskLevel === 'HIGH'
          ? 'bg-red-100 text-red-700'
          : rec.riskLevel === 'MEDIUM'
          ? 'bg-amber-100 text-amber-700'
          : 'bg-green-100 text-green-700'
      }`}>
        {rec.riskLevel || 'LOW'}
      </span>
    ),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold">Demand Forecasting</h2>
          <p className="text-gray-600 mt-2">AI-powered demand predictions with 95% confidence intervals</p>
        </div>
        <Button
          label="Refresh Forecast"
          variant="primary"
          icon={<TrendingUp className="h-5 w-5" />}
          onClick={refetch}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Products</p>
                <p className="text-2xl font-bold mt-1">{stats.totalProducts || 0}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">With Forecasts</p>
                <p className="text-2xl font-bold mt-1">{stats.productsWithForecasts || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg Confidence</p>
                <p className="text-2xl font-bold mt-1">{stats.averageConfidence || 0}%</p>
              </div>
              <Target className="h-8 w-8 text-indigo-500 opacity-50" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">At Risk</p>
                <p className="text-2xl font-bold mt-1 text-red-600">{stats.productsAtRisk || 0}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500 opacity-50" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Need Reorder</p>
                <p className="text-2xl font-bold mt-1 text-amber-600">{stats.productsNeedingReorder || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-500 opacity-50" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Forecast Chart with Confidence Intervals */}
      <Card className="mb-8">
        <CardHeader
          title="Aggregate Demand Forecast (14-Day)"
          subtitle="Predicted demand with 95% confidence intervals (lower/upper bounds)"
          action={
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp className="h-4 w-4" />
              {stats.averageConfidence || 0}% average confidence
            </div>
          }
        />
        <CardBody>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => value ? `${Math.round(value * 10) / 10}` : 'N/A'}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="avgLower"
                  stackId="confidence"
                  stroke="none"
                  fill="#10b981"
                  fillOpacity={0.2}
                  name="95% Lower Bound"
                />
                <Area
                  type="monotone"
                  dataKey="avgPredicted"
                  stackId="main"
                  stroke="#3b82f6"
                  fill="url(#colorPredicted)"
                  strokeWidth={2}
                  name="Predicted Demand"
                />
                <Area
                  type="monotone"
                  dataKey="avgUpper"
                  stackId="confidence"
                  stroke="none"
                  fill="#10b981"
                  fillOpacity={0.2}
                  name="95% Upper Bound"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-500">
              No forecast data available yet. Please generate forecasts.
            </div>
          )}
        </CardBody>
      </Card>

      {/* High Risk Items */}
      {highRiskItems.length > 0 && (
        <Card className="mb-8 border-2 border-red-200">
          <CardHeader
            title="🚨 High-Risk Items (Stockout Alert)"
            subtitle="Products likely to run out of stock during forecasted period"
          />
          <CardBody>
            <div className="space-y-3">
              {highRiskItems.slice(0, 5).map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <p className="font-semibold text-red-900">{item.productName}</p>
                    <p className="text-sm text-red-700">
                      Current: {item.currentStock} units | Demand: {Math.round(item.forecastedDemand)} units
                      {item.daysToStockout && ` | Stockout in ~${item.daysToStockout} days`}
                    </p>
                  </div>
                  <Button label="Reorder Now" variant="primary" />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Reorder Recommendations */}
      {reorderRecommendations.length > 0 && (
        <Card className="mb-8">
          <CardHeader
            title="📦 Reorder Recommendations"
            subtitle="Intelligent restocking suggestions based on demand forecast"
            action={
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <AlertCircle className="h-4 w-4" />
                {reorderRecommendations.length} items need attention
              </div>
            }
          />
          <CardBody>
            <Table columns={tableColumns} data={tableData} />
          </CardBody>
        </Card>
      )}

      {/* Forecast Insights */}
      <Card>
        <CardHeader 
          title="📊 Forecast Insights"
          subtitle="Key observations from the forecast analysis"
        />
        <CardBody>
          <div className="space-y-3">
            {insights.length > 0 ? (
              insights.map((insight: any, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="mt-1">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5"></div>
                  </div>
                  <p className="text-gray-700 text-sm">{insight}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No insights available yet.</p>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default ForecastingPage;