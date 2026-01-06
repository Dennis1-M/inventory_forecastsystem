import { DollarSign, Package, TrendingUp } from 'lucide-react';
import React from 'react';
import { Button, Card, CardBody, CardFooter, CardHeader } from '../../components/ui';

const ShiftSummaryPage: React.FC = () => {
  const shiftData = {
    totalSales: 2500,
    itemsSold: 12,
    transactions: 5,
    averageTransaction: 500,
  };

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
          <p className="text-gray-600">
            Click the button below to end your shift and log out of the system. Your sales summary will be saved.
          </p>
        </CardBody>
        <CardFooter>
          <Button label="End Shift & Logout" variant="danger" fullWidth />
        </CardFooter>
      </Card>
    </div>
  );
};

export default ShiftSummaryPage;
