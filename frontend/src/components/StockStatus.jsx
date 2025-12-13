import { AlertCircle, Check, TrendingDown, TrendingUp } from "lucide-react";

export default function StockStatus({ product }) {
  if (!product) return null;

  const isLowStock = product.currentStock <= (product.lowStockThreshold || product.reorderPoint);
  const isOutOfStock = product.currentStock <= 0;
  const isOverstock = product.currentStock > product.overStockLimit;

  let status = { label: "", color: "", bgColor: "", icon: Check };

  if (isOutOfStock) {
    status = { label: "Out of Stock", color: "text-red-700", bgColor: "bg-red-50", icon: AlertCircle };
  } else if (isLowStock) {
    status = { label: "Low Stock", color: "text-yellow-700", bgColor: "bg-yellow-50", icon: AlertCircle };
  } else if (isOverstock) {
    status = { label: "Overstock", color: "text-orange-700", bgColor: "bg-orange-50", icon: TrendingUp };
  } else {
    status = { label: "In Stock", color: "text-green-700", bgColor: "bg-green-50", icon: Check };
  }

  const Icon = status.icon;

  return (
    <div className={`${status.bgColor} border border-${status.color.split("-")[1]}-200 rounded-lg p-4`}>
      <div className="flex items-center gap-3 mb-3">
        <Icon className={`w-5 h-5 ${status.color}`} />
        <span className={`font-semibold ${status.color}`}>{status.label}</span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-700">Current:</span>
          <span className="font-semibold">{product.currentStock} units</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700">Reorder Point:</span>
          <span className="font-semibold">{product.reorderPoint}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700">Overstock Limit:</span>
          <span className="font-semibold">{product.overStockLimit}</span>
        </div>

        {/* Progress bar */}
        <div className="mt-3 pt-3 border-t">
          <div className="w-full bg-gray-300 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition ${
                isOutOfStock || isLowStock ? "bg-red-500" : isOverstock ? "bg-yellow-500" : "bg-green-500"
              }`}
              style={{
                width: `${Math.min(100, (product.currentStock / (product.overStockLimit || 100)) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
