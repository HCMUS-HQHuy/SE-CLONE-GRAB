import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { UserIcon } from './Icons';

const ShipperNavbar: React.FC = () => {
  const activeLinkStyle = {
    color: '#F97316',
    borderBottom: '2px solid #F97316'
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/shipper/profile" className="flex-shrink-0 text-xl font-bold text-gray-800">
              Shipper <span className="text-orange-500">Portal</span>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <NavLink 
                to="/shipper/orders" 
                className="text-gray-500 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition"
                style={({ isActive }) => isActive ? activeLinkStyle : undefined}
              >
                Đơn hàng
              </NavLink>
              <NavLink 
                to="/shipper/profile" 
                className="text-gray-500 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition"
                style={({ isActive }) => isActive ? activeLinkStyle : undefined}
              >
                Hồ sơ
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center">
            <div className="ml-3 relative">
              <Link to="/shipper/profile" className="bg-gray-100 rounded-full flex items-center justify-center h-9 w-9 text-sm focus:outline-none ring-2 ring-offset-2 hover:ring-orange-500 transition" aria-label="Mở menu người dùng">
                <UserIcon className="h-5 w-5 text-gray-500" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ShipperNavbar;