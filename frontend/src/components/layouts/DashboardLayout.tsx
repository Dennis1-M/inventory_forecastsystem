import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types/auth';
import {
  AlertTriangle,
  BarChart3,
  BoxesIcon,
  ChevronLeft,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  Users
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: UserRole;
}

// Navigation items by role
const getNavItems = (role: UserRole): NavItem[] => {
  const baseItems: NavItem[] = [
    { label: 'Dashboard', href: `/${role.toLowerCase()}`, icon: LayoutDashboard },
  ];

  switch (role) {
    case 'SUPERADMIN':
      return [
        ...baseItems,
        { label: 'Users', href: '/superadmin/users', icon: Users },
        { label: 'Settings', href: '/superadmin/settings', icon: Settings },
      ];
    case 'ADMIN':
      return [
        ...baseItems,
        { label: 'Users', href: '/admin/users', icon: Users },
        { label: 'Inventory', href: '/admin/inventory', icon: BoxesIcon },
        { label: 'Alerts', href: '/admin/alerts', icon: AlertTriangle },
        { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
        { label: 'Settings', href: '/admin/settings', icon: Settings },
      ];
    case 'MANAGER':
      return [
        ...baseItems,
        { label: 'Inventory', href: '/manager/inventory', icon: BoxesIcon },
        { label: 'Alerts', href: '/manager/alerts', icon: AlertTriangle },
        { label: 'Analytics', href: '/manager/analytics', icon: BarChart3 },
      ];
    case 'STAFF':
      return [
        ...baseItems,
        { label: 'Inventory', href: '/staff/inventory', icon: BoxesIcon },
        { label: 'Alerts', href: '/staff/alerts', icon: AlertTriangle },
      ];
    default:
      return baseItems;
  }
};

const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = getNavItems(role);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-card p-2 lg:hidden"
      >
        <Menu className="h-5 w-5 text-foreground" />
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold text-sidebar-foreground">Inventory</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden rounded-lg p-1.5 text-sidebar-foreground transition-colors hover:bg-sidebar-accent lg:block"
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === `/${role.toLowerCase()}`}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className="border-t border-sidebar-border p-3">
          {!collapsed && user && (
            <div className="mb-3 rounded-lg bg-sidebar-accent px-3 py-2">
              <p className="text-sm font-medium text-sidebar-foreground">
                {user.name}
              </p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
          )}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              'w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive',
              collapsed && 'justify-center px-0'
            )}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Content */}
      <main
        className={cn(
          'flex-1 transition-all duration-300',
          collapsed ? 'lg:ml-16' : 'lg:ml-64'
        )}
      >
        <div className="min-h-screen p-6 pt-16 lg:pt-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
