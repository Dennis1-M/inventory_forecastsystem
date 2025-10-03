import React, { useState } from "react";
import ProductList from "./components/ProductList";
import AddProduct from "./components/AddProduct";
import CategoryForm from "./components/CategoryForm";
import SupplierForm from "./components/SupplierForm";
import CategoryList from "./components/CategoryList";
import SupplierList from "./components/SupplierList";
import SalesForm from "./components/SalesForm";
import SalesList from "./components/SalesList";
import AlertsList from "./components/AlertsList";
import LowStockList from "./components/LowStockList";

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start p-6">
      <div className="max-w-3xl w-full space-y-6">
        <h1 className="text-3xl font-bold text-center mb-6">
          Inventory Dashboard
        </h1>

        {/* Alerts */}
        <AlertsList refreshKey={refreshKey} />
        <LowStockList refreshKey={refreshKey} threshold={5} />

        {/* Categories */}
        <CategoryForm onCategoryAdded={handleRefresh} />
        <CategoryList refreshKey={refreshKey} />

        {/* Suppliers */}
        <SupplierForm onSupplierAdded={handleRefresh} />
        <SupplierList refreshKey={refreshKey} />

        {/* Products */}
        <AddProduct onProductAdded={handleRefresh} />
        <ProductList refreshKey={refreshKey} />

        {/* Sales */}
        <SalesForm onSaleAdded={handleRefresh} />
        <SalesList refreshKey={refreshKey} />
      </div>
    </div>
  );
}

export default App;
