import { History } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, EmptyState, Loading, Table } from '../../components/ui';
import apiService from '../../services/api';

interface SaleRecord {
  id: number;
  totalAmount: number;
  paymentMethod?: string;
  createdAt: string;
  items?: Array<{
    quantity: number;
    product?: { name: string };
  }>;
}

const SalesHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalesHistory = async () => {
      try {
        setLoading(true);
        const response = await apiService.get('/sales');
        const salesData = response.data?.data || response.data || [];
        setHistory(Array.isArray(salesData) ? salesData : []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch sales history:', err);
        setError('Failed to load sales history. Please try again.');
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesHistory();
  }, []);

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'amount', label: 'Amount' },
    { key: 'items', label: 'Items Sold' },
    { key: 'paymentMethod', label: 'Payment Method' },
  ];

  const tableData = history.map(record => ({
    date: new Date(record.createdAt).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }),
    amount: `Ksh ${(record.totalAmount || 0).toLocaleString()}`,
    items: (record.items?.length || 0).toString(),
    paymentMethod: record.paymentMethod || 'N/A',
  }));

  if (loading) {
    return <Loading message="Loading sales history..." />;
  }

  if (error) {
    return (
      <div>
        <h2 className="text-3xl font-bold mb-8">Sales History</h2>
        <Card>
          <CardBody>
            <p className="text-red-600">{error}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div>
        <h2 className="text-3xl font-bold mb-8">Sales History</h2>
        <Card>
          <EmptyState
            icon={History}
            title="No Sales History"
            description="You haven't completed any sales yet. Start by adding products to your cart."
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Sales History</h2>
      <Card>
        <CardHeader 
          title="Sales History" 
          subtitle={`View all ${history.length} of your transactions`}
        />
        <CardBody>
          <Table columns={columns} data={tableData} />
        </CardBody>
      </Card>
    </div>
  );
};

export default SalesHistoryPage;