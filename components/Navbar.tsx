import React from 'react';
import { Link } from 'react-router-dom';
import { UserIcon, SearchIcon, HeartIcon, ShoppingCartIcon, BellIcon, DocumentTextIcon, MenuIcon } from './Icons';

const Navbar: React.FC = () => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left section: Logo */}
          <div className="flex items-center">
            <Link to="/user/home" className="flex-shrink-0 text-2xl font-bold text-orange-500">
              Food<span className="text-gray-800">Delivery</span>
            </Link>
          </div>

          {/* Center section: Search Bar */}
          <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-center">
            <div className="w-full max-w-lg lg:max-w-xl">
              <label htmlFor="search" className="sr-only">Tìm kiếm</label>
              <div className="relative text-gray-400 focus-within:text-gray-600">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5" />
                </div>
                <input
                  id="search"
                  className="block w-full bg-gray-100 py-3 pl-10 pr-3 border border-transparent rounded-full leading-5 text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-orange-300 focus:ring-orange-300 focus:ring-1 transition"
                  placeholder="Tìm món ăn, nhà hàng..."
                  type="search"
                  name="search"
                />
              </div>
            </div>
          </div>

          {/* Right section: Actions */}
          <div className="hidden md:flex items-center space-x-2">
            <Link to="/user/orders" className="p-2 rounded-full text-gray-500 hover:text-orange-500 hover:bg-orange-50 focus:outline-none focus:bg-orange-100 transition" aria-label="Đơn hàng">
              <DocumentTextIcon className="h-6 w-6" />
            </Link>
            <Link to="/user/favorites" className="p-2 rounded-full text-gray-500 hover:text-orange-500 hover:bg-orange-50 focus:outline-none focus:bg-orange-100 transition" aria-label="Yêu thích">
              <HeartIcon className="h-6 w-6" />
            </Link>
             <button className="p-2 rounded-full text-gray-500 hover:text-orange-500 hover:bg-orange-50 focus:outline-none focus:bg-orange-100 transition" aria-label="Giỏ hàng">
              <ShoppingCartIcon className="h-6 w-6" />
            </button>
            <button className="p-2 rounded-full text-gray-500 hover:text-orange-500 hover:bg-orange-50 focus:outline-none focus:bg-orange-100 transition" aria-label="Thông báo">
              <BellIcon className="h-6 w-6" />
            </button>
            
            {/* Profile dropdown */}
            <div className="ml-3 relative">
              <Link to="/user/profile" className="bg-gray-100 rounded-full flex items-center justify-center h-10 w-10 text-sm focus:outline-none ring-2 ring-offset-2 hover:ring-orange-500 transition" id="user-menu-button" aria-expanded="false" aria-haspopup="true" aria-label="Mở menu người dùng">
                <UserIcon className="h-6 w-6 text-gray-500" />
              </Link>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
             <button className="p-2 rounded-full text-gray-500 hover:text-orange-500 hover:bg-orange-50 focus:outline-none focus:bg-orange-100 transition" aria-label="Mở menu">
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
