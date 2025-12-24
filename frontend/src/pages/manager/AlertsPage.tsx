// frontend/src/pages/manager/ManagerAlertsPage.tsx
// Manager Alerts Page – fully connected to backend (NO dummy data)

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
import { ScrollArea } from '@/components/ui/scroll-area';
import api from '@/lib/axios';
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  Package,
  TrendingDown,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

/* =========================
   Types
========================= */
interface AlertItem {
  id: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  category: string;
  createdAt: string;
  isRead: boolean;
}

interface AlertStats {
  critical: number;
  warning: number;
  lowStock: number;
  expiring: number;
}

/* =========================
   Component
========================= */
export default function ManagerAlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* =========================
     API Calls
  ========================= */
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Backend must return:
      // { alerts: AlertItem[], stats: AlertStats }
      const res = await api.get('/alerts');

      setAlerts(res.data.alerts || []);
      setStats(res.data.stats || null);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
      setError('Failed to load alerts.');
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/alerts/mark-all-read');
      fetchAlerts();
    } catch (err) {
      console.error('Failed to mark alerts as read', err);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  /* =========================
     Helpers
  ========================= */
  const getAlertIcon = (type: AlertItem['type']) => {
    switch (type) {
      case 'CRITICAL':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'WARNING':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'INFO':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  const getAlertBorder = (type: AlertItem['type']) => {
    switch (type) {
      case 'CRITICAL':
        return 'border-l-red-500';
      case 'WARNING':
        return 'border-l-amber-500';
      case 'INFO':
        return 'border-l-emerald-500';
      default:
        return 'border-l-primary';
    }
  };

  /* =========================
     Render
  ========================= */
  return (
    <DashboardLayout role="MANAGER">
      <div className="space-y-6">
        {loading && (
          <p className="text-sm text-muted-foreground">Loading alerts…</p>
        )}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {!loading && stats && (
          <>
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <SummaryCard
                title="Critical Alerts"
                value={stats.critical}
                icon={<XCircle className="h-4 w-4 text-red-500" />}
              />
              <SummaryCard
                title="Warnings"
                value={stats.warning}
                icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
              />
              <SummaryCard
                title="Low Stock"
                value={stats.lowStock}
                icon={<TrendingDown className="h-4 w-4 text-orange-500" />}
              />
              <SummaryCard
                title="Expiring Soon"
                value={stats.expiring}
                icon={<Package className="h-4 w-4 text-primary" />}
              />
            </div>

            {/* Alerts List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Alerts</CardTitle>
                    <CardDescription>
                      Live alerts from inventory & AI predictions
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchAlerts}>
                      Refresh
                    </Button>
                    <Button variant="outline" onClick={markAllRead}>
                      Mark all read
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {alerts.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No alerts available.
                      </p>
                    )}

                    {alerts.map(alert => (
                      <div
                        key={alert.id}
                        className={`rounded-lg border p-4 border-l-4 ${getAlertBorder(alert.type)}`}
                      >
                        <div className="flex items-start gap-4">
                          {getAlertIcon(alert.type)}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">
                                {alert.title}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {new Date(alert.createdAt).toLocaleString()}
                              </div>
                            </div>

                            <p className="mt-1 text-sm text-muted-foreground">
                              {alert.message}
                            </p>

                            <div className="mt-3 flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {alert.category}
                              </Badge>
                              {!alert.isRead && (
                                <Badge className="text-xs">New</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
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
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
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
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
