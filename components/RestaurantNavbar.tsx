
import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { UserIcon, BellIcon, PackageIcon, StarIcon, ChartBarIcon, LogoutIcon } from './Icons';
import NotificationDropdown from './NotificationDropdown';
import type { Notification } from './NotificationDropdown';
import { apiService } from '../services/api';

const RestaurantNavbar: React.FC = () => {
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
            setIsUserMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    apiService.logout('seller');
    navigate('/restaurant/auth');
  };

  const activeLinkStyle = { color: '#F97316', borderBottom: '2px solid #F97316' };

  const mockRestaurantNotifications: Notification[] = [
    { id: 'res-1', icon: <PackageIcon className="h-5 w-5 text-green-500" />, title: 'Bạn có đơn hàng mới!', description: 'Đơn hàng #12345 trị giá 105.000đ từ Nguyễn Văn A.', time: 'Vừa xong', isRead: false, link: '/restaurant/orders' },
    { id: 'res-2', icon: <StarIcon className="h-5 w-5 text-yellow-500" />, title: 'Đánh giá mới', description: 'Trần Thị B đã để lại đánh giá 5 sao cho quán của bạn.', time: '15 phút trước', isRead: false },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/restaurant/store" className="flex-shrink-0 text-xl font-bold text-gray-800">
              Restaurant <span className="text-orange-500">Management</span>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <NavLink to="/restaurant/dashboard" className="text-gray-500 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Tổng quan</NavLink>
              <NavLink to="/restaurant/store" className="text-gray-500 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Cửa hàng</NavLink>
              <NavLink to="/restaurant/orders" className="text-gray-500 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Đơn hàng</NavLink>
              <NavLink to="/restaurant/promotions" className="text-gray-500 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Ưu đãi</NavLink>
            </nav>
          </div>

          <div className="flex items-center">
             <div className="relative">
                <button onClick={() => setIsNotificationOpen(prev => !prev)} className="relative p-2 rounded-full text-gray-500 hover:text-orange-500 hover:bg-orange-50 focus:outline-none focus:bg-orange-100 transition">
                    <BellIcon className="h-6 w-6" />
                    {mockRestaurantNotifications.some(n => !n.isRead) && <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>}
                </button>
                <NotificationDropdown isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} notifications={mockRestaurantNotifications} />
             </div>
            <div className="ml-3 relative" ref={userMenuRef}>
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="bg-gray-100 rounded-full flex items-center justify-center h-9 w-9 text-sm focus:outline-none ring-2 ring-offset-2 hover:ring-orange-500 transition"
              >
                <UserIcon className="h-5 w-5 text-gray-500" />
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-30">
                  <Link to="/restaurant/store" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Thông tin quán</Link>
                  <hr className="my-1"/>
                  <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    <LogoutIcon className="h-4 w-4 mr-2" /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default RestaurantNavbar;
