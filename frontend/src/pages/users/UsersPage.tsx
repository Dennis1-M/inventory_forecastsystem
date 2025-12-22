import DashboardLayout from '@/components/layouts/DashboardLayout';
import UsersSection from '@/components/UsersSection';

const UsersPage = () => (
  <DashboardLayout role="SUPERADMIN">
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <UsersSection />
    </div>
  </DashboardLayout>
);

export default UsersPage;
