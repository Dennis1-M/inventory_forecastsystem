import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import {
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    BarChart3,
    BoxesIcon,
    Package,
    TrendingUp,
    Users
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.firstName}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Admin Dashboard — Full operational control
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Products"
            value="—"
            change="+0%"
            trend="up"
            icon={BoxesIcon}
            delay="0.1s"
          />
          <StatCard
            title="Low Stock Items"
            value="—"
            change="0"
            trend="neutral"
            icon={AlertTriangle}
            variant="warning"
            delay="0.2s"
          />
          <StatCard
            title="Team Members"
            value="—"
            change="+0"
            trend="up"
            icon={Users}
            delay="0.3s"
          />
          <StatCard
            title="Active Alerts"
            value="—"
            change="0"
            trend="neutral"
            icon={AlertTriangle}
            delay="0.4s"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Activity */}
          <div className="lg:col-span-2 animate-slide-up rounded-xl border border-border bg-card p-6" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Inventory Overview</h2>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <div className="mt-6 flex h-48 items-center justify-center rounded-lg border border-dashed border-border bg-secondary/30">
              <div className="text-center">
                <TrendingUp className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Analytics will appear here when connected to backend
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="animate-slide-up rounded-xl border border-border bg-card p-6" style={{ animationDelay: '0.6s' }}>
            <h2 className="text-lg font-semibold text-foreground">ML Alerts</h2>
            <p className="mt-1 text-sm text-muted-foreground">Predictive insights</p>
            
            <div className="mt-6 space-y-4">
              <AlertItem 
                title="Stock Prediction"
                description="ML predictions will appear here"
                severity="info"
              />
              <AlertItem 
                title="Expiry Alerts"
                description="Expiring items will be flagged"
                severity="warning"
              />
              <AlertItem 
                title="Demand Forecast"
                description="AI-powered demand analysis"
                severity="info"
              />
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="animate-slide-up rounded-xl border border-border bg-card p-6" style={{ animationDelay: '0.7s' }}>
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Recent Stock Movements</h2>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Stock movement history will display here when backend is connected.
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'warning';
  delay: string;
}

const StatCard = ({ title, value, change, trend, icon: Icon, variant = 'default', delay }: StatCardProps) => (
  <div 
    className="animate-slide-up rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
    style={{ animationDelay: delay }}
  >
    <div className="flex items-center justify-between">
      <div className={`rounded-lg p-2 ${variant === 'warning' ? 'bg-warning/10' : 'bg-primary/10'}`}>
        <Icon className={`h-5 w-5 ${variant === 'warning' ? 'text-warning' : 'text-primary'}`} />
      </div>
      {trend !== 'neutral' && (
        <div className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-success' : 'text-destructive'}`}>
          {trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
          {change}
        </div>
      )}
    </div>
    <div className="mt-4">
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{title}</p>
    </div>
  </div>
);

interface AlertItemProps {
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error';
}

const AlertItem = ({ title, description, severity }: AlertItemProps) => {
  const colors = {
    info: 'bg-primary/10 text-primary',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-destructive/10 text-destructive',
  };

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-3">
      <div className={`mt-0.5 h-2 w-2 rounded-full ${colors[severity].split(' ')[0].replace('/10', '')}`} />
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
