// frontend/src/components/layout/Header.tsx
// Header.tsx
// A header component for the application.
// It includes a menu button, search bar, notifications, user profile, and logout functionality.
// It uses Tailwind CSS for styling.






import { Bell, Menu, Search, UserCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type HeaderProps = {
  onMenuClick: () => void;
};

const Header = ({ onMenuClick }: HeaderProps) => {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between p-4 bg-white border-b">
      <div className="flex items-center">
        <button onClick={onMenuClick} className="text-gray-500 lg:hidden">
          <Menu />
        </button>
        <div className="relative ml-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-gray-500">
          <Bell />
        </button>
        <div className="relative">
          <button className="flex items-center space-x-2">
            <UserCircle />
            <span className="hidden md:inline">{user?.email}</span>
          </button>
        </div>
        <button
          onClick={logout}
          className="text-sm font-medium text-gray-600 hover:text-indigo-600"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;