import { Menu } from "lucide-react";

export default function Topbar({ toggleSidebar, title = "Dashboard", roleLabel = "User" }) {
  return (
    <header className="h-16 bg-white shadow flex items-center px-4 md:ml-64 fixed top-0 left-0 right-0 z-40">
      <button
        className="md:hidden mr-4"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <Menu className="w-6 h-6" />
      </button>

      <h1 className="text-xl font-semibold">{title}</h1>

      <div className="ml-auto flex items-center gap-4">
        <span className="text-gray-700 hidden sm:inline">{roleLabel}</span>
        <img
          src="https://ui-avatars.com/api/?name=User"
          className="w-10 h-10 rounded-full"
          alt="avatar"
        />
      </div>
    </header>
  );
}
