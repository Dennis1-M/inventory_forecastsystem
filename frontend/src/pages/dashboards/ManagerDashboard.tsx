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
  Clock,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ManagerDashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // Optional: redirect to login page if needed
  };

  return (
    <>
      <Helmet>
        <title>SuperMart - Manager Dashboard</title>
        <meta name="description" content="Manager dashboard for inventory management, sales analytics, and staff oversight." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manager Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name}</p>
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
            <Button 
              variant="destructive" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {/* Example stats and quick actions */}
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
                  {/* Replace with dynamic data */}
                  KES 0
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  +0% from yesterday
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
                <div className="text-2xl font-bold text-foreground">0</div>
                <p className="text-xs text-muted-foreground mt-1">Active inventory items</p>
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
                <div className="text-2xl font-bold text-mpesa">0</div>
                <p className="text-xs text-muted-foreground mt-1">Items need restocking</p>
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
                <div className="text-2xl font-bold text-foreground">0</div>
                <p className="text-xs text-muted-foreground mt-1">Currently on shift</p>
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
          </div>
        </main>
      </div>
    </>
  );
};

export default ManagerDashboard;
