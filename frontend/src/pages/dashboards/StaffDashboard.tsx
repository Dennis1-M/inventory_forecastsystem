// StaffDashboard.tsx
import { Cart } from "@/components/pos/Cart";
import { PaymentPanel } from "@/components/pos/PaymentPanel";
import { ProductSearch } from "@/components/pos/ProductSearch";
import { ReceiptModal } from "@/components/pos/ReceiptModal";
import api from "@/lib/axiosClient";
import { CartItem, PaymentMethod, Product, Receipt, User } from "@/types/pos";
import { useState } from "react";

interface StaffDashboardProps {
  user: User;
  products: Product[];
}

const StaffDashboard = ({ user, products }: StaffDashboardProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(false);

  // ---------------------------
  // Add product to cart
  // ---------------------------
  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const exists = prev.find((i) => i.product.id === product.id);
      if (exists) {
        if (exists.quantity >= product.currentStock) {
          alert("Maximum stock reached");
          return prev;
        }
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  // ---------------------------
  // Remove product from cart
  // ---------------------------
  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  // ---------------------------
  // Checkout (Cash / Card / M-PESA)
  // ---------------------------
  const handleCheckout = async (paymentMethod: PaymentMethod) => {
    if (cartItems.length === 0) return alert("Cart is empty");
    setLoading(true);

    try {
      // Backend API call
      const res = await api.post("/pos/checkout", {
        paymentMethod,
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.product.unitPrice,
        })),
        userId: user.id,
      });

      setReceipt(res.data); // store receipt
      setCartItems([]);     // clear cart
      alert(`${paymentMethod} payment successful!`);

      // If M-PESA, trigger STK Push
      if (paymentMethod === "MPESA") {
        const phone = prompt("Enter your phone number for M-PESA:");
        if (phone) await handleMpesaPayment(res.data.saleId, res.data.totalAmount, phone);
      }
    } catch (err) {
      console.error(err);
      alert("Checkout failed!");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // M-PESA Payment
  // ---------------------------
  const handleMpesaPayment = async (saleId: number, amount: number, phone: string) => {
    try {
      await api.post("/mpesa/pay", { saleId, amount, phone });
      alert("STK Push sent! Check your phone.");
    } catch (err) {
      console.error(err);
      alert("M-PESA payment failed");
    }
  };

  return (
    <div className="flex gap-4 p-4 h-full">
      {/* Product Search */}
      <ProductSearch products={products} onAddToCart={handleAddToCart} />

      {/* Cart */}
      <Cart
        items={cartItems}
        onUpdateQuantity={(productId, qty) =>
          setCartItems((prev) =>
            prev.map((item) =>
              item.product.id === productId ? { ...item, quantity: qty } : item
            )
          )
        }
        onRemoveItem={handleRemoveFromCart}
      />

      {/* Payment Panel */}
      <PaymentPanel
        cartItems={cartItems}
        user={user}
        onCheckout={handleCheckout}
        isProcessing={loading}
      />

      {/* Receipt Modal */}
      {receipt && (
        <ReceiptModal
          open={!!receipt}
          onClose={() => setReceipt(null)}
          items={receipt.items}
          paymentMethod={receipt.paymentMethod}
          user={user}
          transactionId={receipt.saleId.toString()}
        />
      )}
    </div>
  );
};

export default StaffDashboard;
