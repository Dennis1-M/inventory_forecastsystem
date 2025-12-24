import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertTriangle,
    BoxesIcon,
    Download,
    Edit,
    Eye,
    Filter,
    MoreVertical,
    Package,
    Plus,
    Search,
    Trash2,
    Upload
} from 'lucide-react';
import { useState } from 'react';

const InventoryPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Placeholder data - will be replaced with API call
  const products: any[] = [];
  const categories = ['Electronics', 'Clothing', 'Food', 'Hardware', 'Other'];

  const getStockBadge = (quantity: number, threshold: number) => {
    if (quantity === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    if (quantity <= threshold) {
      return <Badge className="border-warning/30 bg-warning/10 text-warning">Low Stock</Badge>;
    }
    return <Badge variant="outline" className="border-success/30 text-success">In Stock</Badge>;
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-foreground">Inventory</h1>
            <p className="mt-1 text-muted-foreground">
              Manage products and stock levels
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="animate-slide-up flex flex-col gap-4 sm:flex-row" style={{ animationDelay: '0.1s' }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat.toLowerCase()}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <QuickStat
            title="Total Products"
            value="—"
            icon={Package}
            delay="0.15s"
          />
          <QuickStat
            title="In Stock"
            value="—"
            icon={BoxesIcon}
            variant="success"
            delay="0.2s"
          />
          <QuickStat
            title="Low Stock"
            value="—"
            icon={AlertTriangle}
            variant="warning"
            delay="0.25s"
          />
          <QuickStat
            title="Out of Stock"
            value="—"
            icon={AlertTriangle}
            variant="destructive"
            delay="0.3s"
          />
        </div>

        {/* Products Table */}
        <div className="animate-slide-up rounded-xl border border-border bg-card" style={{ animationDelay: '0.35s' }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <BoxesIcon className="h-10 w-10 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">No products found</p>
                        <p className="text-xs text-muted-foreground">
                          Products will appear here when connected to backend
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {product.sku}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{product.quantity}</span>
                      <span className="text-muted-foreground"> / {product.threshold}</span>
                    </TableCell>
                    <TableCell>
                      {getStockBadge(product.quantity, product.threshold)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {product.expiryDate || '—'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

interface QuickStatProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  delay: string;
}

const QuickStat = ({ title, value, icon: Icon, variant = 'default', delay }: QuickStatProps) => {
  const variantStyles = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    destructive: 'bg-destructive/10 text-destructive',
  };

  return (
    <div 
      className="animate-slide-up rounded-xl border border-border bg-card p-4"
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2 ${variantStyles[variant]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{title}</p>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;
