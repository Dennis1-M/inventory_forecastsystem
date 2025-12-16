// src/pages/ProductsManagement.tsx
import { useEffect, useState } from 'react';
import {
    FaBarcode, FaBox, FaBoxes,
    FaChevronDown, FaChevronUp, FaDollarSign, FaEdit,
    FaEye, FaFilter, FaMinus, FaPlus, FaSearch,
    FaSpinner, FaTags,
    FaTimes, FaTrash, FaUpload, FaWarehouse
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Product {
    id: number;
    sku: string;
    name: string;
    description: string;
    category: string;
    subCategory?: string;
    brand?: string;
    unit: string;
    price: number;
    cost: number;
    quantity: number;
    reorderLevel: number;
    minStock: number;
    maxStock?: number;
    location?: string;
    barcode?: string;
    weight?: number;
    dimensions?: string;
    taxRate: number;
    isActive: boolean;
    isDigital: boolean;
    isSerialized: boolean;
    supplierId?: number;
    supplierName?: string;
    createdAt: string;
    updatedAt: string;
    createdBy: {
        id: number;
        name: string;
    };
    images?: string[];
}

interface ProductFormData {
    sku: string;
    name: string;
    description: string;
    category: string;
    subCategory?: string;
    brand?: string;
    unit: string;
    price: number;
    cost: number;
    quantity: number;
    reorderLevel: number;
    minStock: number;
    maxStock?: number;
    location?: string;
    barcode?: string;
    weight?: number;
    dimensions?: string;
    taxRate: number;
    isDigital: boolean;
    isSerialized: boolean;
    supplierId?: number;
}

export default function ProductsManagement() {
    const { token } = useAuth();
    const navigate = useNavigate();
    
    // State Management
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('ALL');
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showQuickEdit, setShowQuickEdit] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [showLowStock, setShowLowStock] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState<ProductFormData>({
        sku: '',
        name: '',
        description: '',
        category: '',
        unit: 'PCS',
        price: 0,
        cost: 0,
        quantity: 0,
        reorderLevel: 10,
        minStock: 5,
        taxRate: 0,
        isDigital: false,
        isSerialized: false,
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [quickEditData, setQuickEditData] = useState({
        price: 0,
        quantity: 0,
        location: ''
    });

    // Fetch products on mount
    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5001/api/products', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch products');
            
            const data = await response.json();
            setProducts(data.data || data);
        } catch (error: any) {
            console.error('Error fetching products:', error);
            showNotification('error', 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/products/categories', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCategories(data.data || data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        const errors: Record<string, string> = {};
        if (!formData.sku.trim()) errors.sku = 'SKU is required';
        if (!formData.name.trim()) errors.name = 'Product name is required';
        if (!formData.category) errors.category = 'Category is required';
        if (formData.price <= 0) errors.price = 'Price must be greater than 0';
        if (formData.cost < 0) errors.cost = 'Cost cannot be negative';
        if (formData.quantity < 0) errors.quantity = 'Quantity cannot be negative';
        
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setIsProcessing(true);
        try {
            const response = await fetch('http://localhost:5001/api/products', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create product');
            }

            showNotification('success', `Product "${formData.name}" created successfully!`);
            setShowCreateForm(false);
            resetForm();
            fetchProducts();
        } catch (error: any) {
            console.error('Error creating product:', error);
            showNotification('error', error.message || 'Failed to create product');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleEditProduct = (product: Product) => {
        setSelectedProduct(product);
        setFormData({
            sku: product.sku,
            name: product.name,
            description: product.description,
            category: product.category,
            subCategory: product.subCategory,
            brand: product.brand,
            unit: product.unit,
            price: product.price,
            cost: product.cost,
            quantity: product.quantity,
            reorderLevel: product.reorderLevel,
            minStock: product.minStock,
            maxStock: product.maxStock,
            location: product.location,
            barcode: product.barcode,
            weight: product.weight,
            dimensions: product.dimensions,
            taxRate: product.taxRate,
            isDigital: product.isDigital,
            isSerialized: product.isSerialized,
            supplierId: product.supplierId
        });
        setShowEditForm(true);
    };

    const handleUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;

        setIsProcessing(true);
        try {
            const response = await fetch(`http://localhost:5001/api/products/${selectedProduct.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update product');
            }

            showNotification('success', `Product "${formData.name}" updated successfully!`);
            setShowEditForm(false);
            resetForm();
            fetchProducts();
        } catch (error: any) {
            console.error('Error updating product:', error);
            showNotification('error', error.message || 'Failed to update product');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeleteProduct = async (productId: number, productName: string) => {
        if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
            return;
        }

        setIsProcessing(true);
        try {
            const response = await fetch(`http://localhost:5001/api/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete product');
            }

            setProducts(products.filter(product => product.id !== productId));
            showNotification('success', `Product "${productName}" deleted successfully!`);
        } catch (error: any) {
            console.error('Error deleting product:', error);
            showNotification('error', error.message || 'Failed to delete product');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleToggleStatus = async (productId: number, currentStatus: boolean) => {
        setIsProcessing(true);
        try {
            const response = await fetch(`http://localhost:5001/api/products/${productId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isActive: !currentStatus })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update product status');
            }

            setProducts(products.map(product => 
                product.id === productId ? { ...product, isActive: !currentStatus } : product
            ));

            showNotification('success', `Product ${currentStatus ? 'deactivated' : 'activated'} successfully!`);
        } catch (error: any) {
            console.error('Error updating product status:', error);
            showNotification('error', error.message || 'Failed to update product status');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleQuickEdit = (product: Product) => {
        setSelectedProduct(product);
        setQuickEditData({
            price: product.price,
            quantity: product.quantity,
            location: product.location || ''
        });
        setShowQuickEdit(true);
    };

    const handleQuickUpdate = async () => {
        if (!selectedProduct) return;

        setIsProcessing(true);
        try {
            const response = await fetch(`http://localhost:5001/api/products/${selectedProduct.id}/quick-update`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(quickEditData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update product');
            }

            showNotification('success', `Product "${selectedProduct.name}" updated successfully!`);
            setShowQuickEdit(false);
            fetchProducts();
        } catch (error: any) {
            console.error('Error updating product:', error);
            showNotification('error', error.message || 'Failed to update product');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBulkUpdate = async (field: 'price' | 'quantity', value: number) => {
        const selectedProducts = products.filter(p => p.id); // Add your selection logic
        if (selectedProducts.length === 0) {
            showNotification('error', 'No products selected');
            return;
        }

        if (!confirm(`Update ${field} for ${selectedProducts.length} products?`)) return;

        setIsProcessing(true);
        try {
            const response = await fetch('http://localhost:5001/api/products/bulk-update', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    productIds: selectedProducts.map(p => p.id),
                    updates: { [field]: value }
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to bulk update');
            }

            showNotification('success', `${selectedProducts.length} products updated successfully!`);
            fetchProducts();
        } catch (error: any) {
            console.error('Error bulk updating:', error);
            showNotification('error', error.message || 'Failed to bulk update');
        } finally {
            setIsProcessing(false);
        }
    };

    const resetForm = () => {
        setFormData({
            sku: '',
            name: '',
            description: '',
            category: '',
            unit: 'PCS',
            price: 0,
            cost: 0,
            quantity: 0,
            reorderLevel: 10,
            minStock: 5,
            taxRate: 0,
            isDigital: false,
            isSerialized: false,
        });
        setFormErrors({});
        setSelectedProduct(null);
    };

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    // Filter products
    const filteredProducts = products.filter(product => {
        const matchesSearch = 
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.barcode?.includes(searchTerm);
        
        const matchesCategory = filterCategory === 'ALL' || product.category === filterCategory;
        const matchesStatus = filterStatus === 'ALL' || 
            (filterStatus === 'ACTIVE' && product.isActive) || 
            (filterStatus === 'INACTIVE' && !product.isActive);
        
        const matchesLowStock = !showLowStock || product.quantity <= product.reorderLevel;
        
        return matchesSearch && matchesCategory && matchesStatus && matchesLowStock;
    });

    // Helper functions
    const getStockStatus = (quantity: number, reorderLevel: number) => {
        if (quantity === 0) return { color: 'bg-red-100 text-red-800 border-red-200', text: 'Out of Stock' };
        if (quantity <= reorderLevel) return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'Low Stock' };
        return { color: 'bg-green-100 text-green-800 border-green-200', text: 'In Stock' };
    };

    const calculateValue = (price: number, quantity: number) => {
        return (price * quantity).toFixed(2);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const getCategoryIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case 'electronics': return <FaBarcode className="text-blue-600" />;
            case 'clothing': return <FaTags className="text-purple-600" />;
            case 'food': return <FaBox className="text-green-600" />;
            case 'furniture': return <FaWarehouse className="text-yellow-600" />;
            default: return <FaBox className="text-gray-600" />;
        }
    };

    // Statistics
    const statistics = {
        totalProducts: products.length,
        activeProducts: products.filter(p => p.isActive).length,
        lowStockProducts: products.filter(p => p.quantity <= p.reorderLevel).length,
        totalValue: products.reduce((sum, p) => sum + (p.price * p.quantity), 0),
        outOfStock: products.filter(p => p.quantity === 0).length
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <FaSpinner className="animate-spin text-blue-600 text-2xl" />
                <span className="ml-2 text-gray-600">Loading products...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 right-4 p-4 rounded-lg border shadow-lg z-50 max-w-md ${
                    notification.type === 'success' 
                        ? 'bg-green-50 border-green-200 text-green-800' 
                        : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                    <div className="flex justify-between items-start">
                        <div className="font-medium">{notification.message}</div>
                        <button
                            onClick={() => setNotification(null)}
                            className="ml-4 text-gray-400 hover:text-gray-600"
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
                        <p className="text-gray-600">Manage inventory and product information</p>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <FaPlus className="mr-2" />
                            Add Product
                        </button>
                        <button
                            onClick={() => handleBulkUpdate('price', 0)}
                            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <FaUpload className="mr-2" />
                            Bulk Update
                        </button>
                        <button
                            onClick={fetchProducts}
                            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            disabled={isProcessing}
                        >
                            <FaSpinner className={`mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Products</p>
                            <p className="text-2xl font-bold text-gray-900">{statistics.totalProducts}</p>
                        </div>
                        <FaBoxes className="text-blue-500 text-xl" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Active Products</p>
                            <p className="text-2xl font-bold text-green-600">{statistics.activeProducts}</p>
                        </div>
                        <FaBox className="text-green-500 text-xl" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Low Stock</p>
                            <p className="text-2xl font-bold text-yellow-600">{statistics.lowStockProducts}</p>
                        </div>
                        <FaExclamationTriangle className="text-yellow-500 text-xl" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Out of Stock</p>
                            <p className="text-2xl font-bold text-red-600">{statistics.outOfStock}</p>
                        </div>
                        <FaMinus className="text-red-500 text-xl" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Value</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(statistics.totalValue)}</p>
                        </div>
                        <FaDollarSign className="text-purple-500 text-xl" />
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products by name, SKU, barcode..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <FaFilter className="mr-2" />
                            Filters
                            {showFilters ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
                        </button>
                        <button
                            onClick={() => setShowLowStock(!showLowStock)}
                            className={`flex items-center px-4 py-2 border rounded-lg ${
                                showLowStock 
                                    ? 'bg-yellow-50 border-yellow-200 text-yellow-700' 
                                    : 'border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            <FaExclamationTriangle className="mr-2" />
                            Low Stock
                        </button>
                    </div>
                </div>
                
                {/* Advanced Filters */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="ALL">All Categories</option>
                                    {categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Range</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Product</th>
                                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">SKU/Category</th>
                                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Pricing</th>
                                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Stock</th>
                                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Value</th>
                                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Status</th>
                                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-gray-500">
                                        <FaBox className="mx-auto text-4xl text-gray-300 mb-2" />
                                        <p>No products found matching your criteria</p>
                                        <button
                                            onClick={() => { 
                                                setSearchTerm(''); 
                                                setFilterCategory('ALL'); 
                                                setFilterStatus('ALL');
                                                setShowLowStock(false);
                                            }}
                                            className="mt-2 text-blue-600 hover:text-blue-700"
                                        >
                                            Clear filters
                                        </button>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => {
                                    const stockStatus = getStockStatus(product.quantity, product.reorderLevel);
                                    return (
                                        <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                                                        {product.images && product.images.length > 0 ? (
                                                            <img 
                                                                src={product.images[0]} 
                                                                alt={product.name}
                                                                className="w-full h-full object-cover rounded"
                                                            />
                                                        ) : (
                                                            <FaBox className="text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{product.name}</p>
                                                        <p className="text-sm text-gray-500 truncate max-w-xs">
                                                            {product.description || 'No description'}
                                                        </p>
                                                        {product.brand && (
                                                            <p className="text-xs text-gray-400">Brand: {product.brand}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="space-y-1">
                                                    <div className="flex items-center">
                                                        <FaBarcode className="mr-1 text-gray-400 text-sm" />
                                                        <span className="text-sm font-mono text-gray-600">{product.sku}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        {getCategoryIcon(product.category)}
                                                        <span className="ml-2 text-sm text-gray-500">{product.category}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="space-y-1">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {formatCurrency(product.price)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Cost: {formatCurrency(product.cost)}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        Margin: {((product.price - product.cost) / product.price * 100).toFixed(1)}%
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="space-y-1">
                                                    <div className="text-sm">
                                                        <span className="font-medium">{product.quantity}</span>
                                                        <span className="text-gray-500 text-xs ml-1">{product.unit}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Reorder: {product.reorderLevel}
                                                    </div>
                                                    {product.location && (
                                                        <div className="text-xs text-gray-400 flex items-center">
                                                            <FaWarehouse className="mr-1" /> {product.location}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {formatCurrency(product.price * product.quantity)}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="space-y-2">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                                                        {stockStatus.text}
                                                    </span>
                                                    <div>
                                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                                                            product.isActive 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {product.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => navigate(`/products/${product.id}`)}
                                                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                                                        title="View Details"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    <button
                                                        onClick={() => handleQuickEdit(product)}
                                                        className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded"
                                                        title="Quick Edit"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditProduct(product)}
                                                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
                                                        title="Full Edit"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(product.id, product.isActive)}
                                                        className={`p-2 rounded ${
                                                            product.isActive
                                                                ? 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                                                                : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                                                        }`}
                                                        title={product.isActive ? 'Deactivate' : 'Activate'}
                                                        disabled={isProcessing}
                                                    >
                                                        {product.isActive ? <FaTimes /> : <FaCheck />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(product.id, product.name)}
                                                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                                                        title="Delete"
                                                        disabled={isProcessing}
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredProducts.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{filteredProducts.length}</span> of{' '}
                                <span className="font-medium">{products.length}</span> products
                            </p>
                            <div className="flex space-x-2">
                                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                                    Previous
                                </button>
                                <button className="px-3 py-1 border border-gray-300 rounded text-sm bg-blue-50 text-blue-600">
                                    1
                                </button>
                                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                                    2
                                </button>
                                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Product Modal */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Create New Product</h3>
                                <button
                                    onClick={() => setShowCreateForm(false)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                            
                            <form onSubmit={handleCreateProduct}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Basic Information */}
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-gray-900 border-b pb-2">Basic Information</h4>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                SKU *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.sku}
                                                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    formErrors.sku ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                                placeholder="PROD-001"
                                            />
                                            {formErrors.sku && (
                                                <p className="mt-1 text-sm text-red-600">{formErrors.sku}</p>
                                            )}
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Product Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    formErrors.name ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                                placeholder="Product Name"
                                            />
                                            {formErrors.name && (
                                                <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                                            )}
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Description
                                            </label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Product description..."
                                            />
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Category *
                                                </label>
                                                <select
                                                    value={formData.category}
                                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                        formErrors.category ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                >
                                                    <option value="">Select Category</option>
                                                    {categories.map(category => (
                                                        <option key={category} value={category}>{category}</option>
                                                    ))}
                                                </select>
                                                {formErrors.category && (
                                                    <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Unit
                                                </label>
                                                <select
                                                    value={formData.unit}
                                                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="PCS">Pieces</option>
                                                    <option value="KG">Kilograms</option>
                                                    <option value="L">Liters</option>
                                                    <option value="M">Meters</option>
                                                    <option value="BOX">Box</option>
                                                    <option value="SET">Set</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pricing & Stock */}
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-gray-900 border-b pb-2">Pricing & Stock</h4>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Price *
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={formData.price}
                                                        onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                                                        className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                            formErrors.price ? 'border-red-300' : 'border-gray-300'
                                                        }`}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                {formErrors.price && (
                                                    <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Cost
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={formData.cost}
                                                        onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value) || 0})}
                                                        className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                            formErrors.cost ? 'border-red-300' : 'border-gray-300'
                                                        }`}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                {formErrors.cost && (
                                                    <p className="mt-1 text-sm text-red-600">{formErrors.cost}</p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Quantity *
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.quantity}
                                                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                        formErrors.quantity ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                    placeholder="0"
                                                />
                                                {formErrors.quantity && (
                                                    <p className="mt-1 text-sm text-red-600">{formErrors.quantity}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Reorder Level
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.reorderLevel}
                                                    onChange={(e) => setFormData({...formData, reorderLevel: parseInt(e.target.value) || 10})}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Minimum Stock
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.minStock}
                                                    onChange={(e) => setFormData({...formData, minStock: parseInt(e.target.value) || 5})}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Maximum Stock
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.maxStock || ''}
                                                    onChange={(e) => setFormData({...formData, maxStock: parseInt(e.target.value) || undefined})}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Optional"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Tax Rate (%)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={formData.taxRate}
                                                onChange={(e) => setFormData({...formData, taxRate: parseFloat(e.target.value) || 0})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>

                                    {/* Additional Information */}
                                    <div className="md:col-span-2 space-y-4">
                                        <h4 className="font-medium text-gray-900 border-b pb-2">Additional Information</h4>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Brand
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.brand || ''}
                                                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Brand name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Barcode
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.barcode || ''}
                                                    onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="123456789012"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Location
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.location || ''}
                                                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Warehouse A, Shelf B3"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Dimensions (L x W x H)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.dimensions || ''}
                                                    onChange={(e) => setFormData({...formData, dimensions: e.target.value})}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="10x5x3 cm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Weight (kg)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.weight || ''}
                                                    onChange={(e) => setFormData({...formData, weight: parseFloat(e.target.value) || undefined})}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="0.5"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="flex space-x-4">
                                            <label className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isDigital}
                                                    onChange={(e) => setFormData({...formData, isDigital: e.target.checked})}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700">Digital Product</span>
                                            </label>
                                            <label className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isSerialized}
                                                    onChange={(e) => setFormData({...formData, isSerialized: e.target.checked})}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700">Serialized Product</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateForm(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isProcessing}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <FaSpinner className="animate-spin mr-2" />
                                                Creating...
                                            </>
                                        ) : (
                                            'Create Product'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Edit Modal */}
            {showQuickEdit && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Quick Edit: {selectedProduct.name}</h3>
                                <button
                                    onClick={() => setShowQuickEdit(false)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Price
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={quickEditData.price}
                                            onChange={(e) => setQuickEditData({...quickEditData, price: parseFloat(e.target.value) || 0})}
                                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Quantity
                                    </label>
                                    <input
                                        type="number"
                                        value={quickEditData.quantity}
                                        onChange={(e) => setQuickEditData({...quickEditData, quantity: parseInt(e.target.value) || 0})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        value={quickEditData.location}
                                        onChange={(e) => setQuickEditData({...quickEditData, location: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Warehouse location"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setShowQuickEdit(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleQuickUpdate}
                                    disabled={isProcessing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {isProcessing ? (
                                        <>
                                            <FaSpinner className="animate-spin mr-2" />
                                            Updating...
                                        </>
                                    ) : (
                                        'Update'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Note: You'll need to add these missing imports
import { FaCheck, FaExclamationTriangle } from 'react-icons/fa';
