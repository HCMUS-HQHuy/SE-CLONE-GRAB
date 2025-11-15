import React, { useState, useEffect } from 'react';
// FIX: Import LockIcon and alias it as LockClosedIcon to resolve missing export error.
import { XIcon, PencilIcon, LockIcon as LockClosedIcon, CheckCircleIcon, ClockIcon, TicketIcon, ShieldExclamationIcon } from './Icons';

// Types
export type RestaurantStatus = 'pending' | 'approved' | 'suspended';

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  isAvailable: boolean;
};

export type RestaurantOrder = {
  id: string;
  customerName: string;
  total: number;
  status: string;
  date: string;
};

export type SupportTicket = {
  id: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved';
  lastUpdate: string;
};

export type SecurityLog = {
  ip: string;
  device: string;
  timestamp: string;
  action: string;
};

export type FullRestaurant = {
    id: string;
    name: string;
    ownerName: string;
    ownerEmail: string;
    phone: string;
    address: string;
    cuisine: string;
    status: RestaurantStatus;
    createdAt: string;
    bannerUrl: string;
    logoUrl: string;
    menu: MenuItem[];
    orders: RestaurantOrder[];
    tickets: SupportTicket[];
    security: {
        alerts: string[];
        logs: SecurityLog[];
    };
};

// Modal Props
type RestaurantDetailModalProps = {
    isOpen: boolean;
    onClose: () => void;
    restaurant: FullRestaurant;
    onUpdate: (updatedRestaurant: FullRestaurant) => void;
};

type ActiveTab = 'info' | 'menu' | 'orders' | 'support' | 'security';

// Main Component
const RestaurantDetailModal: React.FC<RestaurantDetailModalProps> = ({ isOpen, onClose, restaurant, onUpdate }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('info');
    const [editedRestaurant, setEditedRestaurant] = useState<FullRestaurant>(restaurant);
    const [isEditingInfo, setIsEditingInfo] = useState(false);

    useEffect(() => {
        setEditedRestaurant(restaurant);
    }, [restaurant]);

    if (!isOpen) return null;

    const handleSaveInfo = () => {
        onUpdate(editedRestaurant);
        setIsEditingInfo(false);
    };

    const InfoTab = () => (
        <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Tên nhà hàng</label><input type="text" value={editedRestaurant.name} onChange={e => setEditedRestaurant({...editedRestaurant, name: e.target.value})} readOnly={!isEditingInfo} className="input-field" /></div>
                <div><label className="label">Loại hình</label><input type="text" value={editedRestaurant.cuisine} onChange={e => setEditedRestaurant({...editedRestaurant, cuisine: e.target.value})} readOnly={!isEditingInfo} className="input-field" /></div>
            </div>
            <div><label className="label">Địa chỉ</label><input type="text" value={editedRestaurant.address} onChange={e => setEditedRestaurant({...editedRestaurant, address: e.target.value})} readOnly={!isEditingInfo} className="input-field" /></div>
            <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Chủ sở hữu</label><input type="text" value={editedRestaurant.ownerName} onChange={e => setEditedRestaurant({...editedRestaurant, ownerName: e.target.value})} readOnly={!isEditingInfo} className="input-field" /></div>
                <div><label className="label">Email</label><input type="email" value={editedRestaurant.ownerEmail} onChange={e => setEditedRestaurant({...editedRestaurant, ownerEmail: e.target.value})} readOnly={!isEditingInfo} className="input-field" /></div>
            </div>
             {isEditingInfo && <button onClick={handleSaveInfo} className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md">Lưu thông tin</button>}
        </div>
    );
    
    const MenuTab = () => (
        <div className="space-y-4">
            {editedRestaurant.menu.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center">
                        <img src={item.image} alt={item.name} className="h-12 w-12 rounded object-cover mr-3"/>
                        <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-gray-500">{new Intl.NumberFormat('vi-VN').format(item.price)}đ</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {item.isAvailable ? 'Còn hàng' : 'Hết hàng'}
                        </span>
                        <button className="text-gray-400 hover:text-blue-600"><PencilIcon className="h-5 w-5"/></button>
                    </div>
                </div>
            ))}
        </div>
    );

    const OrdersTab = () => (
        <div>
            {editedRestaurant.orders.map(order => (
                <div key={order.id} className="p-2 border-b flex justify-between items-center">
                    <div>
                        <p className="font-semibold">{order.id} - {order.customerName}</p>
                        <p className="text-sm text-gray-500">{new Date(order.date).toLocaleString('vi-VN')}</p>
                    </div>
                    <div>
                        <p className="font-bold">{new Intl.NumberFormat('vi-VN').format(order.total)}đ</p>
                        <p className="text-sm text-right">{order.status}</p>
                    </div>
                </div>
            ))}
        </div>
    );

    const SupportTab = () => (
         <div>
            {editedRestaurant.tickets.map(ticket => (
                <div key={ticket.id} className="p-2 border-b flex justify-between items-center">
                    <div>
                        <p className="font-semibold">{ticket.id} - <span className="font-normal">{ticket.subject}</span></p>
                        <p className="text-sm text-gray-500">Cập nhật: {ticket.lastUpdate}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ticket.status === 'open' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{ticket.status}</span>
                </div>
            ))}
        </div>
    );

    const SecurityTab = () => (
         <div className="space-y-4">
            <div>
                <h4 className="font-semibold text-red-600 mb-2">Cảnh báo gian lận</h4>
                {editedRestaurant.security.alerts.length > 0 ? (
                    <ul className="list-disc list-inside text-sm text-red-700 bg-red-50 p-3 rounded-md">
                        {editedRestaurant.security.alerts.map((alert, i) => <li key={i}>{alert}</li>)}
                    </ul>
                ) : <p className="text-sm text-gray-500">Không có cảnh báo nào.</p>}
            </div>
             <div>
                <h4 className="font-semibold text-gray-800 mb-2">Nhật ký truy cập gần đây</h4>
                 <ul className="text-sm text-gray-600">
                    {editedRestaurant.security.logs.map((log, i) => <li key={i} className="p-1">{log.timestamp} - {log.action} từ {log.ip} ({log.device})</li>)}
                </ul>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><XIcon className="h-6 w-6" /></button>
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">{restaurant.name}</h2>
                    <p className="text-gray-500">{restaurant.address}</p>
                </div>
                <div className="p-6 flex-grow overflow-y-auto">
                    <div className="flex space-x-2 border-b mb-6">
                        <button onClick={() => setActiveTab('info')} className={`tab-btn ${activeTab==='info' && 'active'}`}>Thông tin chung</button>
                        <button onClick={() => setActiveTab('menu')} className={`tab-btn ${activeTab==='menu' && 'active'}`}>Thực đơn</button>
                        <button onClick={() => setActiveTab('orders')} className={`tab-btn ${activeTab==='orders' && 'active'}`}>Đơn hàng</button>
                        <button onClick={() => setActiveTab('support')} className={`tab-btn ${activeTab==='support' && 'active'}`}><TicketIcon className="h-4 w-4 mr-2"/>Hỗ trợ</button>
                        <button onClick={() => setActiveTab('security')} className={`tab-btn ${activeTab==='security' && 'active'}`}><ShieldExclamationIcon className="h-4 w-4 mr-2"/>Bảo mật</button>
                    </div>
                    {activeTab === 'info' && <InfoTab />}
                    {activeTab === 'menu' && <MenuTab />}
                    {activeTab === 'orders' && <OrdersTab />}
                    {activeTab === 'support' && <SupportTab />}
                    {activeTab === 'security' && <SecurityTab />}
                </div>
                <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3">
                    {activeTab === 'info' && !isEditingInfo && <button onClick={() => setIsEditingInfo(true)} className="btn-secondary"><PencilIcon className="h-4 w-4 mr-2"/>Chỉnh sửa</button>}
                    <button onClick={onClose} className="btn-primary">Đóng</button>
                </div>
            </div>
            <style>{`
                .label { display: block; font-size: 0.875rem; font-weight: 500; color: #6B7281; }
                .input-field { display: block; width: 100%; margin-top: 0.25rem; padding: 0.5rem 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.375rem; }
                .input-field[readOnly] { background-color: #F9FAFB; cursor: not-allowed; }
                .tab-btn { padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; border-bottom: 2px solid transparent; color: #4B5563; display:inline-flex; align-items:center; }
                .tab-btn:hover { background-color: #F3F4F6; }
                .tab-btn.active { border-color: #F97316; color: #F97316; }
                .btn-primary { padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; background-color: #4B5563; color: white; border-radius: 0.375rem; }
                .btn-secondary { display:inline-flex; align-items:center; padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; background-color: white; color: #374151; border: 1px solid #D1D5DB; border-radius: 0.375rem; }
            `}</style>
        </div>
    );
};

export default RestaurantDetailModal;