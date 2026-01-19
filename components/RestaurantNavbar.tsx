
import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { UserIcon, BellIcon, LogoutIcon } from './Icons';
import NotificationDropdown from './NotificationDropdown';
import type { Notification } from './NotificationDropdown';
import { apiService } from '../services/api';
import { orderApiService } from '../services/orderApi';
import { restaurantApiService } from '../services/restaurantApi';

const NOTI_KEY = 'seller_notifications_history';
const STATUS_KEY = 'known_seller_order_statuses';

const RestaurantNavbar: React.FC = () => {
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(NOTI_KEY);
    if (saved) setNotifications(JSON.parse(saved));

    const init = async () => {
      try {
        const me = await apiService.getMe('seller');
        const res = await restaurantApiService.getRestaurantByOwner(me.id);
        setRestaurantId(res.id.toString());
      } catch (err) { console.error(err); }
    };
    init();
  }, []);

  useEffect(() => {
    if (!restaurantId) return;

    const checkUpdates = async () => {
      try {
        const data = await orderApiService.getRestaurantOrders(restaurantId);
        const savedStatuses = JSON.parse(localStorage.getItem(STATUS_KEY) || '{}');
        const newStatusMap: Record<string, string> = { ...savedStatuses };
        const newNotis: Notification[] = [];

        data.items.forEach(order => {
          const prevStatus = savedStatuses[order.id];
          if (order.status !== prevStatus) {
            newStatusMap[order.id] = order.status;
            if (prevStatus !== undefined) {
              const isNew = order.status.toLowerCase() === 'pending_restaurant';
              newNotis.push({
                id: `${order.id}-${Date.now()}`,
                iconType: isNew ? 'order' : 'preparing',
                title: isNew ? 'Đơn hàng mới!' : 'Cập nhật trạng thái',
                description: isNew 
                  ? `Bạn vừa nhận được đơn hàng mới #${order.id.substring(0, 8)}` 
                  : `Đơn hàng #${order.id.substring(0, 8)} chuyển sang: ${order.status}`,
                time: 'Vừa xong',
                isRead: false,
                link: '/restaurant/orders'
              });
            }
          }
        });

        if (newNotis.length > 0) {
          setNotifications(prev => {
            const updated = [...newNotis, ...prev].slice(0, 50);
            localStorage.setItem(NOTI_KEY, JSON.stringify(updated));
            return updated;
          });
        }
        localStorage.setItem(STATUS_KEY, JSON.stringify(newStatusMap));
      } catch (err) { console.error(err); }
    };

    checkUpdates();
    const interval = setInterval(checkUpdates, 10000);
    return () => clearInterval(interval);
  }, [restaurantId]);

  const handleMarkRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, isRead: true } : n);
      localStorage.setItem(NOTI_KEY, JSON.stringify(updated));
      return updated;
    });
    setIsNotificationOpen(false);
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, isRead: true }));
      localStorage.setItem(NOTI_KEY, JSON.stringify(updated));
      return updated;
    });
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
    apiService.logout('seller');
    navigate('/restaurant/auth');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const activeLinkStyle = { color: '#F97316', borderBottom: '2px solid #F97316' };

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
                <button onClick={() => setIsNotificationOpen(prev => !prev)} className="relative p-2.5 rounded-full text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all">
                    <BellIcon className="h-6 w-6" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 block h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white animate-bounce">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
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
                className="bg-gray-100 rounded-2xl flex items-center justify-center h-10 w-10 text-sm focus:outline-none ring-2 ring-transparent hover:ring-orange-200 transition-all"
              >
                <UserIcon className="h-6 w-6 text-gray-500" />
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl py-2 ring-1 ring-black/5 z-30 border border-gray-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-50 mb-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tài khoản</p>
                  </div>
                  <Link to="/restaurant/store" className="block px-4 py-2.5 text-sm text-gray-700 font-semibold hover:bg-orange-50 hover:text-orange-600 transition-colors">Thông tin quán</Link>
                  <hr className="my-1 border-gray-50"/>
                  <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2.5 text-sm text-rose-600 font-bold hover:bg-rose-50 transition-colors">
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
