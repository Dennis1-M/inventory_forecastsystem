// CartItem.tsx
import { Button } from '@/components/ui/button';
import { CartItem as CartItemType } from '@/types/pos';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const { product, quantity } = item;
  const subtotal = product.unitPrice * quantity;
  const maxQuantity = product.currentStock;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(price);

  return (
    <div className="p-4 bg-card rounded-xl border border-border animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">{product.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatPrice(product.unitPrice)} × {quantity}
          </p>
        </div>
        <p className="font-bold text-foreground whitespace-nowrap">
          {formatPrice(subtotal)}
        </p>
      </div>

      <div className="flex items-center justify-between mt-3">
        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onUpdateQuantity(product.id, quantity - 1)}
            disabled={quantity <= 1}
            className="h-10 w-10 rounded-lg pos-button"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center text-lg font-semibold">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onUpdateQuantity(product.id, quantity + 1)}
            disabled={quantity >= maxQuantity}
            className="h-10 w-10 rounded-lg pos-button"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Remove Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(product.id)}
          className="h-10 w-10 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10 pos-button"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>

      {quantity >= maxQuantity && (
        <p className="text-xs text-warning mt-2 flex items-center gap-1">
          Maximum stock reached
        </p>
      )}
    </div>
  );
}
