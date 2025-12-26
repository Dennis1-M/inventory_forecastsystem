// PaymentPanel.tsx
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CartItem, PaymentMethod, User } from '@/types/pos';
import { Banknote, CreditCard, Receipt, Smartphone, User as UserIcon } from 'lucide-react';

interface PaymentPanelProps {
  cartItems: CartItem[];
  user: User;
  onCheckout: (paymentMethod: PaymentMethod) => void;
  isProcessing: boolean;
}

export function PaymentPanel({ cartItems, user, onCheckout, isProcessing }: PaymentPanelProps) {
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.unitPrice * item.quantity,
    0
  );
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(price);

  const isEmpty = cartItems.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* User Info */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            <UserIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{user.name}</p>
            <p className="text-sm text-muted-foreground capitalize">{user.role.toLowerCase()}</p>
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex justify-between text-muted-foreground">
          <span>Items</span>
          <span>{itemCount}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="h-px bg-border" />
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-foreground">Total</span>
          <span className="text-2xl font-bold text-primary">{formatPrice(subtotal)}</span>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="flex-1 p-4 flex flex-col">
        <p className="text-sm font-medium text-muted-foreground mb-3">Payment Method</p>
        <div className="flex flex-col gap-3 flex-1">
          <Button
            onClick={() => onCheckout('CASH')}
            disabled={isEmpty || isProcessing}
            className={cn(
              'payment-button bg-secondary text-secondary-foreground hover:bg-secondary/80',
              'flex items-center justify-center gap-3'
            )}
          >
            <Banknote className="h-6 w-6" />
            <span>Cash</span>
          </Button>

          <Button
            onClick={() => onCheckout('MPESA')}
            disabled={isEmpty || isProcessing}
            className={cn(
              'payment-button mpesa-gradient text-accent-foreground hover:opacity-90',
              'flex items-center justify-center gap-3'
            )}
          >
            <Smartphone className="h-6 w-6" />
            <span>M-PESA</span>
          </Button>

          <Button
            onClick={() => onCheckout('CARD')}
            disabled={isEmpty || isProcessing}
            className={cn(
              'payment-button bg-foreground text-background hover:bg-foreground/90',
              'flex items-center justify-center gap-3'
            )}
          >
            <CreditCard className="h-6 w-6" />
            <span>Card</span>
          </Button>
        </div>

        {/* Checkout Button */}
        <div className="mt-4 pt-4 border-t border-border">
          <Button
            disabled={isEmpty || isProcessing}
            className={cn(
              'w-full h-16 text-xl font-bold rounded-xl',
              'checkout-gradient text-primary-foreground',
              'hover:opacity-90 pos-button',
              isProcessing && 'animate-pulse-subtle'
            )}
          >
            <Receipt className="h-6 w-6" />
            <span>{isProcessing ? 'Processing...' : 'Complete Sale'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
