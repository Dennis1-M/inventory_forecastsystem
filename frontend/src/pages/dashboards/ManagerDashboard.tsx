   

import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  BarChart3,
  ShoppingCart,
  DollarSign,
  Clock
} from 'lucide-react';

const ManagerDashboard = () => {
  // Mock data for dashboard stats
  const stats = {
    totalSales: 245680,
    todaySales: 12450,
    totalProducts: 1247,
    lowStockItems: 23,
    totalStaff: 8,
    pendingOrders: 5
  };

  return (
    <>
      <Helmet>
        <title>SuperMart - Manager Dashboard</title>
        <meta name="description" content="Manager dashboard for inventory management, sales analytics, and staff oversight." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Manager Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, Manager</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                <Clock className="inline-block w-4 h-4 mr-1" />
                {new Date().toLocaleDateString('en-KE', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Today's Sales
                </CardTitle>
                <DollarSign className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  KES {stats.todaySales.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  +12% from yesterday
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Products
                </CardTitle>
                <Package className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stats.totalProducts.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active inventory items
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Low Stock Alerts
                </CardTitle>
                <AlertTriangle className="h-5 w-5 text-mpesa" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-mpesa">
                  {stats.lowStockItems}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Items need restocking
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Staff
                </CardTitle>
                <Users className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stats.totalStaff}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Currently on shift
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Package className="h-6 w-6" />
                  <span>Manage Inventory</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <TrendingUp className="h-6 w-6" />
                  <span>View Reports</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Users className="h-6 w-6" />
                  <span>Staff Management</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <ShoppingCart className="h-6 w-6" />
                  <span>Sales History</span>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-mpesa" />
                  Low Stock Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Fresh Milk 500ml', stock: 5, threshold: 20 },
                    { name: 'White Bread', stock: 8, threshold: 15 },
                    { name: 'Eggs (Tray)', stock: 3, threshold: 10 },
                    { name: 'Cooking Oil 1L', stock: 12, threshold: 25 },
                  ].map((item, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <span className="font-medium text-foreground">{item.name}</span>
                      <span className="text-sm text-mpesa font-semibold">
                        {item.stock} left
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
};

export default ManagerDashboard;
