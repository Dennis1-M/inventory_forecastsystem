// CashierDashboard.tsx
import { CartItem, PaymentMethod, Product, User } from '@/types/pos';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Cart } from './Cart';
import { PaymentPanel } from './PaymentPanel';
import { ProductSearch } from './ProductSearch';
import { ReceiptModal } from './ReceiptModal';

interface CashierDashboardProps {
  products: Product[];
  user: User;
}

export function CashierDashboard({ products, user }: CashierDashboardProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<{
    items: CartItem[];
    paymentMethod: PaymentMethod;
    transactionId: string;
  } | null>(null);

  const addToCart = useCallback((product: Product) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id);

      if (existingItem) {
        if (existingItem.quantity >= product.currentStock) {
          toast.warning('Maximum stock reached', { description: `Only ${product.currentStock} units available` });
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      toast.success('Added to cart', { description: product.name });
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setCartItems((prev) => (quantity < 1 ? prev.filter((item) => item.product.id !== productId) : prev.map((item) =>
      item.product.id === productId ? { ...item, quantity } : item
    )));
  }, []);

  const removeItem = useCallback((productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
    toast.info('Item removed from cart');
  }, []);

  const handleCheckout = useCallback(async (paymentMethod: PaymentMethod) => {
    if (cartItems.length === 0) return;
    setIsProcessing(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const transactionId = `TXN-${Date.now().toString(36).toUpperCase()}`;
    setLastTransaction({ items: cartItems, paymentMethod, transactionId });

    toast.success('Sale completed successfully!', { description: `Transaction: ${transactionId}` });

    setIsProcessing(false);
    setShowReceipt(true);
  }, [cartItems]);

  const handleCloseReceipt = useCallback(() => {
    setShowReceipt(false);
    setCartItems([]);
    setLastTransaction(null);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl checkout-gradient flex items-center justify-center">
            <span className="text-lg font-bold text-primary-foreground">S</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">SuperMart POS</h1>
            <p className="text-xs text-muted-foreground">Staff Dashboard</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">{user.name}</p>
          <p className="text-xs text-muted-foreground">Cashier</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden p-4 gap-4">
        <div className="w-[400px] pos-panel shrink-0 overflow-hidden flex flex-col">
          <ProductSearch products={products} onAddToCart={addToCart} />
        </div>
        <div className="flex-1 pos-panel overflow-hidden flex flex-col min-w-[300px]">
          <Cart items={cartItems} onUpdateQuantity={updateQuantity} onRemoveItem={removeItem} />
        </div>
        <div className="w-[320px] pos-panel shrink-0 overflow-hidden flex flex-col">
          <PaymentPanel cartItems={cartItems} user={user} onCheckout={handleCheckout} isProcessing={isProcessing} />
        </div>
      </main>

      {lastTransaction && (
        <ReceiptModal
          open={showReceipt}
          onClose={handleCloseReceipt}
          items={lastTransaction.items}
          paymentMethod={lastTransaction.paymentMethod}
          user={user}
          transactionId={lastTransaction.transactionId}
        />
      )}
    </div>
  );
}
