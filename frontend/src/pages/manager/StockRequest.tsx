// src/pages/manager/StockRequest.tsx - WITH REAL API CALLS
import React, { useEffect, useState } from 'react';
import { FaBox, FaCheckCircle, FaExclamationTriangle, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../services/managerApi'; // Fixed import
import { managerApi } from '../../services/managerApi';

interface StockRequestForm {
  productId: number;
  productName: string;
  currentStock: number;
  lowStockThreshold: number; // Changed from minimumStock
  reorderPoint: number; // Added reorderPoint
  requestedQuantity: number;
  urgency: 'high' | 'medium' | 'low';
  reason: string;
  notes?: string;
}

export default function StockRequestPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [request, setRequest] = useState<StockRequestForm>({
    productId: 0,
    productName: '',
    currentStock: 0,
    lowStockThreshold: 0, // Changed from minimumStock
    reorderPoint: 0, // Added
    requestedQuantity: 0,
    urgency: 'medium',
    reason: 'low_stock'
  });

  useEffect(() => {
    fetchLowStockItems();
  }, []);

  const fetchLowStockItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const lowStockItems = await managerApi.getLowStockItems();
      setProducts(lowStockItems);
      
      // Auto-select first low stock item
      if (lowStockItems.length > 0) {
        const firstItem = lowStockItems[0];
        const recommendedQuantity = Math.max(
          firstItem.reorderPoint - firstItem.currentStock, // Use reorderPoint
          firstItem.lowStockThreshold // Use lowStockThreshold
        );
        
        setRequest({
          productId: firstItem.id,
          productName: firstItem.name,
          currentStock: firstItem.currentStock,
          lowStockThreshold: firstItem.lowStockThreshold, // Changed
          reorderPoint: firstItem.reorderPoint, // Added
          requestedQuantity: recommendedQuantity,
          urgency: getUrgencyLevel(firstItem.currentStock, firstItem.lowStockThreshold), // Changed
          reason: 'low_stock'
        });
      }
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      setError('Failed to load low stock items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyLevel = (current: number, lowStockThreshold: number): 'high' | 'medium' | 'low' => {
    const percentage = (current / lowStockThreshold) * 100;
    if (percentage <= 30) return 'high';
    if (percentage <= 50) return 'medium';
    return 'low';
  };

  const handleProductChange = (productId: number) => {
    const selectedProduct = products.find(p => p.id === productId);
    if (selectedProduct) {
      const recommendedQuantity = Math.max(
        selectedProduct.reorderPoint - selectedProduct.currentStock, // Use reorderPoint
        selectedProduct.lowStockThreshold // Use lowStockThreshold
      );
      
      setRequest({
        ...request,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        currentStock: selectedProduct.currentStock,
        lowStockThreshold: selectedProduct.lowStockThreshold, // Changed
        reorderPoint: selectedProduct.reorderPoint, // Added
        requestedQuantity: recommendedQuantity,
        urgency: getUrgencyLevel(selectedProduct.currentStock, selectedProduct.lowStockThreshold) // Changed
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!request.productId || request.requestedQuantity <= 0) {
      setError('Please select a product and enter a valid quantity');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      // Send request to API - Use requestStock method which should exist
      await managerApi.requestStock({
        productId: request.productId,
        quantity: request.requestedQuantity,
        urgency: request.urgency,
        reason: request.reason,
        notes: request.notes
      });
      
      setSuccess(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        setRequest({
          productId: 0,
          productName: '',
          currentStock: 0,
          lowStockThreshold: 0, // Changed
          reorderPoint: 0, // Added
          requestedQuantity: 0,
          urgency: 'medium',
          reason: 'low_stock'
        });
        navigate('/manager/dashboard');
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting stock request:', error);
      setError('Failed to submit stock request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStockStatus = (current: number, lowStockThreshold: number) => {
    const percentage = (current / lowStockThreshold) * 100;
    if (percentage <= 30) return { color: 'text-red-600', text: 'Critical', bg: 'bg-red-100' };
    if (percentage <= 50) return { color: 'text-yellow-600', text: 'Low', bg: 'bg-yellow-100' };
    if (percentage <= 80) return { color: 'text-blue-600', text: 'Moderate', bg: 'bg-blue-100' };
    return { color: 'text-green-600', text: 'Good', bg: 'bg-green-100' };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-green-600 text-2xl" />
        <span className="ml-2 text-gray-600">Loading stock data from database...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Request Stock</h1>
          <p className="text-gray-600">Order new inventory items from database</p>
        </div>
        <button
          onClick={fetchLowStockItems}
          className="p-2 text-gray-500 hover:text-green-600"
          disabled={loading}
        >
          <FaSpinner className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <FaExclamationTriangle className="text-red-500" />
            <div>
              <h3 className="font-semibold text-red-800">Error</h3>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Low Stock Alert */}
      {products.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaBox className="text-yellow-500" />
              <div>
                <h3 className="font-semibold text-yellow-800">
                  {products.length} items need restocking
                </h3>
                <p className="text-sm text-yellow-600">
                  These items are below low stock threshold levels in the database
                </p>
              </div>
            </div>
            <span className="text-sm text-yellow-800 font-medium">
              Total value: ${products.reduce((sum, p) => sum + (p.currentStock * p.unitPrice), 0).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Request Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Stock Request Form</h2>
            </div>
            <div className="p-6">
              {success ? (
                <div className="text-center py-8">
                  <FaCheckCircle className="text-green-500 text-4xl mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Stock Request Submitted!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Your request has been saved to the database and sent to purchasing.
                  </p>
                  <button
                    onClick={() => navigate('/manager/dashboard')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Return to Dashboard
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Product from Database
                    </label>
                    <select
                      value={request.productId}
                      onChange={(e) => handleProductChange(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      disabled={products.length === 0}
                    >
                      <option value="0">Select a product...</option>
                      {products.map((product) => {
                        const status = getStockStatus(product.currentStock, product.lowStockThreshold); // Changed
                        return (
                          <option key={product.id} value={product.id}>
                            {product.name} (SKU: {product.sku}) - Stock: {product.currentStock}, Low Stock: {product.lowStockThreshold} {/* Changed */}
                          </option>
                        );
                      })}
                    </select>
                    {products.length === 0 && (
                      <p className="text-sm text-gray-500 mt-1">No low stock items found in database</p>
                    )}
                  </div>

                  {request.productId > 0 && (
                    <>
                      {/* Product Details Card */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Product Details
                            </label>
                            <div>
                              <p className="font-medium">{request.productName}</p>
                              <p className="text-sm text-gray-500">ID: {request.productId}</p>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Stock Status
                            </label>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded ${
                                getStockStatus(request.currentStock, request.lowStockThreshold).bg // Changed
                              } ${getStockStatus(request.currentStock, request.lowStockThreshold).color}`}> {/* Changed */}
                                {getStockStatus(request.currentStock, request.lowStockThreshold).text} {/* Changed */}
                              </span>
                              <span className="text-sm text-gray-600">
                                {request.currentStock} / {request.lowStockThreshold} units {/* Changed */}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div
                                className={`h-2 rounded-full ${
                                  (request.currentStock / request.lowStockThreshold) * 100 <= 30 ? 'bg-red-600' : // Changed
                                  (request.currentStock / request.lowStockThreshold) * 100 <= 50 ? 'bg-yellow-600' : // Changed
                                  'bg-green-600'
                                }`}
                                style={{ width: `${Math.min((request.currentStock / request.lowStockThreshold) * 100, 100)}%` }} // Changed
                              ></div>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Recommended Order
                            </label>
                            <p className="text-lg font-bold text-green-600">
                              {Math.max(request.reorderPoint - request.currentStock, request.lowStockThreshold)} units {/* Changed */}
                            </p>
                            <p className="text-xs text-gray-500">To reach reorder point: {request.reorderPoint}</p> {/* Added */}
                          </div>
                        </div>
                      </div>

                      {/* Request Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Requested Quantity *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={request.requestedQuantity}
                            onChange={(e) => setRequest({...request, requestedQuantity: parseInt(e.target.value) || 0})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Enter quantity"
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Minimum recommended: {Math.max(request.reorderPoint - request.currentStock, request.lowStockThreshold)} {/* Changed */}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Urgency Level
                          </label>
                          <div className="flex space-x-4">
                            {[
                              { value: 'high', label: 'High', color: 'red' },
                              { value: 'medium', label: 'Medium', color: 'yellow' },
                              { value: 'low', label: 'Low', color: 'green' }
                            ].map((level) => (
                              <label key={level.value} className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  name="urgency"
                                  value={level.value}
                                  checked={request.urgency === level.value}
                                  onChange={(e) => setRequest({...request, urgency: e.target.value as any})}
                                  className={`text-${level.color}-600 focus:ring-${level.color}-500`}
                                />
                                <span className={`capitalize text-${level.color}-600`}>{level.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reason for Request
                        </label>
                        <select
                          value={request.reason}
                          onChange={(e) => setRequest({...request, reason: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="low_stock">Low Stock Level</option>
                          <option value="anticipated_demand">Anticipated High Demand</option>
                          <option value="seasonal">Seasonal Requirement</option>
                          <option value="new_product">New Product Line</option>
                          <option value="damaged_stock">Replacement for Damaged Stock</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Additional Notes (Optional)
                        </label>
                        <textarea
                          rows={3}
                          value={request.notes || ''}
                          onChange={(e) => setRequest({...request, notes: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Add any additional information..."
                        ></textarea>
                      </div>

                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => navigate('/manager/dashboard')}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                          disabled={submitting}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submitting || request.productId === 0}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submitting ? (
                            <>
                              <FaSpinner className="animate-spin" />
                              <span>Submitting to Database...</span>
                            </>
                          ) : (
                            <>
                              <FaPaperPlane />
                              <span>Submit Request</span>
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Low Stock Items Sidebar */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Low Stock Items</h2>
                <span className="text-sm text-gray-500">{products.length} items</span>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {products.map((item) => {
                  const status = getStockStatus(item.currentStock, item.lowStockThreshold); // Changed
                  return (
                    <div
                      key={item.id}
                      className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition ${
                        request.productId === item.id ? 'border-green-500 bg-green-50' : 'border-gray-200'
                      }`}
                      onClick={() => handleProductChange(item.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-500">{item.sku}</p>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${status.color}`}>
                            {item.currentStock}
                          </div>
                          <div className="text-xs text-gray-500">of {item.lowStockThreshold} min</div> {/* Changed */}
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                        <div
                          className={`h-2 rounded-full ${
                            (item.currentStock / item.lowStockThreshold) * 100 <= 30 ? 'bg-red-600' : // Changed
                            (item.currentStock / item.lowStockThreshold) * 100 <= 50 ? 'bg-yellow-600' : // Changed
                            'bg-blue-600'
                          }`}
                          style={{ width: `${Math.min((item.currentStock / item.lowStockThreshold) * 100, 100)}%` }} // Changed
                        ></div>
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{item.category?.name || 'No Category'}</span> {/* Changed */}
                        <span>{item.supplier?.name || 'No Supplier'}</span> {/* Changed */}
                      </div>
                      
                      <div className="mt-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${status.bg} ${status.color}`}>
                          {status.text}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {products.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FaBox className="text-gray-300 text-3xl mx-auto mb-2" />
                  <p>No low stock items in database</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Stats Summary */}
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium mb-3">Stock Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Low Stock Items:</span>
                <span className="font-medium">{products.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Critical Items (&lt;30%):</span>
                <span className="font-medium text-red-600">
                  {products.filter(p => (p.currentStock / p.lowStockThreshold) * 100 <= 30).length} {/* Changed */}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Low Items (30-50%):</span>
                <span className="font-medium text-yellow-600">
                  {products.filter(p => {
                    const percent = (p.currentStock / p.lowStockThreshold) * 100; // Changed
                    return percent > 30 && percent <= 50;
                  }).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reorder Point Needed:</span>
                <span className="font-medium text-blue-600">
                  {products.filter(p => p.currentStock <= p.reorderPoint).length} {/* New */}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}