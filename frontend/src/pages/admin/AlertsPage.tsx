import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlertTriangle,
    Bell,
    BellOff,
    Brain,
    Calendar,
    Check,
    Clock,
    Filter,
    Package,
    TrendingDown
} from 'lucide-react';
import { useState } from 'react';

const AlertsPage = () => {
  const [typeFilter, setTypeFilter] = useState('all');

  // Placeholder data - will be replaced with API call
  const alerts: any[] = [];

  const alertTypes = [
    { value: 'all', label: 'All Alerts' },
    { value: 'low_stock', label: 'Low Stock' },
    { value: 'expiry', label: 'Expiring Soon' },
    { value: 'ml_prediction', label: 'ML Predictions' },
    { value: 'demand', label: 'Demand Forecast' },
  ];

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-foreground">Alerts</h1>
            <p className="mt-1 text-muted-foreground">
              Monitor stock alerts and ML predictions
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Check className="h-4 w-4" />
              Mark All Read
            </Button>
            <Button variant="outline" className="gap-2">
              <BellOff className="h-4 w-4" />
              Mute All
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <AlertStatCard
            title="Active Alerts"
            value="—"
            icon={Bell}
            variant="warning"
            delay="0.1s"
          />
          <AlertStatCard
            title="Low Stock"
            value="—"
            icon={TrendingDown}
            variant="destructive"
            delay="0.15s"
          />
          <AlertStatCard
            title="Expiring Soon"
            value="—"
            icon={Calendar}
            variant="warning"
            delay="0.2s"
          />
          <AlertStatCard
            title="ML Insights"
            value="—"
            icon={Brain}
            variant="primary"
            delay="0.25s"
          />
        </div>

        {/* Tabs and Filter */}
        <Tabs defaultValue="active" className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
              <TabsTrigger value="muted">Muted</TabsTrigger>
            </TabsList>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter type" />
              </SelectTrigger>
              <SelectContent>
                {alertTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="active" className="mt-6">
            <AlertsList alerts={alerts} emptyMessage="No active alerts" />
          </TabsContent>
          <TabsContent value="resolved" className="mt-6">
            <AlertsList alerts={[]} emptyMessage="No resolved alerts" />
          </TabsContent>
          <TabsContent value="muted" className="mt-6">
            <AlertsList alerts={[]} emptyMessage="No muted alerts" />
          </TabsContent>
        </Tabs>

        {/* ML Predictions Section */}
        <div className="animate-slide-up rounded-xl border border-border bg-card p-6" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">ML Predictions</h2>
              <p className="text-sm text-muted-foreground">AI-powered inventory insights</p>
            </div>
          </div>
          
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <PredictionCard
              title="Stock Depletion"
              description="Predicted items that may run out"
              status="Awaiting data"
            />
            <PredictionCard
              title="Demand Forecast"
              description="Expected demand for next 7 days"
              status="Awaiting data"
            />
            <PredictionCard
              title="Reorder Suggestions"
              description="Recommended restock quantities"
              status="Awaiting data"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

interface AlertStatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: 'primary' | 'warning' | 'destructive';
  delay: string;
}

const AlertStatCard = ({ title, value, icon: Icon, variant, delay }: AlertStatCardProps) => {
  const variantStyles = {
    primary: 'bg-primary/10 text-primary',
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

interface AlertsListProps {
  alerts: any[];
  emptyMessage: string;
}

const AlertsList = ({ alerts, emptyMessage }: AlertsListProps) => {
  if (alerts.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertTriangle className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">{emptyMessage}</p>
            <p className="text-xs text-muted-foreground">
              Alerts will appear here when connected to backend
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <AlertItem key={alert.id} alert={alert} />
      ))}
    </div>
  );
};

const AlertItem = ({ alert }: { alert: any }) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'low_stock':
        return TrendingDown;
      case 'expiry':
        return Calendar;
      case 'ml_prediction':
        return Brain;
      default:
        return AlertTriangle;
    }
  };

  const Icon = getAlertIcon(alert.type);

  return (
    <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30">
      <div className="rounded-lg bg-warning/10 p-2">
        <Icon className="h-5 w-5 text-warning" />
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-medium text-foreground">{alert.title}</p>
            <p className="text-sm text-muted-foreground">{alert.message}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {alert.createdAt}
          </div>
        </div>
        {alert.product && (
          <div className="mt-2 flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{alert.product}</span>
          </div>
        )}
      </div>
      <Button variant="ghost" size="sm">
        <Check className="h-4 w-4" />
      </Button>
    </div>
  );
};

interface PredictionCardProps {
  title: string;
  description: string;
  status: string;
}

const PredictionCard = ({ title, description, status }: PredictionCardProps) => (
  <div className="rounded-lg border border-dashed border-border bg-secondary/30 p-4">
    <p className="font-medium text-foreground">{title}</p>
    <p className="text-sm text-muted-foreground">{description}</p>
    <Badge variant="secondary" className="mt-3">
      {status}
    </Badge>
  </div>
);

export default AlertsPage;
