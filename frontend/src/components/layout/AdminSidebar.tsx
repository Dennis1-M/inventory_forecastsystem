import Sidebar from './Sidebar';

const adminLinks = [
  { to: '/admin/users', label: 'User Management' },
  { to: '/admin/health', label: 'System Health' },
  { to: '/admin/data', label: 'Data Management' },
  { to: '/admin/settings', label: 'Settings' },
];

const AdminSidebar = () => {
  return <Sidebar links={adminLinks} />;
};

export default AdminSidebar;