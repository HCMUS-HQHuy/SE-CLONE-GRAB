import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export type Notification = {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  link?: string;
};

type NotificationDropdownProps = {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
};

const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => (
  <Link to={notification.link || '#'} className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors">
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4">
        {notification.icon}
    </div>
    <div className="flex-grow">
        <p className={`font-semibold text-sm text-gray-800 ${!notification.isRead ? 'font-bold' : ''}`}>{notification.title}</p>
        <p className="text-sm text-gray-600">{notification.description}</p>
        <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
    </div>
    {!notification.isRead && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full ml-3 mt-1 flex-shrink-0"></div>}
  </Link>
);


const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose, notifications }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const newNotifications = notifications.filter(n => !n.isRead);
  const readNotifications = notifications.filter(n => n.isRead);

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-20 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-heading"
    >
      <div className="flex justify-between items-center p-4 border-b">
        <h3 id="notification-heading" className="text-lg font-bold text-gray-800">Thông báo</h3>
        <button className="text-sm font-medium text-orange-600 hover:underline">Đánh dấu đã đọc</button>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {newNotifications.length > 0 && (
          <div className="p-2">
            <h4 className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">Mới</h4>
            {newNotifications.map(n => <NotificationItem key={n.id} notification={n} />)}
          </div>
        )}
        
        {readNotifications.length > 0 && (
          <div className="p-2">
             <h4 className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">Trước đó</h4>
             {readNotifications.map(n => <NotificationItem key={n.id} notification={n} />)}
          </div>
        )}

         {notifications.length === 0 && (
            <div className="text-center p-8">
                <p className="text-sm text-gray-500">Bạn không có thông báo nào.</p>
            </div>
         )}
      </div>

      <div className="p-2 bg-gray-50 border-t text-center">
        <Link to="#" className="text-sm font-semibold text-orange-600 hover:underline">Xem tất cả</Link>
      </div>
    </div>
  );
};

export default NotificationDropdown;