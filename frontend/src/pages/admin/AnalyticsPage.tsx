import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Activity,
    BarChart3,
    Calendar,
    DollarSign,
    Package,
    ShoppingCart,
    TrendingDown,
    TrendingUp
} from 'lucide-react';
import { useState } from 'react';

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('7d');

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
            <p className="mt-1 text-muted-foreground">
              Inventory insights and performance metrics
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">Export Report</Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Stock Value"
            value="—"
            change="+0%"
            trend="up"
            icon={DollarSign}
            delay="0.1s"
          />
          <MetricCard
            title="Items Moved"
            value="—"
            change="+0%"
            trend="up"
            icon={ShoppingCart}
            delay="0.15s"
          />
          <MetricCard
            title="Stock Turnover"
            value="—"
            change="+0%"
            trend="up"
            icon={Activity}
            delay="0.2s"
          />
          <MetricCard
            title="Low Stock Rate"
            value="—"
            change="0%"
            trend="neutral"
            icon={Package}
            delay="0.25s"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Stock Movement Chart */}
          <ChartPlaceholder
            title="Stock Movement"
            description="Inbound vs outbound inventory"
            icon={BarChart3}
            delay="0.3s"
          />

          {/* Category Distribution */}
          <ChartPlaceholder
            title="Category Distribution"
            description="Stock breakdown by category"
            icon={Activity}
            delay="0.35s"
          />
        </div>

        {/* Full Width Chart */}
        <ChartPlaceholder
          title="Inventory Trends"
          description="Stock levels over time"
          icon={TrendingUp}
          delay="0.4s"
          fullWidth
        />

        {/* Bottom Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Top Moving Items */}
          <div className="animate-slide-up rounded-xl border border-border bg-card p-6" style={{ animationDelay: '0.45s' }}>
            <h3 className="text-lg font-semibold text-foreground">Top Moving Items</h3>
            <p className="text-sm text-muted-foreground">Highest turnover products</p>
            <div className="mt-4 space-y-3">
              <EmptyListItem />
              <EmptyListItem />
              <EmptyListItem />
            </div>
          </div>

          {/* Low Stock Items */}
          <div className="animate-slide-up rounded-xl border border-border bg-card p-6" style={{ animationDelay: '0.5s' }}>
            <h3 className="text-lg font-semibold text-foreground">Low Stock Items</h3>
            <p className="text-sm text-muted-foreground">Items requiring attention</p>
            <div className="mt-4 space-y-3">
              <EmptyListItem />
              <EmptyListItem />
              <EmptyListItem />
            </div>
          </div>

          {/* Expiring Soon */}
          <div className="animate-slide-up rounded-xl border border-border bg-card p-6" style={{ animationDelay: '0.55s' }}>
            <h3 className="text-lg font-semibold text-foreground">Expiring Soon</h3>
            <p className="text-sm text-muted-foreground">Items nearing expiry</p>
            <div className="mt-4 space-y-3">
              <EmptyListItem />
              <EmptyListItem />
              <EmptyListItem />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  delay: string;
}

const MetricCard = ({ title, value, change, trend, icon: Icon, delay }: MetricCardProps) => (
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
          {trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
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

interface ChartPlaceholderProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  delay: string;
  fullWidth?: boolean;
}

const ChartPlaceholder = ({ title, description, icon: Icon, delay, fullWidth }: ChartPlaceholderProps) => (
  <div 
    className={`animate-slide-up rounded-xl border border-border bg-card p-6 ${fullWidth ? 'lg:col-span-2' : ''}`}
    style={{ animationDelay: delay }}
  >
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Icon className="h-5 w-5 text-muted-foreground" />
    </div>
    <div className={`mt-6 flex items-center justify-center rounded-lg border border-dashed border-border bg-secondary/30 ${fullWidth ? 'h-64' : 'h-48'}`}>
      <div className="text-center">
        <BarChart3 className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          Charts will appear when connected to backend
        </p>
      </div>
    </div>
  </div>
);

const EmptyListItem = () => (
  <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-secondary/30 p-3">
    <div className="h-8 w-8 rounded bg-muted" />
    <div className="flex-1 space-y-1">
      <div className="h-3 w-3/4 rounded bg-muted" />
      <div className="h-2 w-1/2 rounded bg-muted" />
    </div>
  </div>
);

export default AnalyticsPage;
