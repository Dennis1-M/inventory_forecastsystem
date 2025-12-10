import { AlertCircle, ShoppingCart, Warehouse } from "lucide-react";

export default function ProductCard({ product, onViewDetails }) {
  const isLowStock = product.currentStock <= product.lowStockThreshold;

  return (
    <div
      onClick={() => onViewDetails(product)}
      className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer overflow-hidden group"
    >
      {/* Product image placeholder */}
      <div className="h-40 bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center group-hover:from-purple-300 group-hover:to-pink-300 transition">
        <ShoppingCart className="w-16 h-16 text-white opacity-50" />
      </div>

      {/* Product info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{product.name}</h3>
            <p className="text-xs text-gray-500">SKU: {product.sku}</p>
          </div>
          {isLowStock && <AlertCircle className="w-4 h-4 text-red-600" />}
        </div>

        {/* Price */}
        <p className="text-lg font-bold text-purple-600 mb-2">
          ${product.unitPrice?.toFixed(2) ?? "N/A"}
        </p>

        {/* Stock status */}
        <div className="flex items-center gap-2 mb-3 text-sm">
          <Warehouse className="w-4 h-4 text-gray-600" />
          <span className={isLowStock ? "text-red-600 font-semibold" : "text-green-600"}>
            {product.currentStock} units
          </span>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-gray-600">Threshold</p>
            <p className="font-bold text-gray-800">{product.lowStockThreshold}</p>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-gray-600">Reorder</p>
            <p className="font-bold text-gray-800">{product.reorderPoint}</p>
          </div>
        </div>

        {/* Click hint */}
        <p className="text-xs text-purple-600 mt-3 text-center">Click for details →</p>
      </div>
    </div>
  );
}
