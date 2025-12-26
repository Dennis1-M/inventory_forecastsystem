// ProductCard.tsx
import { cn } from '@/lib/utils';
import { Product, getStockStatus } from '@/types/pos';
import { Plus } from 'lucide-react';
import { StockBadge } from './StockBadge';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const status = getStockStatus(product);
  const isOutOfStock = status === 'out-of-stock';

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(price);

  return (
    <button
      onClick={() => !isOutOfStock && onAddToCart(product)}
      disabled={isOutOfStock}
      className={cn(
        'w-full p-4 rounded-xl text-left transition-all duration-150 pos-button',
        'border border-transparent',
        isOutOfStock
          ? 'bg-muted/50 cursor-not-allowed opacity-60'
          : 'bg-card hover:bg-secondary hover:border-border hover:shadow-md'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">{product.name}</p>
          <p className="text-sm text-muted-foreground mt-0.5">SKU: {product.sku}</p>
          <p className="text-lg font-bold text-primary mt-2">{formatPrice(product.unitPrice)}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StockBadge product={product} showCount />
          {!isOutOfStock && (
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
              <Plus className="h-5 w-5" />
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
