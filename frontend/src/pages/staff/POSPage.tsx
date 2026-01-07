import { DollarSign, Minus, Plus, RotateCcw, ShoppingCart, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import apiService from '../../services/api';

interface Product {
  id: number;
  name: string;
  price: number;
  currentStock: number;
  sku: string;
  unitPrice?: number;
}

interface CartItem {
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  discountApplied?: number;
}

interface PaymentBreakdown {
  cash: number;
  card: number;
  mpesa: number;
}

const POSPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Payment & Checkout
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'MPESA'>('CASH');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [showCheckout, setShowCheckout] = useState(false);
  
  // Returns & Refunds
  const [showReturns, setShowReturns] = useState(false);
  const [salesHistory, setSalesHistory] = useState<any[]>([]);
  
  // Daily Operations
  const [shiftOpen, setShiftOpen] = useState(true);
  const [tillAmount, setTillAmount] = useState<number>(0);
  const [salesCount, setSalesCount] = useState<number>(0);
  const [totalSalesAmount, setTotalSalesAmount] = useState<number>(0);
  const [paymentBreakdown, setPaymentBreakdown] = useState<PaymentBreakdown>({
    cash: 0,
    card: 0,
    mpesa: 0
  });


  useEffect(() => {
    fetchProducts();
    fetchSalesHistory();
    loadDailyStats();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await apiService.get('/products');
      const productsData = response.data?.data || response.data || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      console.error('Failed to load products:', err);
      setMessage({ type: 'error', text: 'Failed to load products' });
    }
  };

  const fetchSalesHistory = async () => {
    try {
      const response = await apiService.get('/sales');
      setSalesHistory(response.data || []);
    } catch (err) {
      console.error('Failed to load sales history:', err);
    }
  };

  const loadDailyStats = () => {
    // Load from localStorage or API
    const stats = JSON.parse(localStorage.getItem('dailyStats') || '{}');
    setTillAmount(stats.tillAmount || 0);
    setSalesCount(stats.salesCount || 0);
    setTotalSalesAmount(stats.totalSalesAmount || 0);
    setPaymentBreakdown(stats.paymentBreakdown || { cash: 0, card: 0, mpesa: 0 });
  };

  const saveDailyStats = (newStats: any) => {
    localStorage.setItem('dailyStats', JSON.stringify(newStats));
  };

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.productId === product.id);
    
    if (existing) {
      if (existing.quantity >= product.currentStock) {
        setMessage({ type: 'error', text: 'Insufficient stock available' });
        return;
      }
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitPrice }
          : item
      ));
    } else {
      if (product.currentStock < 1) {
        setMessage({ type: 'error', text: 'Product out of stock' });
        return;
      }
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        quantity: 1,
        unitPrice: product.price,
        total: product.price
      }]);
    }
    setMessage(null);
  };

  const updateQuantity = (productId: number, delta: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setCart(cart.map(item => {
      if (item.productId === productId) {
        const newQuantity = item.quantity + delta;
        if (newQuantity < 1) return item;
        if (newQuantity > product.currentStock) {
          setMessage({ type: 'error', text: 'Insufficient stock' });
          return item;
        }
        return { ...item, quantity: newQuantity, total: newQuantity * item.unitPrice };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setAmountPaid(0);
    setDiscountPercent(0);
    setMessage(null);
  };

  // Apply discount to cart
  const applyDiscount = (percent: number) => {
    if (percent < 0 || percent > 100) {
      setMessage({ type: 'error', text: 'Discount must be between 0-100%' });
      return;
    }
    setDiscountPercent(percent);
    setMessage({ type: 'success', text: `Discount of ${percent}% applied` });
  };

  // Calculate totals with discount
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = subtotal * (discountPercent / 100);
  const cartTotal = subtotal - discountAmount;
  const change = amountPaid - cartTotal;

  const completeSale = async () => {
    if (cart.length === 0) {
      setMessage({ type: 'error', text: 'Cart is empty' });
      return;
    }

    if (amountPaid < cartTotal && paymentMethod === 'CASH') {
      setMessage({ type: 'error', text: `Insufficient payment. Need KES ${(cartTotal - amountPaid).toFixed(2)} more` });
      return;
    }

    setLoading(true);
    try {
      const saleData = {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        })),
        paymentMethod: paymentMethod,
        discountApplied: discountPercent,
        amountPaid: amountPaid
      };

      await apiService.post('/sales', saleData);
      
      // Update daily stats
      const newStats = {
        tillAmount: tillAmount + (paymentMethod === 'CASH' ? amountPaid : cartTotal),
        salesCount: salesCount + 1,
        totalSalesAmount: totalSalesAmount + cartTotal,
        paymentBreakdown: {
          ...paymentBreakdown,
          [paymentMethod.toLowerCase()]: paymentBreakdown[paymentMethod.toLowerCase() as keyof PaymentBreakdown] + cartTotal
        }
      };
      saveDailyStats(newStats);
      setTillAmount(newStats.tillAmount);
      setSalesCount(newStats.salesCount);
      setTotalSalesAmount(newStats.totalSalesAmount);
      setPaymentBreakdown(newStats.paymentBreakdown);

      setMessage({ type: 'success', text: 'Sale completed successfully!' });
      clearCart();
      setShowCheckout(false);
      fetchProducts(); // Refresh product stock
      fetchSalesHistory();
      
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to complete sale' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Process return/refund
  const processReturn = async (saleId: number) => {
    if (!window.confirm('Are you sure you want to process this return?')) return;

    setLoading(true);
    try {
      // Call delete sale endpoint (will reverse stock)
      await apiService.delete(`/sales/${saleId}`);
      setMessage({ type: 'success', text: 'Return processed successfully!' });
      fetchSalesHistory();
      fetchProducts();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to process return' });
    } finally {
      setLoading(false);
    }
  };

  // Open shift
  const openShift = () => {
    setShiftOpen(true);
    const stats = {
      tillAmount: 0,
      salesCount: 0,
      totalSalesAmount: 0,
      paymentBreakdown: { cash: 0, card: 0, mpesa: 0 }
    };
    saveDailyStats(stats);
    loadDailyStats();
    setMessage({ type: 'success', text: 'Shift opened successfully!' });
  };

  // Close shift with till reconciliation
  const closeShift = () => {
    const discrepancy = Math.abs(tillAmount - amountPaid);
    const summary = `Shift Summary:\nTotal Sales: ${salesCount}\nTotal Amount: KES ${totalSalesAmount.toFixed(2)}\nCash in Till: KES ${tillAmount.toFixed(2)}`;
    
    if (window.confirm(`${summary}\n\nConfirm shift closure?`)) {
      setShiftOpen(false);
      setMessage({ type: 'success', text: 'Shift closed. Till reconciliation complete!' });
    }
  };

  const cartTotal = subtotal - discountAmount;
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Products Section */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Point of Sale</h1>
            <div className="flex gap-2">
              <button
                onClick={shiftOpen ? closeShift : openShift}
                className={`px-4 py-2 rounded-lg font-semibold text-white transition ${
                  shiftOpen
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {shiftOpen ? 'Close Shift' : 'Open Shift'}
              </button>
              <button
                onClick={() => setShowReturns(!showReturns)}
                className={`px-4 py-2 rounded-lg font-semibold text-white transition ${
                  showReturns ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                <RotateCcw className="inline mr-2 h-4 w-4" />
                Returns
              </button>
            </div>
          </div>

          {/* Shift Status & Daily Stats */}
          {shiftOpen && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Till Amount</p>
                <p className="text-2xl font-bold text-blue-600">KES {tillAmount.toFixed(2)}</p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-green-600">KES {totalSalesAmount.toFixed(2)}</p>
              </div>
              <div className="bg-purple-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-purple-600">{salesCount}</p>
              </div>
              <div className="bg-yellow-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Avg Transaction</p>
                <p className="text-2xl font-bold text-yellow-600">
                  KES {salesCount > 0 ? (totalSalesAmount / salesCount).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Returns Section */}
        {showReturns ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Process Returns</h2>
            <div className="bg-white rounded-lg shadow p-4 max-h-96 overflow-y-auto">
              {salesHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No sales history available</p>
              ) : (
                <div className="space-y-3">
                  {salesHistory.map((sale: any) => (
                    <div key={sale.id} className="border border-gray-200 rounded-lg p-3 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800">Sale #{sale.id}</p>
                        <p className="text-sm text-gray-600">KES {sale.totalAmount?.toFixed(2) || '0.00'} • {sale.paymentMethod}</p>
                        <p className="text-xs text-gray-500">{new Date(sale.createdAt).toLocaleString()}</p>
                      </div>
                      <button
                        onClick={() => processReturn(sale.id)}
                        disabled={loading}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 text-sm"
                      >
                        Return
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Search Bar */}
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={product.currentStock < 1}
                  className={`p-4 rounded-lg border-2 text-left transition ${
                    product.currentStock < 1
                      ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-50'
                      : 'bg-white border-gray-200 hover:border-blue-500 hover:shadow-md'
                  }`}
                >
                  <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.sku}</p>
                  <p className="text-lg font-bold text-green-600 mt-2">KES {(product.unitPrice || product.price).toFixed(2)}</p>
                  <p className={`text-xs ${product.currentStock < 10 ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                    Stock: {product.currentStock}
                  </p>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Cart & Checkout Section */}
      <div className="w-96 bg-white shadow-lg p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <ShoppingCart className="mr-2" /> Cart ({cart.length})
          </h2>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-red-500 hover:text-red-700 text-sm font-semibold"
            >
              Clear
            </button>
          )}
        </div>

        {message && (
          <div className={`p-3 mb-4 rounded-lg text-sm ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex-1 overflow-y-auto mb-4">
          {cart.length === 0 ? (
            <p className="text-center text-gray-500 mt-8">Cart is empty</p>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.productId} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800 flex-1 text-sm">{item.name}</h3>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.productId, -1)}
                        className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="font-semibold w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, 1)}
                        className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="font-bold text-green-600 text-sm">KES {item.total.toFixed(2)}</span>
                  </div>
                  
                  <p className="text-xs text-gray-500">KES {item.unitPrice.toFixed(2)} × {item.quantity}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Discount Section */}
        {cart.length > 0 && (
          <div className="mb-4 border-t pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Quick Discounts:</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => applyDiscount(5)}
                className="py-1 px-2 bg-indigo-100 text-indigo-700 rounded text-sm hover:bg-indigo-200"
              >
                5%
              </button>
              <button
                onClick={() => applyDiscount(10)}
                className="py-1 px-2 bg-indigo-100 text-indigo-700 rounded text-sm hover:bg-indigo-200"
              >
                10%
              </button>
              <button
                onClick={() => applyDiscount(0)}
                className="py-1 px-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
              >
                None
              </button>
            </div>
            {discountPercent > 0 && (
              <p className="text-sm text-green-600 mt-2 font-semibold">
                Discount: KES {discountAmount.toFixed(2)} ({discountPercent}%)
              </p>
            )}
          </div>
        )}

        {/* Totals */}
        {cart.length > 0 && (
          <div className="border-t pt-4 mb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>KES {subtotal.toFixed(2)}</span>
            </div>
            {discountPercent > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount ({discountPercent}%):</span>
                <span>-KES {discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-gray-800 border-t pt-2">
              <span>Total:</span>
              <span className="text-green-600">KES {cartTotal.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Checkout View */}
        {showCheckout ? (
          <div className="space-y-4 border-t pt-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
              <div className="space-y-2">
                {(['CASH', 'CARD', 'MPESA'] as const).map(method => (
                  <label key={method} className="flex items-center">
                    <input
                      type="radio"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
                      className="mr-2"
                    />
                    <span className="text-sm">{method}</span>
                  </label>
                ))}
              </div>
            </div>

            {paymentMethod === 'CASH' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Amount Paid</label>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded text-lg font-bold"
                  placeholder="0.00"
                />
                {amountPaid > 0 && (
                  <p className={`text-sm mt-2 font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Change: KES {change.toFixed(2)}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setShowCheckout(false)}
                className="flex-1 py-2 px-4 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-semibold"
              >
                Back
              </button>
              <button
                onClick={completeSale}
                disabled={loading || (paymentMethod === 'CASH' && amountPaid < cartTotal)}
                className={`flex-1 py-2 px-4 text-white rounded-lg font-semibold transition ${
                  loading || (paymentMethod === 'CASH' && amountPaid < cartTotal)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {loading ? 'Processing...' : 'Complete Sale'}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowCheckout(true)}
            disabled={loading || cart.length === 0}
            className={`w-full py-3 rounded-lg font-semibold text-white transition ${
              loading || cart.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <DollarSign className="inline mr-2 h-5 w-5" />
            {cart.length === 0 ? 'Cart Empty' : 'Proceed to Payment'}
          </button>
        )}
      </div>
    </div>
  );
};

export default POSPage;