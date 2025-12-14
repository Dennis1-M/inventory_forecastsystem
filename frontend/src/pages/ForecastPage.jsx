import React, { useEffect, useState } from "react";
import ForecastChart from "../components/forecast/ForecastChart";
import forecastService from "../services/forecastService";

export default function ForecastPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await forecastService.list();
        if (mounted) setData(res?.data || res || []);
      } catch (err) {
        console.error("Failed to load forecasts", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  if (loading) return <p>Loading forecasts…</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Forecasts</h2>
      <ForecastChart data={data} type={"line"} title={"Actual vs Predicted"} />
    </div>
  );
}
