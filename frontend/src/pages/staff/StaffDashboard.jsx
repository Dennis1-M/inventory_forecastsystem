import StaffLayout from "@/layouts/StaffLayout";

export default function StaffDashboard() {
  return (
    <StaffLayout>
      <h1 className="text-2xl font-bold mb-4">Staff Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl shadow">Products Overview</div>
        <div className="bg-white p-6 rounded-xl shadow">Sales Summary</div>
      </div>

      <div className="mt-6 bg-white p-6 rounded-xl shadow h-72">Activity and forecast graphs here...</div>
    </StaffLayout>
  );
}
