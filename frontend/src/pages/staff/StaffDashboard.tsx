import { BarChart3, History, ShoppingCart } from 'lucide-react';
import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout';
import CartPage from './CartPage';
import SalesHistoryPage from './SalesHistoryPage';
import SalesPage from './SalesPage';
import ShiftSummaryPage from './ShiftSummaryPage';

const StaffDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('sales');

  const sidebarItems = [
    { icon: <ShoppingCart className="h-5 w-5" />, label: 'Sales', id: 'sales' },
    { icon: <ShoppingCart className="h-5 w-5" />, label: 'Cart & Checkout', id: 'cart' },
    { icon: <History className="h-5 w-5" />, label: 'Sales History', id: 'history' },
    { icon: <BarChart3 className="h-5 w-5" />, label: 'Shift Summary', id: 'shift' },
  ];

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      title="SmartInventory"
      subtitle="Staff Portal"
      userName="Staff User"
      userRole="STAFF"
    >
      {activeTab === 'sales' && <SalesPage />}
      {activeTab === 'cart' && <CartPage />}
      {activeTab === 'history' && <SalesHistoryPage />}
      {activeTab === 'shift' && <ShiftSummaryPage />}
    </DashboardLayout>
  );
};

export default StaffDashboard;
