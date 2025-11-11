import React, { useState, useMemo } from 'react';
import { PackageIcon, XCircleIcon, ChartBarIcon, BellIcon, MailOpenIcon, TrashIcon } from '../components/Icons';

type NotificationType = 'new_order' | 'cancellation' | 'system';

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
};

const mockShipperNotifications: Notification[] = [
    { id: 'sn1', type: 'new_order', title: 'Yêu cầu giao hàng mới', description: 'Đơn hàng #12345 từ Quán Ăn Gỗ đang chờ bạn nhận.', time: '10 phút trước', isRead: false },
    { id: 'sn2', type: 'cancellation', title: 'Đơn hàng #12340 đã bị hủy', description: 'Khách hàng đã hủy đơn hàng. Bạn sẽ không bị ảnh hưởng.', time: '30 phút trước', isRead: false },
    { id: 'sn3', type: 'system', title: 'Tổng kết thu nhập tuần', description: 'Thu nhập tuần trước của bạn là 2.500.000đ. Xem chi tiết trong mục thu nhập.', time: 'Hôm qua', isRead: true },
    { id: 'sn4', type: 'new_order', title: 'Yêu cầu giao hàng mới', description: 'Đơn hàng #12339 từ Bếp Việt đang chờ bạn nhận.', time: '2 giờ trước', isRead: true },
    { id: 'sn5', type: 'system', title: 'Cập nhật ứng dụng', description: 'Phiên bản mới của ứng dụng đã sẵn sàng. Vui lòng cập nhật để có trải nghiệm tốt nhất.', time: '2 ngày trước', isRead: true },
];

const getIconForType = (type: NotificationType) => {
    switch (type) {
        case 'new_order': return <PackageIcon className="h-6 w-6 text-blue-500" />;
        case 'cancellation': return <XCircleIcon className="h-6 w-6 text-red-500" />;
        case 'system': return <ChartBarIcon className="h-6 w-6 text-green-500" />;
        default: return <BellIcon className="h-6 w-6 text-gray-500" />;
    }
};

const NotificationItem: React.FC<{ notification: Notification; onToggleRead: () => void; onDelete: () => void; }> = ({ notification, onToggleRead, onDelete }) => (
    <div className={`flex items-start p-4 border-b transition-colors ${!notification.isRead ? 'bg-orange-50' : 'bg-white hover:bg-gray-50'}`}>
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4">
            {getIconForType(notification.type)}
        </div>
        <div className="flex-grow">
            <p className={`font-semibold text-sm ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>{notification.title}</p>
            <p className="text-sm text-gray-600">{notification.description}</p>
            <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
            <button onClick={onToggleRead} className="p-2 text-gray-400 hover:text-blue-600" title={notification.isRead ? "Đánh dấu chưa đọc" : "Đánh dấu đã đọc"}>
                <MailOpenIcon className="h-5 w-5"/>
            </button>
            <button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-600" title="Xóa thông báo">
                <TrashIcon className="h-5 w-5"/>
            </button>
        </div>
    </div>
);

const ShipperNotificationsPage: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>(mockShipperNotifications);
    const [activeTab, setActiveTab] = useState<'Tất cả' | 'Chưa đọc'>('Tất cả');

    const filteredNotifications = useMemo(() => {
        if (activeTab === 'Chưa đọc') {
            return notifications.filter(n => !n.isRead);
        }
        return notifications;
    }, [notifications, activeTab]);

    const handleToggleRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n));
    };

    const handleDelete = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };
    
    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({...n, isRead: true})));
    };

    const handleDeleteAll = () => {
        if(window.confirm('Bạn có chắc muốn xóa tất cả thông báo không?')) {
            setNotifications([]);
        }
    };


    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Thông báo</h1>
            
            <div className="bg-white rounded-lg shadow-md border">
                <div className="p-4 flex justify-between items-center border-b">
                    {/* Tabs */}
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-md text-sm">
                        {(['Tất cả', 'Chưa đọc'] as const).map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-md ${activeTab === tab ? 'bg-white shadow text-orange-600 font-semibold' : 'text-gray-600 hover:bg-gray-200'}`}>
                                {tab}
                            </button>
                        ))}
                    </div>
                    {/* Actions */}
                    <div className="flex items-center space-x-3">
                         <button onClick={handleMarkAllRead} className="text-sm font-medium text-blue-600 hover:underline">
                            Đánh dấu tất cả đã đọc
                        </button>
                         <button onClick={handleDeleteAll} className="text-sm font-medium text-red-600 hover:underline">
                            Xóa tất cả
                        </button>
                    </div>
                </div>

                {/* Notifications List */}
                <div>
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map(n => (
                            <NotificationItem 
                                key={n.id} 
                                notification={n}
                                onToggleRead={() => handleToggleRead(n.id)}
                                onDelete={() => handleDelete(n.id)}
                            />
                        ))
                    ) : (
                         <div className="text-center py-16 px-4">
                            <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-3"/>
                            <h3 className="text-lg font-semibold text-gray-700">Không có thông báo nào</h3>
                            <p className="text-gray-500 mt-1">Hiện tại không có thông báo nào trong mục này.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShipperNotificationsPage;