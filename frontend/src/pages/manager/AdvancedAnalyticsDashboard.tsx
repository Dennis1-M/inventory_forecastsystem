import { AlertTriangle, BarChart3, Loader2, TrendingDown, TrendingUp, Users, Zap } from 'lucide-react';
import { useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import {
  downloadAnalyticsReport,
  useCostOptimization,
  useDeadStock,
  useDemandCorrelation,
  useExecutiveSummary,
  useForecastPerformance,
  useInventoryTurnover,
  useReorderOptimization,
  useScenarioPlanning,
  useSeasonalTrends,
  useSmartAlerts,
  useSupplierPerformance,
  useSupplyChainRisk
} from '../../hooks/useAnalytics';
import ABCAnalysis from './components/ABCAnalysis';
import InventoryHealthScore from './components/InventoryHealthScore';
import StockOutRiskPredictor from './components/StockOutRiskPredictor';

const AdvancedAnalyticsDashboard = ({ inventory = [], sales = [] }: { inventory?: any[]; sales?: any[] }) => {
  const [activeTab, setActiveTab] = useState<'health' | 'risk' | 'abc' | 'forecast' | 'dead' | 'supplier' | 'turnover' | 'reorder' | 'seasonal' | 'cost' | 'risk-monitor' | 'alerts' | 'scenario' | 'correlation' | 'summary'>('health');
  const [downloading, setDownloading] = useState(false);

  // Fetch analytics data for tabs that need it
  const { data: deadStockData, isLoading: deadStockLoading } = useDeadStock();
  const { data: turnoverData, isLoading: turnoverLoading } = useInventoryTurnover();
  const { data: supplierData, isLoading: supplierLoading } = useSupplierPerformance();
  const { data: forecastData, isLoading: forecastLoading } = useForecastPerformance(30);
  const { data: reorderData, isLoading: reorderLoading } = useReorderOptimization();
  const { data: seasonalData, isLoading: seasonalLoading } = useSeasonalTrends();
  const { data: costData, isLoading: costLoading } = useCostOptimization();
  const { data: riskData, isLoading: riskLoading } = useSupplyChainRisk();
  const { data: alertsData, isLoading: alertsLoading } = useSmartAlerts();
  const { data: scenarioData, isLoading: scenarioLoading } = useScenarioPlanning();
  const { data: correlationData, isLoading: correlationLoading } = useDemandCorrelation();
  const { data: summaryData, isLoading: summaryLoading } = useExecutiveSummary();

  const handleDownloadReport = async () => {
    try {
      setDownloading(true);
      await downloadAnalyticsReport();
      alert('Report downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const tabs = [
    { id: 'health', label: '💰 Inventory Health', icon: '⚡' },
    { id: 'risk', label: '🎯 Stock-Out Risk', icon: '⚠️' },
    { id: 'abc', label: '🏆 ABC Analysis', icon: '📊' },
    { id: 'forecast', label: '📈 Forecast Performance', icon: '📉' },
    { id: 'dead', label: '👥 Dead Stock', icon: '💤' },
    { id: 'supplier', label: '📈 Supplier Scorecard', icon: '⭐' },
    { id: 'turnover', label: '🔄 Turnover Rate', icon: '📊' },
    { id: 'reorder', label: '💡 Reorder Optimization', icon: '🎯' },
    { id: 'seasonal', label: '📉 Seasonal Trends', icon: '📅' },
    { id: 'cost', label: '💵 Cost Optimization', icon: '💸' },
    { id: 'risk-monitor', label: '🚨 Supply Chain Risk', icon: '⛓️' },
    { id: 'alerts', label: '📱 Smart Alerts', icon: '🔔' },
    { id: 'scenario', label: '🎬 Scenario Planning', icon: '🎲' },
    { id: 'correlation', label: '🔗 Demand Correlation', icon: '📊' },
    { id: 'summary', label: '📊 Executive Summary', icon: '📋' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Advanced Analytics Hub</h2>
        <p className="text-sm sm:text-base text-gray-600">AI-powered insights for data-driven decision making</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="flex gap-2 p-3 sm:p-4 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="hidden sm:inline">{tab.icon} </span>
                <span className="sm:hidden">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[24rem]">
        {/* Tab: Inventory Health Score (Feature #4) */}
        {activeTab === 'health' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <InventoryHealthScore inventory={inventory} />
            </div>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
                <h4 className="font-bold text-blue-900 mb-2">Quick Tips</h4>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>• Review low turnover items</li>
                  <li>• Reduce dead stock</li>
                  <li>• Optimize reorder points</li>
                  <li>• Improve forecast accuracy</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Stock-Out Risk (Feature #1) */}
        {activeTab === 'risk' && (
          <StockOutRiskPredictor inventory={inventory} sales={sales} />
        )}

        {/* Tab: ABC Analysis (Feature #3) */}
        {activeTab === 'abc' && (
          <ABCAnalysis inventory={inventory} />
        )}

        {/* Tab: Forecast Performance (Feature #2) */}
        {activeTab === 'forecast' && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              <span className="text-sm sm:text-base">Forecast Performance vs Actuals</span>
            </h3>
            {forecastLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-300 rounded-lg p-3 sm:p-4">
                    <p className="text-green-700 text-xs sm:text-sm font-medium">Forecast Accuracy</p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-900">{forecastData?.metrics?.accuracy || 0}%</p>
                    <p className="text-xs text-green-600 mt-1">MAPE: {forecastData?.metrics?.mape || 0}%</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300 rounded-lg p-3 sm:p-4">
                    <p className="text-blue-700 text-xs sm:text-sm font-medium">Avg Error (MAE)</p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-900">{forecastData?.metrics?.mae || 0} units</p>
                    <p className="text-xs text-blue-600 mt-1">Average deviation</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-300 rounded-lg p-3 sm:p-4">
                    <p className="text-purple-700 text-xs sm:text-sm font-medium">Total Actual</p>
                    <p className="text-2xl sm:text-3xl font-bold text-purple-900">{forecastData?.metrics?.totalActual || 0}</p>
                    <p className="text-xs text-purple-600 mt-1">vs {forecastData?.metrics?.totalForecast || 0} forecast</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 sm:p-6">
                  <h4 className="font-bold mb-4 text-sm sm:text-base">Actual vs Forecast Demand (Last 30 Days)</h4>
                  {forecastData?.chartData && forecastData.chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={forecastData.chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }} 
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Line 
                          type="monotone" 
                          dataKey="actual" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          name="Actual Demand"
                          dot={{ r: 3 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="forecast" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          name="Forecasted Demand"
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No forecast data available</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab: Dead Stock Detector (Feature #5) */}
        {activeTab === 'dead' && (
          <div className="space-y-4 sm:space-y-6">
            {deadStockLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-red-50 border border-red-300 rounded-lg p-3 sm:p-4">
                    <p className="text-red-700 text-xs sm:text-sm font-medium">30-Day Dead Stock</p>
                    <p className="text-2xl sm:text-3xl font-bold text-red-900">
                      {deadStockData?.summary['30days']?.count || 0} items
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Potential: Ksh {deadStockData?.summary['30days']?.value?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="bg-orange-50 border border-orange-300 rounded-lg p-3 sm:p-4">
                    <p className="text-orange-700 text-xs sm:text-sm font-medium">60-Day Dead Stock</p>
                    <p className="text-2xl sm:text-3xl font-bold text-orange-900">
                      {deadStockData?.summary['60days']?.count || 0} items
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      Potential: Ksh {deadStockData?.summary['60days']?.value?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 sm:p-4">
                    <p className="text-amber-700 text-xs sm:text-sm font-medium">90-Day Dead Stock</p>
                    <p className="text-2xl sm:text-3xl font-bold text-amber-900">
                      {deadStockData?.summary['90days']?.count || 0} items
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      Potential: Ksh {deadStockData?.summary['90days']?.value?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                  <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Actions Recommended</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 sm:gap-3 p-3 bg-red-50 border border-red-200 rounded">
                      <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-900 text-sm sm:text-base">Markdown Campaign</p>
                        <p className="text-xs sm:text-sm text-red-700">Apply 30-50% discount to move 30-day dead stock</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3 p-3 bg-amber-50 border border-amber-200 rounded">
                      <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-900 text-sm sm:text-base">Donation Program</p>
                        <p className="text-xs sm:text-sm text-amber-700">Consider donating slow-moving items for tax benefits</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab: Supplier Scorecard (Feature #6) */}
        {activeTab === 'supplier' && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            {supplierLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : (
              <>
                <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 flex items-center gap-2">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  <span className="text-sm sm:text-base">Supplier Performance Scorecard</span>
                </h3>
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Supplier</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold">On-Time %</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold">Quality</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold">Lead Time</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold">Rating</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {supplierData?.map((supplier: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm">{supplier.name}</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-center text-green-600 font-semibold text-xs sm:text-sm">{supplier.onTimeDeliveryRate}%</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-center text-blue-600 font-semibold text-xs sm:text-sm">{supplier.qualityScore}%</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-center text-gray-600 text-xs sm:text-sm">{supplier.avgLeadTimeDays}d</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                            <span className="inline-block bg-green-100 text-green-900 px-2 sm:px-3 py-1 rounded-full font-bold text-xs sm:text-sm">{supplier.overallRating}/10</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab: Inventory Turnover (Feature #7) */}
        {activeTab === 'turnover' && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            {turnoverLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : (
              <>
                <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  <span className="text-sm sm:text-base">Inventory Turnover Rate</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="bg-green-50 border border-green-300 rounded-lg p-3 sm:p-4">
                    <p className="text-green-700 text-xs sm:text-sm font-medium">Overall Turnover Ratio</p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-900">{turnoverData?.overallTurnoverRatio?.toFixed(1) || 0}x</p>
                    <p className="text-xs text-green-600 mt-1">annually</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-300 rounded-lg p-3 sm:p-4">
                    <p className="text-blue-700 text-xs sm:text-sm font-medium">Days Inventory Outstanding</p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-900">{turnoverData?.daysInventoryOutstanding || 0}</p>
                    <p className="text-xs text-blue-600 mt-1">days to sell inventory</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-300 rounded-lg p-3 sm:p-4">
                    <p className="text-purple-700 text-xs sm:text-sm font-medium">Fast Movers</p>
                    <p className="text-2xl sm:text-3xl font-bold text-purple-900">{turnoverData?.fastMoverPercentage || 0}%</p>
                    <p className="text-xs text-purple-600 mt-1">of inventory</p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab: Reorder Optimization (Feature #8) */}
        {activeTab === 'reorder' && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 flex items-center gap-2">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              <span className="text-sm sm:text-base">Smart Reorder Point Optimization</span>
            </h3>
            {reorderLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : (
              <>
                <p className="text-gray-700 mb-4 text-sm sm:text-base">ML-optimized reorder points based on demand variability, lead time, and service level targets</p>
                <div className="space-y-3">
                  {reorderData && reorderData.length > 0 ? (
                    reorderData.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 border border-gray-300 rounded">
                        <div>
                          <p className="font-semibold text-sm sm:text-base">{item.productName}</p>
                          <p className="text-xs sm:text-sm text-gray-600">Current ROP: {item.currentROP} → Recommended: {item.recommendedROP}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-sm sm:text-base ${item.improvement > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                            {item.improvement > 0 ? '+' : ''}{item.improvement}%
                          </p>
                          <p className="text-xs text-gray-600">Ksh {item.potentialSavings.toLocaleString()}/year</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Zap className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">All reorder points are optimized</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab: Seasonal Trends (Feature #9) */}
        {activeTab === 'seasonal' && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 flex items-center gap-2">
              <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              <span className="text-sm sm:text-base">Seasonal Trend Analysis</span>
            </h3>
            {seasonalLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : (
              <>
                <p className="text-gray-700 mb-4 text-sm sm:text-base">Year-over-year seasonal patterns and peak/trough forecasts</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="bg-green-50 border border-green-300 rounded-lg p-3 sm:p-4">
                    <p className="text-green-700 text-xs sm:text-sm font-medium">Peak Month</p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-900">{seasonalData?.peakMonth || 'N/A'}</p>
                    <p className="text-xs text-green-600 mt-1">Revenue: Ksh {seasonalData?.peakRevenue?.toLocaleString() || 0}</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-300 rounded-lg p-3 sm:p-4">
                    <p className="text-blue-700 text-xs sm:text-sm font-medium">Trough Month</p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-900">{seasonalData?.troughMonth || 'N/A'}</p>
                    <p className="text-xs text-blue-600 mt-1">Revenue: Ksh {seasonalData?.troughRevenue?.toLocaleString() || 0}</p>
                  </div>
                </div>
                {seasonalData?.chartData && seasonalData.chartData.length > 0 ? (
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 sm:p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={seasonalData.chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
                        <Line type="monotone" dataKey="units" stroke="#10b981" strokeWidth={2} name="Units Sold" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-8 text-center">
                    <BarChart3 className="h-12 sm:h-16 w-12 sm:w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-sm">No seasonal data available</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Tab: Cost Optimization (Feature #10) */}
        {activeTab === 'cost' && (
          <div className="space-y-4 sm:space-y-6">
            {costLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-green-50 border border-green-300 rounded-lg p-3 sm:p-4">
                    <p className="text-green-700 text-xs sm:text-sm font-medium">Potential Monthly Savings</p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-900">Ksh {costData?.totalMonthlySavings?.toLocaleString() || 0}</p>
                    <p className="text-xs text-green-600 mt-1">through optimization</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-300 rounded-lg p-3 sm:p-4">
                    <p className="text-blue-700 text-xs sm:text-sm font-medium">Annual Impact</p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-900">Ksh {costData?.annualSavings?.toLocaleString() || 0}</p>
                    <p className="text-xs text-blue-600 mt-1">if all recommendations applied</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                  <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Optimization Opportunities</h4>
                  <div className="space-y-3">
                    {costData?.opportunities?.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-start justify-between p-3 bg-gray-50 border border-gray-200 rounded">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm sm:text-base">{item.title}</p>
                          <p className="text-xs sm:text-sm text-gray-600">{item.action}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600 text-sm sm:text-base">Ksh {item.potential.toLocaleString()}</p>
                        </div>
                      </div>
                    )) || []}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab: Supply Chain Risk (Feature #11) */}
        {activeTab === 'risk-monitor' && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              <span className="text-sm sm:text-base">Supply Chain Risk Monitor</span>
            </h3>
            {riskLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {riskData?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-start justify-between p-3 sm:p-4 bg-amber-50 border border-amber-300 rounded-lg">
                    <div>
                      <p className="font-semibold text-amber-900 text-sm sm:text-base">{item.risk}</p>
                      <p className="text-xs sm:text-sm text-amber-700">{item.itemsAffected} items affected</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block bg-amber-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium mb-2">{item.severity}</span>
                      <p className="text-xs text-amber-700">{item.action}</p>
                    </div>
                  </div>
                )) || []}
              </div>
            )}
          </div>
        )}

        {/* Tab: Smart Alerts (Feature #12) */}
        {activeTab === 'alerts' && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 flex items-center gap-2">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              <span className="text-sm sm:text-base">Smart Alert Configuration</span>
            </h3>
            {alertsLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {alertsData?.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded">
                    <div className="flex-1">
                      <p className="font-semibold text-sm sm:text-base">{item.alert}</p>
                      <p className="text-xs sm:text-sm text-gray-600">Channels: {item.channel}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                    </div>
                    <div>
                      <input type="checkbox" defaultChecked={item.enabled} className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                )) || []}
              </div>
            )}
          </div>
        )}

        {/* Tab: Scenario Planning (Feature #13) */}
        {activeTab === 'scenario' && (
          <div className="space-y-4 sm:space-y-6">
            {scenarioLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Scenario Planner</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {scenarioData?.map((item: any, idx: number) => (
                    <div key={idx} className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300 rounded-lg">
                      <p className="font-bold text-blue-900 mb-2 text-sm sm:text-base">{item.scenario}</p>
                      <div className="space-y-1 text-xs sm:text-sm">
                        <p><span className="font-semibold">Impact:</span> {item.impact}</p>
                        <p><span className="font-semibold">Action Lead:</span> {item.leadTime}</p>
                        <p><span className="font-semibold text-red-600">Cost Impact:</span> {item.costImpact}</p>
                      </div>
                    </div>
                  )) || []}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Demand Correlation (Feature #14) */}
        {activeTab === 'correlation' && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              <span className="text-sm sm:text-base">Demand Correlation Analysis</span>
            </h3>
            {correlationLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : (
              <>
                <p className="text-gray-700 mb-4 text-sm sm:text-base">Products frequently bought together - opportunities for bundling</p>
                <div className="space-y-3">
                  {correlationData?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-start justify-between p-3 sm:p-4 bg-purple-50 border border-purple-300 rounded">
                      <div>
                        <p className="font-semibold text-purple-900 text-sm sm:text-base">{item.bundle}</p>
                        <p className="text-xs sm:text-sm text-purple-700">{item.items}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-purple-900 text-sm sm:text-base">{item.frequency}</p>
                        <p className="text-xs text-purple-700">{item.revenue}</p>
                      </div>
                    </div>
                  )) || []}
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab: Executive Summary (Feature #15) */}
        {activeTab === 'summary' && (
          <div className="space-y-4 sm:space-y-6">
            {summaryLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : (
              <>
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-lg p-4 sm:p-6 md:p-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-indigo-900 mb-4 sm:mb-6">Executive Summary Report</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div>
                      <h4 className="font-bold text-indigo-900 mb-3 text-sm sm:text-base">Key Metrics</h4>
                      <div className="space-y-2 text-xs sm:text-sm">
                        <p><span className="font-semibold">Inventory Health:</span> <span className="text-green-600 font-bold">{summaryData?.keyMetrics?.inventoryHealth || 0}/100</span></p>
                        <p><span className="font-semibold">Forecast Accuracy:</span> <span className="text-green-600 font-bold">{summaryData?.keyMetrics?.forecastAccuracy || 0}%</span></p>
                        <p><span className="font-semibold">Turnover Ratio:</span> <span className="text-blue-600 font-bold">{summaryData?.keyMetrics?.turnoverRatio || 0}x</span></p>
                        <p><span className="font-semibold">Dead Stock Value:</span> <span className="text-red-600 font-bold">Ksh {summaryData?.keyMetrics?.deadStockValue?.toLocaleString() || 0}</span></p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-indigo-900 mb-3 text-sm sm:text-base">Financial Impact</h4>
                      <div className="space-y-2 text-xs sm:text-sm">
                        <p><span className="font-semibold">Monthly Savings Potential:</span> <span className="text-green-600 font-bold">Ksh {summaryData?.financialImpact?.monthlySavingsPotential?.toLocaleString() || 0}</span></p>
                        <p><span className="font-semibold">Annual Savings:</span> <span className="text-green-600 font-bold">Ksh {summaryData?.financialImpact?.annualSavings?.toLocaleString() || 0}</span></p>
                        <p><span className="font-semibold">Stock-Out Risk Items:</span> <span className="text-red-600 font-bold">{summaryData?.financialImpact?.stockOutRiskItems || 0} products</span></p>
                        <p><span className="font-semibold">Supplier Issues:</span> <span className="text-amber-600 font-bold">{summaryData?.financialImpact?.supplierIssues || 0} high-risk</span></p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-indigo-900 mb-3 text-sm sm:text-base">Top Recommendations</h4>
                    <ol className="space-y-2 text-xs sm:text-sm">
                      {summaryData?.recommendations?.map((rec: any) => (
                        <li key={rec.priority}>
                          <span className="font-bold">{rec.priority}.</span> {rec.title} - {rec.potential}
                        </li>
                      )) || []}
                    </ol>
                  </div>
                </div>

                <button 
                  onClick={handleDownloadReport}
                  disabled={downloading}
                  className="w-full bg-indigo-600 text-white py-2 sm:py-3 rounded-lg font-bold hover:bg-indigo-700 transition text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      📥 Download Full Report (JSON)
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
