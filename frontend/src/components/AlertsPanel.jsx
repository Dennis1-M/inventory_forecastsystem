import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";

export default function AlertsPanel({ alerts = [] }) {
  const defaultAlerts = [
    {
      id: 1,
      type: "critical",
      title: "Critical: Out of Stock",
      message: "Product 'Laptop' is out of stock. Immediate reorder recommended.",
      icon: AlertTriangle,
    },
    {
      id: 2,
      type: "warning",
      title: "Low Stock Alert",
      message: "Product 'Mouse' stock is below threshold. Reorder soon.",
      icon: AlertCircle,
    },
    {
      id: 3,
      type: "info",
      title: "Overstock Detected",
      message: "Product 'Keyboard' has exceeded overstock limit.",
      icon: Info,
    },
    {
      id: 4,
      type: "success",
      title: "Restock Completed",
      message: "Product 'Monitor' successfully restocked with 50 units.",
      icon: CheckCircle,
    },
  ];

  const displayAlerts = alerts.length > 0 ? alerts : defaultAlerts;

  const typeStyles = {
    critical: "bg-red-50 border-red-200 text-red-700",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-700",
    info: "bg-blue-50 border-blue-200 text-blue-700",
    success: "bg-green-50 border-green-200 text-green-700",
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Alerts</h2>

      <div className="space-y-3">
        {displayAlerts.map((alert) => {
          const Icon = alert.icon;
          const style = typeStyles[alert.type] || typeStyles.info;

          return (
            <div key={alert.id} className={`${style} border rounded-lg p-4 flex gap-3`}>
              <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{alert.title}</p>
                <p className="text-sm opacity-85">{alert.message}</p>
              </div>
            </div>
          );
        })}
      </div>

      {displayAlerts.length === 0 && (
        <p className="text-gray-600 text-sm">No alerts at this time.</p>
      )}
    </div>
  );
}
