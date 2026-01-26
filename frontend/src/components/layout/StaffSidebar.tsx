// frontend/src/components/layout/StaffSidebar.tsx
// This component defines the sidebar navigation for staff members.
// It utilizes a generic Sidebar component and provides it with staff-specific links.
// The links include navigation to the Point of Sale and Sales History pages.
//import React from 'react';



import { Sidebar } from './Sidebar';

const staffLinks = [
  { to: '/staff/pos', label: 'Point of Sale' },
  { to: '/staff/history', label: 'Sales History' },
];

const StaffSidebar = () => {
  return <Sidebar links={staffLinks} />;
};

export default StaffSidebar;