import axiosClient from "@/lib/axiosClient";
import { AnimatePresence, motion } from "framer-motion";
import { Package } from "lucide-react";
import { useEffect, useState } from "react";
import ProductCard from "./products/ProductCard";
import ProductDetailModal from "./products/ProductDetailModal";

export default function ProductTabs({ onTabChange }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data
  const mockCategories = [
    { id: 1, name: "Electronics" },
    { id: 2, name: "Foods" },
    { id: 3, name: "Clothing" },
  ];

  const mockProducts = [
    {
      id: 1,
      name: "Laptop",
      sku: "SKU001",
      categoryId: 1,
      category: { name: "Electronics" },
      unitPrice: 999.99,
      currentStock: 15,
      lowStockThreshold: 5,
      reorderPoint: 10,
      overStockLimit: 50,
      supplier: { name: "TechSupply Inc" },
    },
    {
      id: 2,
      name: "Mouse",
      sku: "SKU002",
      categoryId: 1,
      category: { name: "Electronics" },
      unitPrice: 29.99,
      currentStock: 3,
      lowStockThreshold: 10,
      reorderPoint: 15,
      overStockLimit: 100,
      supplier: { name: "TechSupply Inc" },
    },
    {
      id: 3,
      name: "Keyboard",
      sku: "SKU003",
      categoryId: 1,
      category: { name: "Electronics" },
      unitPrice: 79.99,
      currentStock: 8,
      lowStockThreshold: 5,
      reorderPoint: 10,
      overStockLimit: 60,
      supplier: { name: "TechSupply Inc" },
    },
    {
      id: 4,
      name: "Rice",
      sku: "SKU004",
      categoryId: 2,
      category: { name: "Foods" },
      unitPrice: 15.99,
      currentStock: 120,
      lowStockThreshold: 20,
      reorderPoint: 50,
      overStockLimit: 500,
      supplier: { name: "FarmFresh Foods" },
    },
    {
      id: 5,
      name: "Pasta",
      sku: "SKU005",
      categoryId: 2,
      category: { name: "Foods" },
      unitPrice: 8.99,
      currentStock: 200,
      lowStockThreshold: 30,
      reorderPoint: 60,
      overStockLimit: 800,
      supplier: { name: "FarmFresh Foods" },
    },
    {
      id: 6,
      name: "T-Shirt",
      sku: "SKU006",
      categoryId: 3,
      category: { name: "Clothing" },
      unitPrice: 19.99,
      currentStock: 45,
      lowStockThreshold: 10,
      reorderPoint: 25,
      overStockLimit: 200,
      supplier: { name: "Fashion World" },
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        axiosClient.get("/api/categories"),
        axiosClient.get("/api/products"),
      ]);
      const cats = catRes.data?.data || mockCategories;
      const prods = prodRes.data?.data || mockProducts;
      setCategories(cats);
      setProducts(prods);
      if (!selectedCategory && cats.length > 0) {
        setSelectedCategory(cats[0].id);
      }
    } catch (err) {
      console.error("Failed to load categories/products:", err);
      setCategories(mockCategories);
      setProducts(mockProducts);
      if (!selectedCategory) setSelectedCategory(mockCategories[0].id);
    } finally {
      setLoading(false);
    }
  }

  // Filter products by selected category
  const filteredProducts = products.filter((p) => p.categoryId === selectedCategory);

  return (
    <div className="space-y-4">
      {/* Category Sub-tabs */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-purple-600" />
          Product Categories
        </h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => {
            const catProducts = products.filter((p) => p.categoryId === cat.id);
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-lg font-medium transition ${
                  isActive
                    ? "bg-purple-600 text-white shadow"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    isActive ? "bg-white bg-opacity-20" : "bg-gray-300"
                  }`}
                >
                  {catProducts.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-lg shadow p-6"
        >
          {loading ? (
            <p className="text-gray-600">Loading products...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-gray-600">No products in this category.</p>
          ) : (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                {categories.find((c) => c.id === selectedCategory)?.name} Products
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onViewDetails={() => setSelectedProduct(product)}
                  />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
