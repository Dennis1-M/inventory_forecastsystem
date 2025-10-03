import React, { useEffect, useState } from "react";
import api from "../api/axios";

function AlertsList({ refreshKey }) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await api.get("alerts/");
        setAlerts(response.data);
      } catch (error) {
        console.error("Error fetching alerts:", error);
      }
    };
    fetchAlerts();
  }, [refreshKey]);

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Expiry Alerts</h2>
      {alerts.length === 0 ? (
        <p className="text-gray-500">No expiry alerts.</p>
      ) : (
        <ul className="space-y-2">
          {alerts.map((alert) => (
            <li key={alert.id}
  className={`p-3 border rounded-lg ${
    alert.alert_type === "EXPIRY" ? "bg-red-50 text-red-700" :
    alert.alert_type === "STOCK" ? "bg-yellow-50 text-yellow-700" :
    "bg-blue-50 text-blue-700"
  }`}
>
  <strong>{alert.alert_type}</strong> — {alert.message}
</li>

          ))}
        </ul>
      )}
    </div>
  );
}

export default AlertsList;
