import React, { useEffect, useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);

  const fetchJson = async (url, opts = {}) => {
    const res = await fetch(url, opts);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`${res.status} - ${text}`);
    }
    return res.json();
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchJson("/api/products").catch(() => []),
      fetchJson("/api/forecast").catch(() => null),
      fetchJson("/api/alerts").catch(() => []),
    ])
      .then(([p, f, a]) => {
        setProducts(p);
        setForecast(f);
        setAlerts(a);
      })
      .finally(() => setLoading(false));
  }, []);

  const runForecast = async () => {
    setRunning(true);
    try {
      await fetchJson("/api/forecast/run", { method: "POST" });
      const [f, a] = await Promise.all([
        fetchJson("/api/forecast"),
        fetchJson("/api/alerts"),
      ]);
      setForecast(f);
      setAlerts(a);
    } catch (e) {
      setError("Run failed: " + e.message);
    } finally {
      setRunning(false);
    }
  };

  const chartData = useMemo(() => {
    if (!forecast || !forecast.labels) return null;
    return {
      labels: forecast.labels,
      datasets: forecast.series.map((s, i) => ({
        label: s.label || `Series ${i + 1}`,
        data: s.data,
        tension: 0.25,
        borderWidth: 2,
        fill: false,
      })),
    };
  }, [forecast]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Inventory Forecast Dashboard</h1>
          <button
            onClick={runForecast}
            disabled={running}
            className="px-4 py-2 rounded-xl shadow-sm border bg-white hover:bg-slate-100 disabled:opacity-60"
          >
            {running ? "Running..." : "Run Forecast"}
          </button>
        </header>

        {error && (
          <div className="mb-4 text-red-700 bg-red-50 p-3 rounded">{error}</div>
        )}

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 bg-white p-4 rounded-2xl shadow-sm">
            <h2 className="text-lg font-medium mb-3">Products</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-sm text-slate-500 border-b">
                    <th className="py-2">SKU</th>
                    <th className="py-2">Name</th>
                    <th className="py-2">Stock</th>
                    <th className="py-2">Predicted</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400">
                        Loading...
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400">
                        No products found
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-slate-50">
                        <td className="py-3">{p.sku}</td>
                        <td className="py-3">{p.name}</td>
                        <td className="py-3">{p.stock}</td>
                        <td className="py-3">{p.predicted}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <h3 className="text-lg font-medium mb-3">Forecast</h3>
              {chartData ? (
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: "top" },
                    },
                  }}
                />
              ) : (
                <div className="text-slate-500">No forecast data yet</div>
              )}
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <h3 className="text-lg font-medium mb-3">Alerts</h3>
              {alerts.length === 0 ? (
                <div className="text-slate-500">No alerts</div>
              ) : (
                <ul className="space-y-2">
                  {alerts.map((a) => (
                    <li
                      key={a.id}
                      className="p-2 rounded-lg border flex justify-between items-start"
                    >
                      <div>
                        <div className="font-medium">{a.title || a.type}</div>
                        <div className="text-sm text-slate-600">{a.message}</div>
                      </div>
                      <div className="text-sm text-slate-400">
                        {a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
