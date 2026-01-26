import React, { useState } from 'react';
import { Button, Input, Loading, Table } from '../../components/ui';
import apiService from '../../services/api';

const AdminProductsPage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: '',
    costPrice: '',
    unitPrice: '',
    currentStock: '',
    lowStockThreshold: '',
    reorderPoint: '',
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await apiService.get('/products');
      setProducts(res.data?.data || res.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setForm({
      name: '', sku: '', category: '', costPrice: '', unitPrice: '', currentStock: '', lowStockThreshold: '', reorderPoint: '',
    });
    setShowForm(true);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setForm({
      name: product.name || '',
      sku: product.sku || '',
      category: product.category?.name || '',
      costPrice: product.costPrice?.toString() || '',
      unitPrice: product.unitPrice?.toString() || '',
      currentStock: product.currentStock?.toString() || '',
      lowStockThreshold: product.lowStockThreshold?.toString() || '',
      reorderPoint: product.reorderPoint?.toString() || '',
    });
    setShowForm(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await apiService.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      sku: form.sku,
      costPrice: Number(form.costPrice),
      unitPrice: Number(form.unitPrice),
      currentStock: Number(form.currentStock),
      lowStockThreshold: Number(form.lowStockThreshold),
      reorderPoint: Number(form.reorderPoint),
      // category: form.category, // category handling can be improved
    };
    try {
      if (editingProduct) {
        await apiService.put(`/products/${editingProduct.id}`, payload);
      } else {
        await apiService.post('/products', payload);
      }
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      alert('Failed to save product');
    }
  };

  // Initial load
  React.useEffect(() => { fetchProducts(); }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Product Management</h2>
        <Button label="Add Product" variant="primary" onClick={handleAddProduct} />
      </div>
      {loading ? <Loading /> : error ? <div className="text-red-600">{error}</div> : (
        <Table
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'sku', label: 'SKU' },
            { key: 'unitPrice', label: 'Unit Price' },
            { key: 'currentStock', label: 'Stock' },
            { key: 'actions', label: 'Actions' },
          ]}
          data={products.map((p: any) => ({
            ...p,
            actions: (
              <>
                <Button label="Edit" size="sm" onClick={() => handleEditProduct(p)} />
                <Button label="Delete" size="sm" variant="danger" onClick={() => handleDeleteProduct(p.id)} />
              </>
            ),
          }))}
        />
      )}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form onSubmit={handleFormSubmit} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold mb-2">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
            <Input label="Name" name="name" value={form.name} onChange={handleInputChange} required />
            <Input label="SKU" name="sku" value={form.sku} onChange={handleInputChange} required />
            <Input label="Cost Price" name="costPrice" value={form.costPrice} onChange={handleInputChange} type="number" required />
            <Input label="Unit Price" name="unitPrice" value={form.unitPrice} onChange={handleInputChange} type="number" required />
            <Input label="Stock" name="currentStock" value={form.currentStock} onChange={handleInputChange} type="number" required />
            <Input label="Low Stock Threshold" name="lowStockThreshold" value={form.lowStockThreshold} onChange={handleInputChange} type="number" required />
            <Input label="Reorder Point" name="reorderPoint" value={form.reorderPoint} onChange={handleInputChange} type="number" required />
            {/* Category input can be a dropdown if categories are available */}
            <div className="flex gap-2 justify-end mt-4">
              <Button label="Cancel" variant="secondary" onClick={() => setShowForm(false)} />
              <Button label={editingProduct ? 'Save Changes' : 'Add Product'} type="submit" variant="primary" />
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
