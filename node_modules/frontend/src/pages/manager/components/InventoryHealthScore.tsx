import { AlertTriangle, Zap } from 'lucide-react';

interface HealthIndicator {
  label: string;
  value: number;
  weight: number;
  status: 'good' | 'warning' | 'critical';
}

const InventoryHealthScore = ({ inventory }: { inventory: any[] }) => {
  // Calculate health score (0-100)
  const calculateHealthScore = (): { score: number; breakdown: HealthIndicator[] } => {
    if (!inventory || inventory.length === 0) {
      return { score: 0, breakdown: [] };
    }

    // 1. Turnover Ratio (25% weight)
    const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unitPrice || 0), 0);
    const lastMonthSales = Math.random() * totalValue * 0.5; // Simulated - replace with actual
    const turnoverRatio = totalValue > 0 ? (lastMonthSales / totalValue) * 100 : 0;
    const turnoverScore = Math.min(turnoverRatio * 2.5, 25);

    // 2. Stockout Frequency (25% weight)
    const stockoutFreq = inventory.filter(i => i.quantity === 0).length;
    const stockoutScore = Math.max(25 - (stockoutFreq * 2.5), 0);

    // 3. Dead Stock (20% weight)
    const deadStock = inventory.filter(i => i.quantity > i.reorderLevel * 5).length;
    const deadStockScore = Math.max(20 - (deadStock * 2), 0);

    // 4. Low Stock Items (20% weight)
    const lowStockItems = inventory.filter(i => i.quantity < i.reorderLevel).length;
    const lowStockScore = Math.max(20 - (lowStockItems * 2), 0);

    // 5. Forecast Accuracy (10% weight)
    const forecastAccuracy = 85; // Simulated - replace with actual
    const accuracyScore = forecastAccuracy * 0.1;

    const totalScore = Math.round(turnoverScore + stockoutScore + deadStockScore + lowStockScore + accuracyScore);

    return {
      score: Math.max(0, Math.min(100, totalScore)),
      breakdown: [
        { label: 'Stock Turnover', value: Math.round(turnoverScore), weight: 25, status: turnoverScore > 15 ? 'good' : 'warning' },
        { label: 'Stockout Risk', value: Math.round(stockoutScore), weight: 25, status: stockoutScore > 15 ? 'good' : 'critical' },
        { label: 'Dead Stock', value: Math.round(deadStockScore), weight: 20, status: deadStockScore > 12 ? 'good' : 'warning' },
        { label: 'Low Stock Items', value: Math.round(lowStockScore), weight: 20, status: lowStockScore > 12 ? 'good' : 'warning' },
        { label: 'Forecast Accuracy', value: Math.round(accuracyScore), weight: 10, status: accuracyScore > 8 ? 'good' : 'warning' },
      ]
    };
  };

  const { score, breakdown } = calculateHealthScore();

  const getHealthStatus = (score: number) => {
    if (score >= 80) return { status: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100', borderColor: 'border-green-300' };
    if (score >= 60) return { status: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-100', borderColor: 'border-blue-300' };
    if (score >= 40) return { status: 'Warning', color: 'text-amber-600', bgColor: 'bg-amber-100', borderColor: 'border-amber-300' };
    return { status: 'Critical', color: 'text-red-600', bgColor: 'bg-red-100', borderColor: 'border-red-300' };
  };

  const health = getHealthStatus(score);

  return (
    <div className={`rounded-lg shadow-md p-6 border-2 ${health.borderColor}`}>
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
        <Zap className="h-6 w-6" />
        Inventory Health Score
      </h3>

      {/* Main Score */}
      <div className={`${health.bgColor} rounded-lg p-6 mb-6 text-center`}>
        <div className="text-5xl font-bold mb-2">
          <span className={health.color}>{score}</span>
          <span className="text-2xl text-gray-500">/100</span>
        </div>
        <p className={`text-lg font-semibold ${health.color}`}>{health.status}</p>
        <p className="text-sm text-gray-600 mt-2">Overall inventory management efficiency</p>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-3">
        <p className="font-semibold text-gray-900 mb-4">Component Breakdown:</p>
        {breakdown.map((item, idx) => (
          <div key={idx} className="flex items-center gap-4">
            <div className="w-32">
              <p className="text-sm font-medium text-gray-900">{item.label}</p>
            </div>
            <div className="flex-1">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    item.status === 'good' ? 'bg-green-500' :
                    item.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${(item.value / item.weight) * 100}%` }}
                />
              </div>
            </div>
            <div className="w-12 text-right">
              <span className={`font-semibold ${item.status === 'good' ? 'text-green-600' : item.status === 'warning' ? 'text-amber-600' : 'text-red-600'}`}>
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="font-semibold text-gray-900 mb-2">Improvement Areas:</p>
        <ul className="space-y-2 text-sm">
          {breakdown.filter(b => b.status !== 'good').map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{item.label} is at {item.value}/{item.weight} - Consider reviewing</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InventoryHealthScore;
