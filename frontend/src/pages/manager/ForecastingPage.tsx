import { AlertCircle, TrendingUp } from 'lucide-react';
import React from 'react';
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { Button, Card, CardBody, CardHeader, Table } from '../../components/ui';
import { useForecast } from '../../hooks';

const ForecastingPage: React.FC = () => {
  const { forecast, loading, error } = useForecast();

  // Use real data from API or fallback to mock
  const forecastData = forecast?.forecastData || [];

  const reorderRecommendations = forecast?.reorderRecommendations || [];

  const stats = forecast?.stats || [];

  const insights = forecast?.insights || [];

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
    { key: 'currentStock', label: 'Current Stock', width: '15%' },
    { key: 'predictedDemand', label: 'Predicted Demand', width: '15%' },
    { key: 'reorderQuantity', label: 'Reorder Qty', width: '15%' },
    { key: 'reorderDate', label: 'Reorder Date', width: '15%' },
    { key: 'confidence', label: 'Confidence', width: '12%' },
    { key: 'priority', label: 'Priority', width: '8%' },
  ];

  const tableData = reorderRecommendations.map((rec: any) => ({
    productName: rec.productName,
    currentStock: `${rec.currentStock} units`,
    predictedDemand: `${rec.predictedDemand} units`,
    reorderQuantity: `${rec.reorderQuantity} units`,
    reorderDate: rec.reorderDate,
    confidence: <span className="font-semibold text-indigo-600">{rec.confidence}</span>,
    priority: (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
        rec.priority === 'High'
          ? 'bg-red-100 text-red-700'
          : rec.priority === 'Medium'
          ? 'bg-amber-100 text-amber-700'
          : 'bg-green-100 text-green-700'
      }`}>
        {rec.priority}
      </span>
    ),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold">Demand Forecasting</h2>
          <p className="text-gray-600 mt-2">AI-powered demand predictions and reorder recommendations</p>
        </div>
        <Button
          label="Refresh Forecast"
          variant="primary"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <div>
              <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-green-600 text-sm mt-2">{stat.trend}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Forecast Chart */}
      <Card className="mb-8">
        <CardHeader
          title="Demand Forecast"
          subtitle="Actual vs Predicted sales for the next 4 weeks"
          action={
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp className="h-4 w-4" />
              Projection with 92% confidence
            </div>
          }
        />
        <CardBody>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip
                formatter={(value: any) => (value ? `${value} units` : 'N/A')}
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981' }}
                name="Actual Sales"
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#f59e0b' }}
                name="Predicted Demand"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      {/* Reorder Recommendations */}
      <Card>
        <CardHeader
          title="Reorder Recommendations"
          subtitle="Intelligent restocking suggestions based on demand forecast"
          action={
            <div className="flex items-center gap-2 text-sm text-amber-600">
              <AlertCircle className="h-4 w-4" />
              2 urgent recommendations
            </div>
          }
        />
        <CardBody>
          <Table columns={tableColumns} data={tableData} />
        </CardBody>
      </Card>

      {/* Insights */}
      <Card className="mt-8">
        <CardHeader title="Forecast Insights" />
        <CardBody>
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const bgColor = insight.type === 'seasonal' ? 'bg-blue-50 border-blue-200' : 
                            insight.type === 'alert' ? 'bg-amber-50 border-amber-200' : 
                            'bg-green-50 border-green-200';
              const textColor = insight.type === 'seasonal' ? 'text-blue-900' : 
                              insight.type === 'alert' ? 'text-amber-900' : 
                              'text-green-900';
              const msgColor = insight.type === 'seasonal' ? 'text-blue-700' : 
                             insight.type === 'alert' ? 'text-amber-700' : 
                             'text-green-700';
              
              return (
                <div key={index} className={`p-4 ${bgColor} border rounded-lg`}>
                  <p className={`font-semibold ${textColor}`}>{insight.title}</p>
                  <p className={`${msgColor} text-sm mt-2`}>{insight.message}</p>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default ForecastingPage;