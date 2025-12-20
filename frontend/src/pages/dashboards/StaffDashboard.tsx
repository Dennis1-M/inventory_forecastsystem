import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import {
    AlertTriangle,
    BoxesIcon,
    CheckCircle2,
    ClipboardCheck,
    Clock
} from 'lucide-react';

const StaffDashboard = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout role="STAFF">
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground">
            Hello, {user?.firstName}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Staff Dashboard — Tasks and inventory viewing
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Assigned Tasks"
            value="—"
            icon={ClipboardCheck}
            delay="0.1s"
          />
          <StatCard
            title="Completed Today"
            value="—"
            icon={CheckCircle2}
            variant="success"
            delay="0.2s"
          />
          <StatCard
            title="Pending Alerts"
            value="—"
            icon={AlertTriangle}
            variant="warning"
            delay="0.3s"
          />
        </div>

        {/* Tasks Section */}
        <div className="animate-slide-up rounded-xl border border-border bg-card p-6" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">My Tasks</h2>
              <p className="mt-1 text-sm text-muted-foreground">Tasks assigned to you</p>
            </div>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
          
          <div className="mt-6 space-y-3">
            <TaskPlaceholder status="pending" />
            <TaskPlaceholder status="in_progress" />
            <TaskPlaceholder status="completed" />
          </div>
        </div>

        {/* Quick View Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Stock View */}
          <div className="animate-slide-up rounded-xl border border-border bg-card p-6" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center gap-3">
              <BoxesIcon className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Stock Levels</h2>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              View-only access to current inventory levels. Data will load when connected.
            </p>
          </div>

          {/* Alerts */}
          <div className="animate-slide-up rounded-xl border border-border bg-card p-6" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <h2 className="text-lg font-semibold text-foreground">Relevant Alerts</h2>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Alerts relevant to your tasks will appear here.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'success' | 'warning';
  delay: string;
}

const StatCard = ({ title, value, icon: Icon, variant = 'default', delay }: StatCardProps) => {
  const variants = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
  };

  return (
    <div 
      className="animate-slide-up rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
      style={{ animationDelay: delay }}
    >
      <div className={`inline-flex rounded-lg p-2 ${variants[variant]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    </div>
  );
};

interface TaskPlaceholderProps {
  status: 'pending' | 'in_progress' | 'completed';
}

const TaskPlaceholder = ({ status }: TaskPlaceholderProps) => {
  const statusStyles = {
    pending: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Pending' },
    in_progress: { bg: 'bg-primary/20', text: 'text-primary', label: 'In Progress' },
    completed: { bg: 'bg-success/20', text: 'text-success', label: 'Completed' },
  };

  const style = statusStyles[status];

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4">
      <div className="flex items-center gap-3">
        <div className={`h-2 w-2 rounded-full ${style.bg.replace('/20', '')}`} />
        <span className="text-sm text-muted-foreground">Task awaiting data...</span>
      </div>
      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    </div>
  );
};

export default StaffDashboard;
