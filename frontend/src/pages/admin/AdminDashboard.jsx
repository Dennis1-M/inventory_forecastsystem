import AdminLayout from "@/layouts/AdminLayout";

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow">Total Products</div>
        <div className="bg-white p-6 rounded-xl shadow">Total Sales</div>
        <div className="bg-white p-6 rounded-xl shadow">Forecast Accuracy</div>
      </div>

      <div className="mt-6 bg-white p-6 rounded-xl shadow h-72">Analytics Graph coming soon...</div>
    </AdminLayout>
  );
}
