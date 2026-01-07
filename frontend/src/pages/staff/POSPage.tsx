import { Minus, Plus, ShoppingCart, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import apiService from '../../services/api';

interface Product {
  id: number;
  name: string;
  price: number;
  currentStock: number;
  sku: string;
}

interface CartItem {
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const POSPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await apiService.get('/products');
      setProducts(response.data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    }
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
    setMessage(null);
  };

  const completeSale = async () => {
    if (cart.length === 0) {
      setMessage({ type: 'error', text: 'Cart is empty' });
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
        paymentMethod: 'CASH'
      };

      await apiService.post('/sales', saleData);
      setMessage({ type: 'success', text: 'Sale completed successfully!' });
      clearCart();
      fetchProducts(); // Refresh product stock
      
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

  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Products Section */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Point of Sale</h1>
        
        <input
          type="text"
          placeholder="Search products by name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />

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
              <p className="text-lg font-bold text-green-600 mt-2">KES {product.price}</p>
              <p className="text-xs text-gray-500">Stock: {product.currentStock}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96 bg-white shadow-lg p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <ShoppingCart className="mr-2" /> Cart
          </h2>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Clear All
            </button>
          )}
        </div>

        {message && (
          <div className={`p-3 mb-4 rounded-lg ${
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
                    <h3 className="font-semibold text-gray-800 flex-1">{item.name}</h3>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.productId, -1)}
                        className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="font-semibold w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, 1)}
                        className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="font-bold text-green-600">KES {item.total.toFixed(2)}</span>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-1">KES {item.unitPrice} × {item.quantity}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t pt-4 space-y-4">
          <div className="flex justify-between items-center text-xl font-bold">
            <span>Total:</span>
            <span className="text-green-600">KES {cartTotal.toFixed(2)}</span>
          </div>
          
          <button
            onClick={completeSale}
            disabled={loading || cart.length === 0}
            className={`w-full py-3 rounded-lg font-semibold text-white transition ${
              loading || cart.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Processing...' : 'Complete Sale'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default POSPage;