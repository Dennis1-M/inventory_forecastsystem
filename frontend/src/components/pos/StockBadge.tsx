// StockBadge.tsx
import { cn } from '@/lib/utils';
import { getStockStatus, Product, StockStatus } from '@/types/pos';
import { AlertTriangle, Check, XCircle } from 'lucide-react';

interface StockBadgeProps {
  product: Product;
  showCount?: boolean;
  size?: 'sm' | 'md';
}

const stockConfig: Record<StockStatus, { label: string; className: string; icon: React.ElementType }> = {
  'in-stock': { label: 'In Stock', className: 'stock-badge-ok', icon: Check },
  'low-stock': { label: 'Low Stock', className: 'stock-badge-low', icon: AlertTriangle },
  'out-of-stock': { label: 'Out of Stock', className: 'stock-badge-out', icon: XCircle },
};

export function StockBadge({ product, showCount = false, size = 'sm' }: StockBadgeProps) {
  const status = getStockStatus(product);
  const config = stockConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        config.className,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      )}
    >
      <Icon className={cn(size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />
      <span>{showCount ? `${product.currentStock} left` : config.label}</span>
    </div>
  );
}
