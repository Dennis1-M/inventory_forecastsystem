import { Search, ShoppingCart } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button, Card, EmptyState, Input, Loading } from '../../components/ui';
import { useProducts } from '../../hooks';
import apiService from '../../services/api';

const SalesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<any[]>([]);
  const { products, loading } = useProducts();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiService.get('/categories');
        setCategories(response.data || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.categoryId === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: any) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item: any) => item.productId === product.id);

    const price = product.unitPrice || product.price || 0;

    if (existingItem) {
      existingItem.quantity += 1;
      existingItem.total = existingItem.quantity * existingItem.unitPrice;
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        unitPrice: price,
        quantity: 1,
        total: price
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  if (loading) {
    return <Loading message="Loading products..." />;
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-6">Sales</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Input
            label="Search Products"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={Search}
              title="No Products Found"
              description="Try adjusting your search or category filter."
            />
          </div>
        ) : (
          filteredProducts.map(product => (
            <Card key={product.id}>
              <div className="flex flex-col h-full">
                <h3 className="text-lg font-bold mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-4 flex-1">{product.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-2xl font-bold text-indigo-600">
                    Ksh {(product.unitPrice || product.price || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {product.currentStock || product.stock || 0} in stock
                  </p>
                </div>
                <Button
                  label="Add to Cart"
                  icon={<ShoppingCart className="h-5 w-5" />}
                  variant="primary"
                  fullWidth
                  onClick={() => handleAddToCart(product)}
                />
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SalesPage;
