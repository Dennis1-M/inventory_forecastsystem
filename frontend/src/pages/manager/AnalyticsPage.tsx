// frontend/src/pages/manager/ManagerAnalyticsPage.tsx
// Manager Analytics Page – backend-connected (NO dummy data, API-driven)

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import api from '@/lib/axios';
import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Package,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

/* =========================
   Types
========================= */
interface KPIStats {
  weeklySales: number;
  weeklySalesChange: number;
  itemsSold: number;
  itemsSoldChange: number;
  restocksDone: number;
  restocksChange: number;
  wasteReducedPercent: number;
}

interface WeeklySalesItem {
  day: string;
  sales: number;
}

interface CategoryDistributionItem {
  name: string;
  value: number;
  color: string;
}

interface TrendItem {
  week: string;
  actual: number;
  predicted: number;
}

/* =========================
   Component
========================= */
export default function ManagerAnalyticsPage() {
  const [kpis, setKpis] = useState<KPIStats | null>(null);
  const [weeklySales, setWeeklySales] = useState<WeeklySalesItem[]>([]);
  const [categories, setCategories] = useState<CategoryDistributionItem[]>([]);
  const [trendData, setTrendData] = useState<TrendItem[]>([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     API Calls
  ========================= */
  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Expected backend response:
      // {
      //   kpis: KPIStats,
      //   weeklySales: WeeklySalesItem[],
      //   categories: CategoryDistributionItem[],
      //   trends: TrendItem[]
      // }
      const res = await api.get('/analytics/manager');

      setKpis(res.data.kpis);
      setWeeklySales(res.data.weeklySales || []);
      setCategories(res.data.categories || []);
      setTrendData(res.data.trends || []);
    } catch (error) {
      console.error('Failed to load analytics', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  /* =========================
     Render
  ========================= */
  return (
    <DashboardLayout role="MANAGER">
      <div className="space-y-6">
        {loading && (
          <p className="text-sm text-muted-foreground">
            Loading analytics…
          </p>
        )}

        {!loading && kpis && (
          <>
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <KPICard
                title="Weekly Sales"
                value={`$${kpis.weeklySales.toLocaleString()}`}
                change={kpis.weeklySalesChange}
                icon={<DollarSign className="h-4 w-4 text-emerald-500" />}
              />

              <KPICard
                title="Items Sold"
                value={kpis.itemsSold.toLocaleString()}
                change={kpis.itemsSoldChange}
                icon={<Package className="h-4 w-4 text-primary" />}
              />

              <KPICard
                title="Restocks Done"
                value={kpis.restocksDone.toLocaleString()}
                change={kpis.restocksChange}
                icon={<TrendingUp className="h-4 w-4 text-amber-500" />}
              />

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Waste Reduced
                  </CardTitle>
                  <TrendingDown className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {kpis.wasteReducedPercent}%
                  </div>
                  <p className="text-xs text-emerald-500">
                    Improvement this month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Weekly Sales */}
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Sales Overview</CardTitle>
                  <CardDescription>
                    Daily sales performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklySales}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="sales"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Sales by Category</CardTitle>
                  <CardDescription>
                    Product category distribution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={categories}
                        dataKey="value"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                      >
                        {categories.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="mt-4 flex flex-wrap justify-center gap-4">
                    {categories.map(cat => (
                      <div
                        key={cat.name}
                        className="flex items-center gap-2"
                      >
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-sm text-muted-foreground">
                          {cat.name} ({cat.value}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ML Prediction */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>ML Demand Predictions</CardTitle>
                    <CardDescription>
                      Actual vs predicted trends
                    </CardDescription>
                  </div>
                  <Badge className="bg-primary/20 text-primary">
                    AI Powered
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="#f59e0b"
                      strokeDasharray="5 5"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

/* =========================
   KPI Card
========================= */
function KPICard({
  title,
  value,
  change,
  icon,
}: {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
}) {
  const positive = change >= 0;

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
        <div
          className={`flex items-center text-xs ${
            positive ? 'text-emerald-500' : 'text-red-500'
          }`}
        >
          {positive ? (
            <ArrowUpRight className="mr-1 h-3 w-3" />
          ) : (
            <ArrowDownRight className="mr-1 h-3 w-3" />
          )}
          {Math.abs(change)}% from last week
        </div>
      </CardContent>
    </Card>
  );
}
