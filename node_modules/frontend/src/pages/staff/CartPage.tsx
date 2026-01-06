import { ShoppingCart, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button, Card, CardBody, CardFooter, CardHeader, ConfirmModal, EmptyState, Table } from '../../components/ui';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);

    const handleCartUpdate = () => {
      const updatedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(updatedCart);
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleRemoveItem = (id: string) => {
    const updated = cartItems.filter(item => item.id !== id);
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(id);
    } else {
      const updated = cartItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      );
      setCartItems(updated);
      localStorage.setItem('cart', JSON.stringify(updated));
    }
  };

  const handleCompleteSale = () => {
    setConfirmModalOpen(true);
  };

  const handleConfirmSale = async () => {
    console.log('Processing sale...', { cartItems, paymentMethod, total });
    setConfirmModalOpen(false);
    setCartItems([]);
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const tableColumns = [
    { key: 'name', label: 'Product', width: '30%' },
    { key: 'price', label: 'Price', width: '20%' },
    { key: 'quantity', label: 'Quantity', width: '20%' },
    { key: 'total', label: 'Total', width: '20%' },
  ];

  const tableData = cartItems.map(item => ({
    name: item.name,
    price: `Ksh ${item.price.toLocaleString()}`,
    quantity: (
      <input
        type="number"
        min="1"
        value={item.quantity}
        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
        className="w-16 px-2 py-1 border border-gray-300 rounded-lg"
      />
    ),
    total: `Ksh ${(item.price * item.quantity).toLocaleString()}`,
  }));

  if (cartItems.length === 0) {
    return (
      <div>
        <h2 className="text-3xl font-bold mb-8">Cart & Checkout</h2>
        <Card>
          <EmptyState
            icon={ShoppingCart}
            title="Cart is Empty"
            description="Add items from the Sales page to get started."
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Cart & Checkout</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Cart Items" subtitle={`${cartItems.length} items in cart`} />
            <CardBody>
              <Table
                columns={tableColumns}
                data={tableData}
                actions={(row) => (
                  <button
                    onClick={() => {
                      const item = cartItems.find(i => i.name === row.name);
                      if (item) handleRemoveItem(item.id);
                    }}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              />
            </CardBody>
          </Card>
        </div>

        {/* Checkout */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader title="Checkout" />
            <CardBody>
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900">Payment Method</h4>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <span className="font-semibold">Cash</span>
                  </label>
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="mpesa"
                      checked={paymentMethod === 'mpesa'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <span className="font-semibold">M-PESA</span>
                  </label>
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <span className="font-semibold">Card</span>
                  </label>
                </div>
              </div>
            </CardBody>
            <CardFooter className="flex flex-col gap-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span className="text-indigo-600">Ksh {total.toLocaleString()}</span>
              </div>
              <Button
                label="Complete Sale"
                variant="success"
                fullWidth
                onClick={handleCompleteSale}
              />
            </CardFooter>
          </Card>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModalOpen}
        title="Confirm Sale"
        message={`Complete sale for Ksh ${total.toLocaleString()} via ${paymentMethod.toUpperCase()}?`}
        confirmLabel="Complete"
        variant="info"
        onConfirm={handleConfirmSale}
        onCancel={() => setConfirmModalOpen(false)}
      />
    </div>
  );
};

export default CartPage;
