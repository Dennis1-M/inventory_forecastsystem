import { 
  BoxesIcon, 
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ClipboardList,
  Package
} from 'lucide-react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

const ManagerDashboard = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout role="MANAGER">
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.firstName}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manager Dashboard — Daily operations and stock management
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Stock Items"
            value="—"
            subtitle="Across all categories"
            icon={BoxesIcon}
            delay="0.1s"
          />
          <StatCard
            title="Pending Requests"
            value="—"
            subtitle="Stock requests to review"
            icon={ClipboardList}
            delay="0.2s"
          />
          <StatCard
            title="Alerts Today"
            value="—"
            subtitle="Requiring attention"
            icon={AlertTriangle}
            variant="warning"
            delay="0.3s"
          />
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Stock Overview */}
          <div className="animate-slide-up rounded-xl border border-border bg-card p-6" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Stock Overview</h2>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <div className="mt-6 flex h-48 items-center justify-center rounded-lg border border-dashed border-border bg-secondary/30">
              <div className="text-center">
                <Package className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Stock levels will display here
                </p>
              </div>
            </div>
          </div>

          {/* Recent Movements */}
          <div className="animate-slide-up rounded-xl border border-border bg-card p-6" style={{ animationDelay: '0.5s' }}>
            <h2 className="text-lg font-semibold text-foreground">Recent Movements</h2>
            <p className="mt-1 text-sm text-muted-foreground">Today's inventory changes</p>
            
            <div className="mt-6 space-y-3">
              <MovementPlaceholder type="in" />
              <MovementPlaceholder type="out" />
              <MovementPlaceholder type="in" />
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        <div className="animate-slide-up rounded-xl border border-border bg-card p-6" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <h2 className="text-lg font-semibold text-foreground">Active Alerts</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            ML-powered alerts will appear here when backend is connected
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'warning';
  delay: string;
}

const StatCard = ({ title, value, subtitle, icon: Icon, variant = 'default', delay }: StatCardProps) => (
  <div 
    className="animate-slide-up rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
    style={{ animationDelay: delay }}
  >
    <div className="flex items-center justify-between">
      <div className={`rounded-lg p-2 ${variant === 'warning' ? 'bg-warning/10' : 'bg-primary/10'}`}>
        <Icon className={`h-5 w-5 ${variant === 'warning' ? 'text-warning' : 'text-primary'}`} />
      </div>
      <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
    </div>
    <div className="mt-4">
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  </div>
);

interface MovementPlaceholderProps {
  type: 'in' | 'out';
}

const MovementPlaceholder = ({ type }: MovementPlaceholderProps) => (
  <div className="flex items-center gap-4 rounded-lg border border-border bg-secondary/30 p-3">
    <div className={`h-2 w-2 rounded-full ${type === 'in' ? 'bg-success' : 'bg-destructive'}`} />
    <div className="flex-1">
      <p className="text-sm text-muted-foreground">
        {type === 'in' ? 'Stock In' : 'Stock Out'} — Awaiting data
      </p>
    </div>
    <span className="text-xs text-muted-foreground">—</span>
  </div>
);

export default ManagerDashboard;
