import { Link } from 'react-router-dom';

interface SidebarLink {
    to: string;
    label: string;
}

interface SidebarProps {
    links: SidebarLink[];
}

const Sidebar = ({ links }: SidebarProps) => {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white">
      <div className="p-4 text-2xl font-bold">Dashboard</div>
      <nav>
        <ul>
          {links.map((link: SidebarLink) => (
            <li key={link.to}>
              <Link to={link.to} className="block p-4 hover:bg-gray-700">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;