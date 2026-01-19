
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PackageIcon, CheckCircleIcon, XCircleIcon, ClockIcon, BellIcon, ClipboardListIcon, TruckIcon } from './Icons';

export type Notification = {
  id: string;
  iconType: 'order' | 'success' | 'error' | 'warning' | 'shipping' | 'preparing';
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
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
};

const getIcon = (type: Notification['iconType']) => {
    switch (type) {
        case 'order': return <ClipboardListIcon className="h-5 w-5 text-blue-500" />;
        case 'success': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
        case 'error': return <XCircleIcon className="h-5 w-5 text-red-500" />;
        case 'warning': return <ClockIcon className="h-5 w-5 text-amber-500" />;
        case 'shipping': return <TruckIcon className="h-5 w-5 text-indigo-500" />;
        case 'preparing': return <PackageIcon className="h-5 w-5 text-orange-500" />;
        default: return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
};

const NotificationItem: React.FC<{ notification: Notification, onMarkRead: (id: string) => void }> = ({ notification, onMarkRead }) => (
  <Link 
    to={notification.link || '#'} 
    onClick={() => onMarkRead(notification.id)}
    className={`flex items-start p-5 hover:bg-gray-50 transition-all border-b border-gray-50 last:border-0 ${!notification.isRead ? 'bg-orange-50/20' : 'bg-white'}`}
  >
    <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-white shadow-sm flex items-center justify-center mr-4 border border-gray-100 group-hover:scale-110 transition-transform">
        {getIcon(notification.iconType)}
    </div>
    <div className="flex-grow min-w-0">
        <p className={`text-sm text-gray-800 line-clamp-1 ${!notification.isRead ? 'font-black' : 'font-bold'}`}>{notification.title}</p>
        <p className="text-[11px] text-gray-500 line-clamp-2 mt-1 font-semibold leading-relaxed">{notification.description}</p>
        <p className="text-[9px] text-gray-400 mt-2 font-black uppercase tracking-[0.15em]">{notification.time}</p>
    </div>
    {!notification.isRead && (
        <div className="w-2.5 h-2.5 bg-orange-500 rounded-full ml-3 mt-2 flex-shrink-0 shadow-md shadow-orange-200 animate-pulse"></div>
    )}
  </Link>
);


const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose, notifications, onMarkRead, onMarkAllRead }) => {
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

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-4 w-80 sm:w-[420px] bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex justify-between items-end p-7 border-b border-gray-50 bg-gray-50/40">
        <div>
            <h3 className="text-xl font-black text-gray-800 tracking-tight">Thông báo</h3>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1.5">Cập nhật mới nhất</p>
        </div>
        {notifications.some(n => !n.isRead) && (
            <button 
                onClick={(e) => { e.stopPropagation(); onMarkAllRead(); }}
                className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:text-orange-700 transition-all bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100"
            >
                Đánh dấu tất cả
            </button>
        )}
      </div>
      
      <div className="max-h-[480px] overflow-y-auto custom-scrollbar">
         {notifications.length === 0 ? (
            <div className="text-center py-24 px-10">
                <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
                    <BellIcon className="h-7 w-7 text-gray-200"/>
                </div>
                <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest">Không có thông báo mới</p>
            </div>
         ) : (
            <div className="divide-y divide-gray-50">
                {notifications.map(n => <NotificationItem key={n.id} notification={n} onMarkRead={onMarkRead} />)}
            </div>
         )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #F3F4F6; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default NotificationDropdown;
