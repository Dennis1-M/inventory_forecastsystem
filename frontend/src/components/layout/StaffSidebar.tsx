import Sidebar from './Sidebar';

const staffLinks = [
  { to: '/staff/pos', label: 'Point of Sale' },
  { to: '/staff/history', label: 'Sales History' },
];

const StaffSidebar = () => {
  return <Sidebar links={staffLinks} />;
};

export default StaffSidebar;