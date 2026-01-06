import Sidebar from './Sidebar';

const managerLinks = [
  { to: '/manager/inventory', label: 'Inventory' },
  { to: '/manager/alerts', label: 'Alerts' },
  { to: '/manager/suppliers', label: 'Suppliers' },
  { to: '/manager/analytics', label: 'Sales Analytics' },
  { to: '/manager/forecasting', label: 'Forecasting' },
];

const ManagerSidebar = () => {
  return <Sidebar links={managerLinks} />;
};

export default ManagerSidebar;