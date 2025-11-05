import React from 'react';
import { Link } from 'react-router-dom';
import { UserIcon, SearchIcon, ShoppingCartIcon, HeartIcon } from './Icons';

const Navbar: React.FC = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-gray-100 py-1 text-xs text-gray-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between">
          <span>Chào mừng bạn đến với GreenMart!</span>
          <span>Hotline: 1900 6789</span>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/user/home" className="flex-shrink-0 text-3xl font-bold text-primary">
              Green<span className="text-gray-800">Mart</span>
            </Link>
          </div>
          <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-center">
            <div className="max-w-lg w-full lg:max-w-xs">
              <label htmlFor="search" className="sr-only">Search</label>
              <div className="relative text-gray-400 focus-within:text-gray-600">
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                  <SearchIcon className="h-5 w-5" />
                </div>
                <input
                  id="search"
                  className="block w-full bg-white py-2 pl-10 pr-3 border border-gray-300 rounded-md leading-5 text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="Tìm kiếm sản phẩm..."
                  type="search"
                  name="search"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex items-center space-x-4">
              <a href="#" className="p-1 rounded-full text-gray-500 hover:text-primary-dark">
                <HeartIcon className="h-6 w-6" />
                <span className="sr-only">Yêu thích</span>
              </a>
               <a href="#" className="relative p-1 rounded-full text-gray-500 hover:text-primary-dark">
                <ShoppingCartIcon className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
                <span className="sr-only">Giỏ hàng</span>
              </a>
              <Link to="/user/profile" className="p-1 rounded-full text-gray-500 hover:text-primary-dark" id="user-menu-button" aria-expanded="false" aria-haspopup="true">
                  <UserIcon className="h-6 w-6" />
                  <span className="sr-only">Tài khoản</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Secondary navigation */}
      <nav className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-12">
                 <div className="flex space-x-8">
                    <Link to="/user/home" className="border-b-2 border-primary text-sm font-semibold text-primary">Trang chủ</Link>
                    <Link to="#" className="border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">Giới thiệu</Link>
                    <Link to="#" className="border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">Sản phẩm</Link>
                    <Link to="#" className="border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">Tin tức</Link>
                    <Link to="#" className="border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">Liên hệ</Link>
                 </div>
                 <button className="bg-accent hover:bg-accent-dark text-white font-bold py-2 px-4 rounded-md">
                    Mua hàng nhanh
                 </button>
            </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
