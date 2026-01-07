import { DollarSign, LogOut, Package, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button, Card, CardBody, CardFooter, CardHeader, Loading } from '../../components/ui';
import apiService from '../../services/api';

interface ShiftData {
  totalSales: number;
  itemsSold: number;
  transactions: number;
  averageTransaction: number;
}

const ShiftSummaryPage: React.FC = () => {
  const [shiftData, setShiftData] = useState<ShiftData>({
    totalSales: 0,
    itemsSold: 0,
    transactions: 0,
    averageTransaction: 0,
  });
  const [loading, setLoading] = useState(true);
  const [endingShift, setEndingShift] = useState(false);

  useEffect(() => {
    const calculateShiftStats = async () => {
      try {
        setLoading(true);
        // Get today's sales from the backend
        const response = await apiService.get('/sales');
        const salesData = response.data?.data || response.data || [];
        
        // Filter for today's sales
        const today = new Date().toLocaleDateString('en-KE');
        const todaysSales = salesData.filter((sale: any) => {
          const saleDate = new Date(sale.createdAt).toLocaleDateString('en-KE');
          return saleDate === today;
        });

        // Calculate metrics
        const totalSales = todaysSales.reduce((sum: number, sale: any) => sum + (sale.totalAmount || 0), 0);
        const itemsSold = todaysSales.reduce((sum: number, sale: any) => {
          return sum + (sale.items?.length || 0);
        }, 0);
        const transactions = todaysSales.length;
        const averageTransaction = transactions > 0 ? Math.round(totalSales / transactions) : 0;

        setShiftData({
          totalSales,
          itemsSold,
          transactions,
          averageTransaction,
        });
      } catch (err) {
        console.error('Failed to load shift summary:', err);
        // Fall back to localStorage if API fails
        const stats = JSON.parse(localStorage.getItem('dailyStats') || '{}');
        setShiftData({
          totalSales: stats.totalSalesAmount || 0,
          itemsSold: stats.itemsSoldCount || 0,
          transactions: stats.salesCount || 0,
          averageTransaction: stats.averageTransaction || 0,
        });
      } finally {
        setLoading(false);
      }
    };

    calculateShiftStats();
  }, []);

  const handleEndShift = async () => {
    try {
      setEndingShift(true);
      
      // Submit shift summary to backend for manager visibility
      try {
        await apiService.post('/activity-logs', {
          action: 'SHIFT_END',
          description: `Shift completed with ${shiftData.transactions} transactions totaling Ksh ${shiftData.totalSales.toLocaleString()}`,
          details: {
            totalSales: shiftData.totalSales,
            itemsSold: shiftData.itemsSold,
            transactions: shiftData.transactions,
            averageTransaction: shiftData.averageTransaction,
            shiftDate: new Date().toISOString()
          }
        });
      } catch (err) {
        console.error('Failed to log shift summary:', err);
      }
      
      // Save final shift stats
      localStorage.setItem('dailyStats', JSON.stringify(shiftData));
      
      // Clear cart
      localStorage.removeItem('cart');
      
      // Logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login
      window.location.href = '/login';
    } catch (err) {
      console.error('Failed to end shift:', err);
      setEndingShift(false);
    }
  };

  if (loading) {
    return <Loading message="Loading shift summary..." />;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Shift Summary</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Sales</p>
              <p className="text-2xl font-bold">Ksh {shiftData.totalSales.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Items Sold</p>
              <p className="text-2xl font-bold">{shiftData.itemsSold}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Transactions</p>
              <p className="text-2xl font-bold">{shiftData.transactions}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-indigo-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Avg Transaction</p>
              <p className="text-2xl font-bold">Ksh {shiftData.averageTransaction.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="End Shift" subtitle="Close your shift and log out" />
        <CardBody>
          <p className="text-gray-600 mb-4">
            Click the button below to end your shift and log out of the system. Your sales summary will be saved.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-sm text-blue-700 font-medium">
              Shift Summary will be recorded:
            </p>
            <ul className="text-sm text-blue-600 mt-2 space-y-1">
              <li>✓ Total Sales: Ksh {shiftData.totalSales.toLocaleString()}</li>
              <li>✓ Items Sold: {shiftData.itemsSold}</li>
              <li>✓ Transactions: {shiftData.transactions}</li>
            </ul>
          </div>
        </CardBody>
        <CardFooter>
          <Button 
            label={endingShift ? "Logging out..." : "End Shift & Logout"} 
            variant="danger" 
            fullWidth 
            onClick={handleEndShift}
            disabled={endingShift}
            icon={!endingShift ? <LogOut className="h-5 w-5" /> : undefined}
          />
        </CardFooter>
      </Card>
    </div>
  );
};

export default ShiftSummaryPage;