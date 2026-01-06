import React from 'react';
import { Card, CardBody, CardHeader, Table } from '../../components/ui';

interface SaleRecord {
  id: string;
  date: string;
  amount: number;
  items: number;
  paymentMethod: string;
}

const SalesHistoryPage: React.FC = () => {
  const history: SaleRecord[] = [
    { id: '1', date: '2024-01-06', amount: 500, items: 3, paymentMethod: 'Cash' },
    { id: '2', date: '2024-01-05', amount: 1200, items: 5, paymentMethod: 'M-PESA' },
    { id: '3', date: '2024-01-04', amount: 800, items: 4, paymentMethod: 'Card' },
  ];

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'amount', label: 'Amount' },
    { key: 'items', label: 'Items' },
    { key: 'paymentMethod', label: 'Payment Method' },
  ];

  const tableData = history.map(record => ({
    date: record.date,
    amount: `Ksh ${record.amount.toLocaleString()}`,
    items: record.items.toString(),
    paymentMethod: record.paymentMethod,
  }));

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Sales History</h2>
      <Card>
        <CardHeader title="Sales History" subtitle="View all your transactions" />
        <CardBody>
          <Table columns={columns} data={tableData} />
        </CardBody>
      </Card>
    </div>
  );
};

export default SalesHistoryPage;