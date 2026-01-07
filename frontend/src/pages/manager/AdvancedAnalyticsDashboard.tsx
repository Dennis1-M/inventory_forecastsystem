import { AlertTriangle, BarChart3, TrendingDown, TrendingUp, Users, Zap } from 'lucide-react';
import { useState } from 'react';
import ABCAnalysis from './components/ABCAnalysis';
import InventoryHealthScore from './components/InventoryHealthScore';
import StockOutRiskPredictor from './components/StockOutRiskPredictor';

const AdvancedAnalyticsDashboard = ({ inventory = [], sales = [] }: { inventory?: any[]; sales?: any[] }) => {
  const [activeTab, setActiveTab] = useState<'health' | 'risk' | 'abc' | 'forecast' | 'dead' | 'supplier' | 'turnover' | 'reorder' | 'seasonal' | 'cost' | 'risk-monitor' | 'alerts' | 'scenario' | 'correlation' | 'summary'>('health');

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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold mb-2">Advanced Analytics Hub</h2>
        <p className="text-gray-600">AI-powered insights for data-driven decision making</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="overflow-x-auto">
          <div className="flex gap-2 p-4 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-96">
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
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              Forecast Performance vs Actuals
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-300 rounded-lg p-4">
                <p className="text-green-700 text-sm font-medium">Forecast Accuracy (MAPE)</p>
                <p className="text-3xl font-bold text-green-900">12.5%</p>
                <p className="text-xs text-green-600 mt-1">↓ 2.3% from last month</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300 rounded-lg p-4">
                <p className="text-blue-700 text-sm font-medium">Avg Error (MAE)</p>
                <p className="text-3xl font-bold text-blue-900">8 units</p>
                <p className="text-xs text-blue-600 mt-1">Consistent performance</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-300 rounded-lg p-4">
                <p className="text-purple-700 text-sm font-medium">Model Confidence</p>
                <p className="text-3xl font-bold text-purple-900">87%</p>
                <p className="text-xs text-purple-600 mt-1">Good predictor</p>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-8 text-center">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Chart visualization would show actual vs forecasted demand over time</p>
            </div>
          </div>
        )}

        {/* Tab: Dead Stock Detector (Feature #5) */}
        {activeTab === 'dead' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-50 border border-red-300 rounded-lg p-4">
                <p className="text-red-700 text-sm font-medium">30-Day Dead Stock</p>
                <p className="text-3xl font-bold text-red-900">12 items</p>
                <p className="text-xs text-red-600 mt-1">Potential: Ksh 45,000</p>
              </div>
              <div className="bg-orange-50 border border-orange-300 rounded-lg p-4">
                <p className="text-orange-700 text-sm font-medium">60-Day Dead Stock</p>
                <p className="text-3xl font-bold text-orange-900">8 items</p>
                <p className="text-xs text-orange-600 mt-1">Potential: Ksh 28,500</p>
              </div>
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                <p className="text-amber-700 text-sm font-medium">90-Day Dead Stock</p>
                <p className="text-3xl font-bold text-amber-900">5 items</p>
                <p className="text-xs text-amber-600 mt-1">Potential: Ksh 12,300</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="font-bold mb-4">Actions Recommended</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900">Markdown Campaign</p>
                    <p className="text-sm text-red-700">Apply 30-50% discount to move 30-day dead stock</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900">Donation Program</p>
                    <p className="text-sm text-amber-700">Consider donating slow-moving items for tax benefits</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Supplier Scorecard (Feature #6) */}
        {activeTab === 'supplier' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              Supplier Performance Scorecard
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Supplier</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold">On-Time %</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold">Quality Score</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold">Lead Time (days)</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold">Overall Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    { name: 'Global Supplies Inc', onTime: 94, quality: 92, leadTime: 5, rating: 9.3 },
                    { name: 'Premium Distributors', onTime: 87, quality: 88, leadTime: 7, rating: 8.75 },
                    { name: 'Tech Hub Wholesale', onTime: 91, quality: 85, leadTime: 6, rating: 8.67 },
                  ].map((supplier, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{supplier.name}</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold">{supplier.onTime}%</td>
                      <td className="px-6 py-4 text-center text-blue-600 font-semibold">{supplier.quality}%</td>
                      <td className="px-6 py-4 text-center text-gray-600">{supplier.leadTime}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block bg-green-100 text-green-900 px-3 py-1 rounded-full font-bold">{supplier.rating}/10</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Inventory Turnover (Feature #7) */}
        {activeTab === 'turnover' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              Inventory Turnover Rate
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 border border-green-300 rounded-lg p-4">
                <p className="text-green-700 text-sm font-medium">Overall Turnover Ratio</p>
                <p className="text-3xl font-bold text-green-900">6.2x</p>
                <p className="text-xs text-green-600 mt-1">annually</p>
              </div>
              <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
                <p className="text-blue-700 text-sm font-medium">Days Inventory Outstanding</p>
                <p className="text-3xl font-bold text-blue-900">59</p>
                <p className="text-xs text-blue-600 mt-1">days to sell inventory</p>
              </div>
              <div className="bg-purple-50 border border-purple-300 rounded-lg p-4">
                <p className="text-purple-700 text-sm font-medium">Fast Movers</p>
                <p className="text-3xl font-bold text-purple-900">34%</p>
                <p className="text-xs text-purple-600 mt-1">of inventory</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Reorder Optimization (Feature #8) */}
        {activeTab === 'reorder' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Zap className="h-6 w-6 text-purple-600" />
              Smart Reorder Point Optimization
            </h3>
            <p className="text-gray-700 mb-4">ML-optimized reorder points based on demand variability, lead time, and service level targets</p>
            <div className="space-y-3">
              {[
                { product: 'Product A', current: 50, recommended: 72, improvement: '+44%', savings: 'Ksh 2,400/year' },
                { product: 'Product B', current: 100, recommended: 85, improvement: '-15%', savings: 'Ksh 1,800/year' },
                { product: 'Product C', current: 30, recommended: 48, improvement: '+60%', savings: 'Ksh 950/year' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-300 rounded">
                  <div>
                    <p className="font-semibold">{item.product}</p>
                    <p className="text-sm text-gray-600">Current ROP: {item.current} → Recommended: {item.recommended}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${item.improvement.startsWith('+') ? 'text-amber-600' : 'text-green-600'}`}>{item.improvement}</p>
                    <p className="text-xs text-gray-600">{item.savings}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Seasonal Trends (Feature #9) */}
        {activeTab === 'seasonal' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <TrendingDown className="h-6 w-6 text-blue-600" />
              Seasonal Trend Analysis
            </h3>
            <p className="text-gray-700 mb-4">Year-over-year seasonal patterns and peak/trough forecasts</p>
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-8 text-center">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Seasonal trend chart would display monthly patterns across years</p>
            </div>
          </div>
        )}

        {/* Tab: Cost Optimization (Feature #10) */}
        {activeTab === 'cost' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-300 rounded-lg p-4">
                <p className="text-green-700 text-sm font-medium">Potential Monthly Savings</p>
                <p className="text-3xl font-bold text-green-900">Ksh 12,450</p>
                <p className="text-xs text-green-600 mt-1">through optimization</p>
              </div>
              <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
                <p className="text-blue-700 text-sm font-medium">Annual Impact</p>
                <p className="text-3xl font-bold text-blue-900">Ksh 149,400</p>
                <p className="text-xs text-blue-600 mt-1">if all recommendations applied</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="font-bold mb-4">Optimization Opportunities</h4>
              <div className="space-y-3">
                {[
                  { title: 'Bulk Purchasing Discount', potential: 'Ksh 4,200/month', action: 'Consolidate orders to 3 suppliers' },
                  { title: 'Dead Stock Clearance', potential: 'Ksh 3,500/month', action: 'Apply 40% markdown' },
                  { title: 'Lead Time Reduction', potential: 'Ksh 2,850/month', action: 'Switch to faster supplier' },
                  { title: 'Carrying Cost Reduction', potential: 'Ksh 1,900/month', action: 'Reduce safety stock by 15%' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between p-3 bg-gray-50 border border-gray-200 rounded">
                    <div>
                      <p className="font-semibold text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-600">{item.action}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{item.potential}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Supply Chain Risk (Feature #11) */}
        {activeTab === 'risk-monitor' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              Supply Chain Risk Monitor
            </h3>
            <div className="space-y-4">
              {[
                { risk: 'Single-Source Suppliers', items: 8, severity: 'High', action: 'Find alternatives' },
                { risk: 'Geographic Concentration', items: 34, severity: 'Medium', action: 'Diversify suppliers' },
                { risk: 'Long Lead Times', items: 12, severity: 'Medium', action: 'Increase safety stock' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start justify-between p-4 bg-amber-50 border border-amber-300 rounded-lg">
                  <div>
                    <p className="font-semibold text-amber-900">{item.risk}</p>
                    <p className="text-sm text-amber-700">{item.items} items affected</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-amber-600 text-white px-3 py-1 rounded text-sm font-medium mb-2">{item.severity}</span>
                    <p className="text-xs text-amber-700">{item.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Smart Alerts (Feature #12) */}
        {activeTab === 'alerts' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Zap className="h-6 w-6 text-red-600" />
              Smart Alert Configuration
            </h3>
            <div className="space-y-4">
              {[
                { alert: 'Stock Below Reorder Point', enabled: true, channel: 'SMS + Push' },
                { alert: 'Forecast Anomaly Detected', enabled: true, channel: 'Email + Push' },
                { alert: 'Supplier Delay Alert', enabled: true, channel: 'SMS' },
                { alert: 'Demand Spike (>50%)', enabled: true, channel: 'Push Notification' },
                { alert: 'Dead Stock Accumulation', enabled: false, channel: 'Email' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded">
                  <div className="flex-1">
                    <p className="font-semibold">{item.alert}</p>
                    <p className="text-sm text-gray-600">Channels: {item.channel}</p>
                  </div>
                  <div>
                    <input type="checkbox" defaultChecked={item.enabled} className="w-6 h-6" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Scenario Planning (Feature #13) */}
        {activeTab === 'scenario' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-4">Scenario Planner</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { scenario: 'Demand +30%', impact: 'Need 450 more units', lead: '3 days', cost: 'Ksh 22,500' },
                  { scenario: 'Demand -20%', impact: 'Excess inventory 200 units', lead: 'Immediate', cost: 'Ksh -8,000' },
                  { scenario: 'Supplier Fails', impact: 'Critical stockout risk', lead: '5 days', cost: 'Ksh 45,000' },
                  { scenario: 'Lead Time +2 weeks', impact: 'Increase safety stock', lead: 'Immediate', cost: 'Ksh 12,000' },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300 rounded-lg">
                    <p className="font-bold text-blue-900 mb-2">{item.scenario}</p>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-semibold">Impact:</span> {item.impact}</p>
                      <p><span className="font-semibold">Action Lead:</span> {item.lead}</p>
                      <p><span className="font-semibold text-red-600">Cost Impact:</span> {item.cost}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Demand Correlation (Feature #14) */}
        {activeTab === 'correlation' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-purple-600" />
              Demand Correlation Analysis
            </h3>
            <p className="text-gray-700 mb-4">Products frequently bought together - opportunities for bundling</p>
            <div className="space-y-3">
              {[
                { bundle: 'Electronics Bundle', items: 'Item A + Item B + Item C', frequency: '45%', revenue: 'Ksh 18,900' },
                { bundle: 'Office Bundle', items: 'Item D + Item E', frequency: '32%', revenue: 'Ksh 12,400' },
                { bundle: 'Seasonal Bundle', items: 'Item F + Item G + Item H', frequency: '28%', revenue: 'Ksh 9,200' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start justify-between p-4 bg-purple-50 border border-purple-300 rounded">
                  <div>
                    <p className="font-semibold text-purple-900">{item.bundle}</p>
                    <p className="text-sm text-purple-700">{item.items}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-900">{item.frequency}</p>
                    <p className="text-xs text-purple-700">{item.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Executive Summary (Feature #15) */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-indigo-900 mb-6">Executive Summary Report</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="font-bold text-indigo-900 mb-3">Key Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-semibold">Inventory Health:</span> <span className="text-green-600 font-bold">78/100</span></p>
                    <p><span className="font-semibold">Forecast Accuracy:</span> <span className="text-green-600 font-bold">87%</span></p>
                    <p><span className="font-semibold">Turnover Ratio:</span> <span className="text-blue-600 font-bold">6.2x</span></p>
                    <p><span className="font-semibold">Dead Stock Value:</span> <span className="text-red-600 font-bold">Ksh 85,800</span></p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-indigo-900 mb-3">Financial Impact</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-semibold">Monthly Savings Potential:</span> <span className="text-green-600 font-bold">Ksh 12,450</span></p>
                    <p><span className="font-semibold">Annual Savings:</span> <span className="text-green-600 font-bold">Ksh 149,400</span></p>
                    <p><span className="font-semibold">Stock-Out Risk Items:</span> <span className="text-red-600 font-bold">18 products</span></p>
                    <p><span className="font-semibold">Supplier Issues:</span> <span className="text-amber-600 font-bold">2 high-risk</span></p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-indigo-900 mb-3">Top Recommendations</h4>
                <ol className="space-y-2 text-sm">
                  <li><span className="font-bold">1.</span> Implement dynamic reorder points - Potential: Ksh 4,200/month</li>
                  <li><span className="font-bold">2.</span> Clear dead stock with markdown campaign - Potential: Ksh 3,500/month</li>
                  <li><span className="font-bold">3.</span> Consolidate suppliers for bulk discounts - Potential: Ksh 2,850/month</li>
                  <li><span className="font-bold">4.</span> Diversify supply sources - Risk reduction: High</li>
                </ol>
              </div>
            </div>

            <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition">
              📥 Download Full Report (PDF)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
