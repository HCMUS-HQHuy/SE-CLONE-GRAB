import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { UserIcon, BellIcon, PackageIcon, XCircleIcon, ChartBarIcon } from './Icons';
import NotificationDropdown from './NotificationDropdown';
import type { Notification } from './NotificationDropdown';

const ShipperNavbar: React.FC = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const activeLinkStyle = {
    color: '#F97316',
    borderBottom: '2px solid #F97316'
  };

  const mockShipperNotifications: Notification[] = [
    {
      id: 'shipper-1',
      icon: <PackageIcon className="h-5 w-5 text-blue-500" />,
      title: 'Yêu cầu giao hàng mới',
      description: 'Đơn hàng #12345 từ Quán Ăn Gỗ. Nhận ngay!',
      time: '1 phút trước',
      isRead: false,
      link: '/shipper/orders',
    },
    {
      id: 'shipper-2',
      icon: <XCircleIcon className="h-5 w-5 text-red-500" />,
      title: 'Đơn hàng đã bị hủy',
      description: 'Khách hàng đã hủy đơn #12340. Bạn sẽ không bị ảnh hưởng.',
      time: '10 phút trước',
      isRead: false,
    },
    {
      id: 'shipper-3',
      icon: <ChartBarIcon className="h-5 w-5 text-green-500" />,
      title: 'Tổng kết thu nhập tuần',
      description: 'Thu nhập tuần này của bạn là 2.500.000đ. Xem chi tiết.',
      time: 'Hôm qua',
      isRead: true,
    },
  ];

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
                to="/shipper/history" 
                className="text-gray-500 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition"
                style={({ isActive }) => isActive ? activeLinkStyle : undefined}
              >
                Lịch sử
              </NavLink>
               <NavLink 
                to="/shipper/notifications" 
                className="text-gray-500 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition"
                style={({ isActive }) => isActive ? activeLinkStyle : undefined}
              >
                Thông báo
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
            <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen(prev => !prev)}
                  className="relative p-2 rounded-full text-gray-500 hover:text-orange-500 hover:bg-orange-50 focus:outline-none focus:bg-orange-100 transition" aria-label="Thông báo">
                    <BellIcon className="h-6 w-6" />
                    {mockShipperNotifications.some(n => !n.isRead) && (
                      <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                    )}
                </button>
                <NotificationDropdown
                    isOpen={isNotificationOpen}
                    onClose={() => setIsNotificationOpen(false)}
                    notifications={mockShipperNotifications}
                />
             </div>
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