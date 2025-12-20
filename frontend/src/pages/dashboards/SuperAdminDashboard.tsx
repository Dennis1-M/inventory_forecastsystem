import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import {
    Activity,
    ArrowDownRight,
    ArrowUpRight,
    Settings,
    ShieldCheck,
    Users
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout role="SUPERADMIN">
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.firstName}
          </h1>
          <p className="mt-1 text-muted-foreground">
            SuperAdmin Dashboard — System overview and user management
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value="—"
            change="+0%"
            trend="up"
            icon={Users}
            delay="0.1s"
          />
          <StatCard
            title="Admins"
            value="—"
            change="+0%"
            trend="neutral"
            icon={ShieldCheck}
            delay="0.2s"
          />
          <StatCard
            title="Active Sessions"
            value="—"
            change="+0%"
            trend="up"
            icon={Activity}
            delay="0.3s"
          />
          <StatCard
            title="System Health"
            value="—"
            change="OK"
            trend="up"
            icon={Settings}
            delay="0.4s"
          />
        </div>

        {/* Quick Actions */}
        <div className="animate-slide-up rounded-xl border border-border bg-card p-6" style={{ animationDelay: '0.5s' }}>
          <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your system from here
          </p>
          
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ActionCard
              title="Create Admin"
              description="Add new admin users"
              icon={Users}
            />
            <ActionCard
              title="System Settings"
              description="Configure system parameters"
              icon={Settings}
            />
            <ActionCard
              title="View Activity"
              description="Monitor user sessions"
              icon={Activity}
            />
          </div>
        </div>

        {/* Info Panel */}
        <div className="animate-slide-up rounded-xl border border-border bg-card p-6" style={{ animationDelay: '0.6s' }}>
          <h2 className="text-lg font-semibold text-foreground">System Status</h2>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
            <span className="text-sm text-muted-foreground">
              Backend connection pending — Connect your API to see live data
            </span>
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
  delay: string;
}

const StatCard = ({ title, value, change, trend, icon: Icon, delay }: StatCardProps) => (
  <div 
    className="animate-slide-up rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
    style={{ animationDelay: delay }}
  >
    <div className="flex items-center justify-between">
      <div className="rounded-lg bg-primary/10 p-2">
        <Icon className="h-5 w-5 text-primary" />
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

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ActionCard = ({ title, description, icon: Icon }: ActionCardProps) => (
  <button className="flex items-start gap-4 rounded-lg border border-border bg-secondary/50 p-4 text-left transition-colors hover:border-primary/30 hover:bg-secondary">
    <div className="rounded-lg bg-primary/10 p-2">
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <div>
      <p className="font-medium text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </button>
);

export default SuperAdminDashboard;
