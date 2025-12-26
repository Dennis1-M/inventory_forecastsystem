// Cart.tsx
import { CartItem as CartItemType } from '@/types/pos';
import { ShoppingCart } from 'lucide-react';
import { CartItem } from './CartItem';

interface CartProps {
  items: CartItemType[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

export function Cart({ items, onUpdateQuantity, onRemoveItem }: CartProps) {
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Cart Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <ShoppingCart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Current Sale</h2>
            <p className="text-sm text-muted-foreground">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item) => (
              <CartItem
                key={item.product.id}
                item={item}
                onUpdateQuantity={onUpdateQuantity}
                onRemove={onRemoveItem}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <ShoppingCart className="h-16 w-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">Cart is empty</p>
            <p className="text-sm text-center mt-1">
              Search for products and add them to the cart
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
