import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  ChartBarIcon, 
  UsersIcon, 
  OfficeBuildingIcon, 
  MotorcycleIcon,
  CogIcon,
  LogoutIcon 
} from './Icons';

const AdminNavbar: React.FC = () => {
  const commonLinkClasses = "flex items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors duration-200";
  const activeLinkClasses = "bg-gray-900 text-white font-semibold";

  const NavItem: React.FC<{ to: string, icon: React.ReactNode, text: string }> = ({ to, icon, text }) => (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) => `${commonLinkClasses} ${isActive ? activeLinkClasses : ''}`}
      >
        {icon}
        <span className="ml-3">{text}</span>
      </NavLink>
    </li>
  );

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col h-screen sticky top-0">
      <div className="flex items-center justify-center h-20 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-orange-500">
          Admin<span className="text-white">Panel</span>
        </h1>
      </div>
      <nav className="flex-grow p-4">
        <ul className="space-y-2">
          <NavItem to="/admin/dashboard" icon={<ChartBarIcon className="h-6 w-6" />} text="Bảng điều khiển" />
          <NavItem to="/admin/users" icon={<UsersIcon className="h-6 w-6" />} text="Người dùng" />
          <NavItem to="/admin/restaurants" icon={<OfficeBuildingIcon className="h-6 w-6" />} text="Nhà hàng" />
          <NavItem to="/admin/shippers" icon={<MotorcycleIcon className="h-6 w-6" />} text="Tài xế" />
          <NavItem to="/admin/settings" icon={<CogIcon className="h-6 w-6" />} text="Cài đặt" />
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700">
        <Link to="/admin/login" className={commonLinkClasses}>
          <LogoutIcon className="h-6 w-6" />
          <span className="ml-3">Đăng xuất</span>
        </Link>
      </div>
    </div>
  );
};

export default AdminNavbar;