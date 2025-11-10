import React from 'react';
import { Link } from 'react-router-dom';
import { UserIcon, SearchIcon, HeartIcon, ShoppingCartIcon, BellIcon, DocumentTextIcon, MenuIcon, LocationMarkerIcon } from './Icons';
import { useCart } from '../contexts/CartContext';

type NavbarProps = {
  onCartClick: () => void;
};

const Navbar: React.FC<NavbarProps> = ({ onCartClick }) => {
  const { items } = useCart();
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

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
            <div className="w-full max-w-3xl">
              <div className="flex items-center w-full bg-gray-100 rounded-full border border-gray-200 focus-within:ring-2 focus-within:ring-orange-400 focus-within:border-orange-400 focus-within:bg-white transition-all duration-300">
                {/* Location Part */}
                <div className="flex items-center pl-4 pr-2 py-1 flex-shrink-0 cursor-pointer group">
                  <LocationMarkerIcon className="h-5 w-5 text-gray-500 mr-2 group-hover:text-orange-500 transition-colors" />
                  <div className="hidden sm:block">
                    <span className="text-xs text-gray-500">Giao đến</span>
                    <p className="text-sm font-semibold text-gray-800 line-clamp-1 group-hover:text-orange-500 transition-colors">Chọn địa chỉ...</p>
                  </div>
                </div>

                {/* Separator */}
                <div className="h-8 border-l border-gray-300 mx-2"></div>

                {/* Search Input Part */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="search"
                    className="block w-full bg-transparent py-3 pl-10 pr-4 border-none rounded-r-full leading-5 text-gray-900 placeholder-gray-500 focus:outline-none"
                    placeholder="Bạn thèm ăn gì hôm nay?"
                    type="search"
                    name="search"
                  />
                </div>
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
             <button onClick={onCartClick} className="relative p-2 rounded-full text-gray-500 hover:text-orange-500 hover:bg-orange-50 focus:outline-none focus:bg-orange-100 transition" aria-label="Giỏ hàng">
              <ShoppingCartIcon className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center ring-2 ring-white">
                  {cartItemCount}
                </span>
              )}
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