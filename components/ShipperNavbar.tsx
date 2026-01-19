
import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { UserIcon, BellIcon, PackageIcon, XCircleIcon, ChartBarIcon, LogoutIcon } from './Icons';
import NotificationDropdown from './NotificationDropdown';
import type { Notification } from './NotificationDropdown';
import { apiService } from '../services/api';

const ShipperNavbar: React.FC = () => {
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // FIX: Notification type uses iconType instead of icon. Added state to handle marking as read.
  const mockShipperNotifications: Notification[] = [
    { id: 'shipper-1', iconType: 'order', title: 'Yêu cầu giao hàng mới', description: 'Đơn hàng #12345 từ Quán Ăn Gỗ. Nhận ngay!', time: '1 phút trước', isRead: false, link: '/shipper/orders' },
    { id: 'shipper-2', iconType: 'error', title: 'Đơn hàng đã bị hủy', description: 'Khách hàng đã hủy đơn #12340. Bạn sẽ không bị ảnh hưởng.', time: '10 phút trước', isRead: false },
  ];

  const [notifications, setNotifications] = useState<Notification[]>(mockShipperNotifications);

  // FIX: Implemented handleMarkRead to satisfy NotificationDropdown requirement
  const handleMarkRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setIsNotificationOpen(false);
  };

  // FIX: Implemented handleMarkAllRead to satisfy NotificationDropdown requirement
  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

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
    apiService.logout('shipper');
    navigate('/shipper/auth');
  };

  const activeLinkStyle = { color: '#F97316', borderBottom: '2px solid #F97316' };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/shipper/profile" className="flex-shrink-0 text-xl font-bold text-gray-800">
              Shipper <span className="text-orange-500">Portal</span>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <NavLink to="/shipper/orders" className="text-gray-500 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Đơn hàng</NavLink>
              <NavLink to="/shipper/history" className="text-gray-500 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Lịch sử</NavLink>
               <NavLink to="/shipper/notifications" className="text-gray-500 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Thông báo</NavLink>
              <NavLink to="/shipper/profile" className="text-gray-500 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Hồ sơ</NavLink>
            </nav>
          </div>
          <div className="flex items-center">
            <div className="relative">
                <button onClick={() => setIsNotificationOpen(prev => !prev)} className="relative p-2 rounded-full text-gray-500 hover:text-orange-500 hover:bg-orange-50 focus:outline-none focus:bg-orange-100 transition">
                    <BellIcon className="h-6 w-6" />
                    {/* FIX: Check unread state from local state notifications */}
                    {notifications.some(n => !n.isRead) && <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>}
                </button>
                {/* FIX: Passed notifications state and onMarkRead/onMarkAllRead handlers */}
                <NotificationDropdown 
                  isOpen={isNotificationOpen} 
                  onClose={() => setIsNotificationOpen(false)} 
                  notifications={notifications} 
                  onMarkRead={handleMarkRead}
                  onMarkAllRead={handleMarkAllRead}
                />
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
                  <Link to="/shipper/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Hồ sơ tài xế</Link>
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

export default ShipperNavbar;
