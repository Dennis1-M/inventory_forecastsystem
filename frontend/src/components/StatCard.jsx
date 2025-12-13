import { TrendingDown, TrendingUp } from "lucide-react";

export default function StatCard({ label, value, icon: Icon, color, trend, trendDirection = "up" }) {
  const colorStyles = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
    yellow: "bg-yellow-500",
    orange: "bg-orange-500",
  };

  const TrendIcon = trendDirection === "up" ? TrendingUp : TrendingDown;
  const trendColor = trendDirection === "up" ? "text-green-600" : "text-red-600";

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`${colorStyles[color] || colorStyles.blue} p-3 rounded-lg`}>
          <Icon className="text-white w-6 h-6" />
        </div>
        {trend && (
          <div className="flex items-center gap-1">
            <TrendIcon className={`w-4 h-4 ${trendColor}`} />
            <span className={`text-sm font-semibold ${trendColor}`}>{trend}</span>
          </div>
        )}
      </div>
      <p className="text-gray-600 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
