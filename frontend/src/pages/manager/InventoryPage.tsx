// frontend/src/pages/manager/ManagerInventoryPage.tsx
// Manager Inventory Page – backend-connected (NO dummy data)

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import api from '@/lib/axios';
import {
  AlertTriangle,
  ArrowUpDown,
  FileDown,
  Package,
  Search,
  TrendingDown,
} from 'lucide-react';
import { useEffect, useState } from 'react';

/* =========================
   Types
========================= */
interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minStock: number;
  expiryDate: string;
  status: 'normal' | 'low' | 'critical' | 'expiring';
}

interface InventorySummary {
  totalProducts: number;
  categoriesCount: number;
  lowStockCount: number;
  expiringSoonCount: number;
  stockValue: number;
}

/* =========================
   Component
========================= */
export default function ManagerInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  /* =========================
     API Calls
     BACKEND PATHS (EXPLICIT)
     GET /inventory/manager
     GET /inventory/manager/summary
     POST /inventory/manager/restock/:id
  ========================= */
  const fetchInventory = async () => {
    try {
      setLoading(true);

      const [itemsRes, summaryRes] = await Promise.all([
        api.get('/inventory/manager'),
        api.get('/inventory/manager/summary'),
      ]);

      setItems(itemsRes.data || []);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Failed to load inventory', error);
    } finally {
      setLoading(false);
    }
  };

  const requestRestock = async (productId: number) => {
    try {
      await api.post(`/inventory/manager/restock/${productId}`);
      fetchInventory();
    } catch (error) {
      console.error('Failed to request restock', error);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  /* =========================
     Helpers
  ========================= */
  const getStatusBadge = (status: InventoryItem['status']) => {
    switch (status) {
      case 'normal':
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400">
            In Stock
          </Badge>
        );
      case 'low':
        return (
          <Badge className="bg-amber-500/20 text-amber-400">
            Low Stock
          </Badge>
        );
      case 'critical':
        return (
          <Badge className="bg-red-500/20 text-red-400">
            Critical
          </Badge>
        );
      case 'expiring':
        return (
          <Badge className="bg-orange-500/20 text-orange-400">
            Expiring Soon
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.sku.toLowerCase().includes(search.toLowerCase())
  );

  /* =========================
     Render
  ========================= */
  return (
    <DashboardLayout role="MANAGER">
      <div className="space-y-6">
        {loading && (
          <p className="text-sm text-muted-foreground">
            Loading inventory…
          </p>
        )}

        {!loading && summary && (
          <>
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <SummaryCard
                title="Total Products"
                value={summary.totalProducts}
                subtitle={`Across ${summary.categoriesCount} categories`}
                icon={<Package className="h-4 w-4 text-primary" />}
              />

              <SummaryCard
                title="Low Stock Items"
                value={summary.lowStockCount}
                subtitle="Need restocking"
                valueClass="text-amber-400"
                icon={<TrendingDown className="h-4 w-4 text-amber-400" />}
              />

              <SummaryCard
                title="Expiring Soon"
                value={summary.expiringSoonCount}
                subtitle="Within 7 days"
                valueClass="text-orange-400"
                icon={<AlertTriangle className="h-4 w-4 text-orange-400" />}
              />

              <SummaryCard
                title="Stock Value"
                value={`$${summary.stockValue.toLocaleString()}`}
                subtitle="Current inventory value"
                valueClass="text-emerald-400"
                icon={<Package className="h-4 w-4 text-emerald-400" />}
              />
            </div>

            {/* Inventory Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Inventory Items</CardTitle>
                    <CardDescription>
                      Monitor and request stock updates
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search products..."
                        className="pl-9 w-[250px]"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                      />
                    </div>

                    <Button variant="outline" size="icon">
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>

                    <Button variant="outline">
                      <FileDown className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Min Stock</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredItems.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.sku}
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.minStock}
                        </TableCell>
                        <TableCell>{item.expiryDate}</TableCell>
                        <TableCell>
                          {getStatusBadge(item.status)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => requestRestock(item.id)}
                          >
                            Request Restock
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

/* =========================
   Summary Card
========================= */
function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  valueClass,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueClass || ''}`}>
          {value}
        </div>
        <p className="text-xs text-muted-foreground">
          {subtitle}
        </p>
      </CardContent>
    </Card>
  );
}
