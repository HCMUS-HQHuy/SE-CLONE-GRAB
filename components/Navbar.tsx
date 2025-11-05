import React from 'react';
import { Link } from 'react-router-dom';
import { UserIcon } from './Icons';

const Navbar: React.FC = () => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/user/home" className="flex-shrink-0 text-2xl font-bold text-orange-500">
              Food<span className="text-gray-800">Delivery</span>
            </Link>
            <nav className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link to="/user/home" className="text-gray-600 hover:bg-orange-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Trang chủ</Link>
                <Link to="#" className="text-gray-600 hover:bg-orange-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Đơn hàng</Link>
                <Link to="#" className="text-gray-600 hover:bg-orange-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Yêu thích</Link>
              </div>
            </nav>
          </div>
          <div className="flex items-center">
            {/* User menu can be added here */}
            <div className="ml-4 flex items-center md:ml-6">
                <button className="p-1 rounded-full text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                    <span className="sr-only">View notifications</span>
                    {/* Heroicon name: outline/bell */}
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                </button>
                {/* Profile dropdown */}
                <div className="ml-3 relative">
                    <Link to="/user/profile" className="bg-gray-100 rounded-full flex items-center justify-center h-8 w-8 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500" id="user-menu-button" aria-expanded="false" aria-haspopup="true">
                        <span className="sr-only">Open user menu</span>
                        <UserIcon className="h-6 w-6 text-gray-500" />
                    </Link>
                </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
