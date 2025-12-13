import AdminLayout from "@/layouts/AdminLayout";
import axiosClient from "@/lib/axiosClient";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ComposedChart, Legend, Line, LineChart, ResponsiveContainer, ScatterChart, Scatter, Tooltip, XAxis, YAxis } from "recharts";

export default function ForecastingAnalyticsPage() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [accuracyMetrics, setAccuracyMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock forecast data
  const mockForecastData = [
    { week: "Week 1", actual: 145, predicted: 140, lower_bound: 120, upper_bound: 160 },
    { week: "Week 2", actual: 168, predicted: 165, lower_bound: 145, upper_bound: 185 },
    { week: "Week 3", actual: 152, predicted: 158, lower_bound: 138, upper_bound: 178 },
    { week: "Week 4", actual: 189, predicted: 185, lower_bound: 165, upper_bound: 205 },
    { week: "Week 5", actual: 176, predicted: 172, lower_bound: 152, upper_bound: 192 },
    { week: "Week 6", actual: 195, predicted: 198, lower_bound: 178, upper_bound: 218 },
    { week: "Week 7", actual: 211, predicted: 208, lower_bound: 188, upper_bound: 228 },
  ];

  const mockAccuracyMetrics = [
    { metric: "MAE", value: 4.2, color: "text-green-600" },
    { metric: "RMSE", value: 6.8, color: "text-blue-600" },
    { metric: "MAPE", value: 2.3, color: "text-purple-600" },
    { metric: "Model Accuracy", value: 95.7, color: "text-green-600", unit: "%" },
  ];

  const mockTrendAnalysis = [
    { product: "Electronics", trend: 2.4, forecast: 156 },
    { product: "Foods", trend: 1.8, forecast: 245 },
    { product: "Clothing", trend: -0.5, forecast: 89 },
    { product: "Home", trend: 3.1, forecast: 120 },
    { product: "Sports", trend: 1.2, forecast: 95 },
  ];

  useEffect(() => {
    loadForecastData();
  }, []);

  async function loadForecastData() {
    setLoading(true);
    try {
      const productsRes = await axiosClient.get("/api/products");
      const prods = productsRes.data?.data || [];
      setProducts(prods.slice(0, 5)); // Show top 5 for demo
      if (prods.length > 0) {
        setSelectedProduct(prods[0]);
      }
      setForecastData(mockForecastData);
      setAccuracyMetrics(mockAccuracyMetrics);
    } catch (err) {
      console.error("Failed to load forecast data:", err);
      setForecastData(mockForecastData);
      setAccuracyMetrics(mockAccuracyMetrics);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Forecasting Analytics</h1>
          <p className="text-gray-600 mt-2">Demand prediction & trend analysis powered by AI</p>
        </div>

        {/* Model Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {accuracyMetrics.map((metric, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm mb-2">{metric.metric}</p>
              <p className={`text-3xl font-bold ${metric.color}`}>
                {metric.value}
                {metric.unit && metric.unit}
              </p>
              <p className="text-xs text-gray-500 mt-2">Prediction accuracy</p>
            </div>
          ))}
        </div>

        {/* Forecast Confidence Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Demand Forecast with Confidence Intervals</h2>
            <p className="text-sm text-gray-600 mt-1">Predicted vs Actual demand with upper/lower bounds</p>
          </div>

          {loading ? (
            <p className="text-gray-600">Loading forecast...</p>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={forecastData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="lower_bound" fill="#e0e7ff" stroke="none" name="Lower Bound" />
                <Area type="monotone" dataKey="upper_bound" fill="#e0e7ff" stroke="none" name="Upper Bound" />
                <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={3} name="Actual Sales" />
                <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="Predicted Sales" />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Two-column layout for Product Selection & Trend Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Select Product</h2>
            {loading ? (
              <p className="text-gray-600">Loading products...</p>
            ) : (
              <div className="space-y-2">
                {products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition ${
                      selectedProduct?.id === product.id
                        ? "bg-purple-600 text-white font-semibold"
                        : "bg-gray-50 text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-xs opacity-75">SKU: {product.sku}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category Trend Analysis */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Category Trend Analysis</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockTrendAnalysis}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="product" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="trend" fill="#a855f7" name="Growth Trend %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demand Seasonality & Patterns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Seasonality Pattern */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Seasonality Pattern</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="actual" fill="#3b82f6" stroke="#1e40af" name="Seasonal Demand" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Forecast Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Forecast Error Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" type="category" />
                <YAxis />
                <Tooltip />
                <Scatter name="Forecast Error %" dataKey="error" data={forecastData.map((d, i) => ({ ...d, error: Math.random() * 10 - 5 }))} fill="#ef4444" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insights & Recommendations */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow p-6 border border-blue-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">AI Insights & Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Increasing Demand</h3>
              </div>
              <p className="text-sm text-gray-600">
                Electronics category showing 2.4% upward trend. Consider increasing stock levels by 15-20% for optimal availability.
              </p>
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-gray-900">Declining Demand</h3>
              </div>
              <p className="text-sm text-gray-600">
                Clothing segment declining at -0.5%. Monitor closely and consider promotional activities or inventory reduction.
              </p>
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Seasonal Peak</h3>
              </div>
              <p className="text-sm text-gray-600">
                Model predicts 25% demand increase in Week 7. Prepare supply chain and staffing accordingly.
              </p>
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Forecast Confidence</h3>
              </div>
              <p className="text-sm text-gray-600">
                95.7% model accuracy with 2.3% MAPE. High confidence in predictions for the next 4 weeks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
