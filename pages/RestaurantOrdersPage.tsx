
import React, { useState, useMemo, useEffect } from 'react';
import { ClockIcon, CheckCircleIcon, XCircleIcon, TruckIcon, ChevronLeftIcon, ChevronRightIcon, ClipboardListIcon, UserIcon, HomeIcon } from '../components/Icons';
import OrderDetailModal from '../components/OrderDetailModal';
import { orderApiService, OrderResponseData } from '../services/orderApi';
import { restaurantApiService } from '../services/restaurantApi';
import { apiService } from '../services/api';

const STATUS_MAP: Record<string, string> = {
    'pending_restaurant': 'Chờ xác nhận',
    'restaurant_accepted': 'Đã nhận đơn',
    'restaurant_rejected': 'Đã từ chối',
    'preparing': 'Đang nấu',
    'ready': 'Chờ tài xế',
    'finding_driver': 'Tìm tài xế',
    'driver_accepted': 'Tài xế đã nhận',
    'delivering': 'Đang giao',
    'delivered': 'Hoàn thành',
    'cancelled': 'Đã hủy',
    'pending': 'Chờ xử lý',
    'confirmed': 'Xác nhận'
};

export type Order = {
    id: string;
    customerName: string;
    address: string;
    total: number;
    status: string;
    createdAt: string;
    items: {
        name: string;
        quantity: number;
        price: number;
    }[];
};

export const mockOrders = [
    { id: '1', status: 'Hoàn thành' },
    { id: '2', status: 'Hoàn thành' },
    { id: '3', status: 'Mới' }
];

export const getStatusStyles = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'pending_restaurant' || s === 'pending') return 'bg-amber-50 text-amber-600 border-amber-100';
    if (s === 'restaurant_accepted' || s === 'confirmed' || s === 'delivered') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (s === 'restaurant_rejected' || s === 'cancelled') return 'bg-rose-50 text-rose-600 border-rose-100';
    if (s === 'preparing') return 'bg-sky-50 text-sky-600 border-sky-100';
    if (s === 'ready' || s === 'finding_driver' || s === 'driver_accepted') return 'bg-indigo-50 text-indigo-600 border-indigo-100';
    if (s === 'delivering') return 'bg-orange-50 text-orange-600 border-orange-100';
    return 'bg-gray-50 text-gray-500 border-gray-100';
};

export const formatCurrency = (amount: string | number) => {
    const val = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val).replace(/\s/g, '');
};

export const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ', ' + date.toLocaleDateString('vi-VN');
};

const OrderCard: React.FC<{ 
    order: OrderResponseData; 
    onUpdateStatus: (id: string, status: string) => void; 
    onCardClick: (order: any) => void; 
    isUpdating?: string | null;
}> = ({ order, onUpdateStatus, onCardClick, isUpdating }) => {
    
    const handleActionClick = (e: React.MouseEvent, newStatus: string) => {
        e.stopPropagation();
        onUpdateStatus(order.id, newStatus);
    };

    const ActionButtons = () => {
        const s = order.status.toLowerCase();
        const isLoading = isUpdating === order.id;

        if (s === 'pending_restaurant') {
            return (
                <div className="flex space-x-2">
                    <button 
                        disabled={isLoading}
                        onClick={(e) => handleActionClick(e, 'restaurant_rejected')} 
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100"
                    >
                        <XCircleIcon className="h-5 w-5" />
                    </button>
                    <button 
                        disabled={isLoading}
                        onClick={(e) => handleActionClick(e, 'restaurant_accepted')} 
                        className="flex items-center text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-xl shadow-lg shadow-orange-100 transition-all active:scale-95"
                    >
                        {isLoading ? '...' : 'Nhận đơn'}
                    </button>
                </div>
            );
        }
        
        if (s === 'restaurant_accepted') {
            return (
                <button 
                    disabled={isLoading}
                    onClick={(e) => handleActionClick(e, 'preparing')} 
                    className="flex items-center text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 px-5 py-2 rounded-xl shadow-lg shadow-sky-100 transition-all active:scale-95"
                >
                    {isLoading ? '...' : 'Nấu xong'}
                </button>
            );
        }

        if (s === 'preparing') {
            return (
                <button 
                    disabled={isLoading}
                    onClick={(e) => handleActionClick(e, 'ready')} 
                    className="flex items-center text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-600 px-5 py-2 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
                >
                    {isLoading ? '...' : 'Giao cho tài xế'}
                </button>
            );
        }

        return null;
    }

    const mappedForModal = {
        id: order.id,
        customerName: order.delivery_address.split('|')[0]?.trim() || 'Khách hàng',
        address: order.delivery_address.split('|')[2]?.trim() || order.delivery_address,
        total: parseFloat(order.total_amount),
        status: (STATUS_MAP[order.status.toLowerCase()] || order.status) as any,
        createdAt: order.created_at,
        items: order.items.map(i => ({
            name: i.product_name,
            quantity: i.quantity,
            price: i.unit_price
        }))
    };

    return (
        <div onClick={() => onCardClick(mappedForModal)} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50 cursor-pointer transition-all hover:shadow-md hover:border-orange-100 group">
            <div className="flex justify-between items-start mb-5">
                <div className="min-w-0">
                    <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">#{order.id.substring(0, 8)}</span>
                    <h3 className="font-semibold text-gray-800 mt-1 truncate text-base">{mappedForModal.customerName}</h3>
                </div>
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase tracking-tight ${getStatusStyles(order.status)}`}>
                    {STATUS_MAP[order.status.toLowerCase()] || order.status}
                </span>
            </div>
            
            <div className="space-y-2 mb-6">
                {order.items.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm text-gray-500">
                        <span className="truncate mr-4"><span className="font-semibold text-gray-700">{item.quantity}x</span> {item.product_name}</span>
                    </div>
                ))}
                {order.items.length > 2 && (
                    <p className="text-[11px] text-gray-400 font-medium italic">...và {order.items.length - 2} món khác</p>
                )}
            </div>

            <div className="flex justify-between items-end pt-4 border-t border-gray-50">
                <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Thanh toán</p>
                    <p className="font-bold text-gray-800 text-lg tracking-tight">{formatCurrency(order.total_amount)}</p>
                </div>
                <div onClick={e => e.stopPropagation()}>
                    <ActionButtons />
                </div>
            </div>
        </div>
    );
};

const RestaurantOrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<OrderResponseData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('All');
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [restaurantId, setRestaurantId] = useState<string | null>(null);
    
    const tabs = [
        { id: 'All', label: 'Tất cả' },
        { id: 'pending_restaurant', label: 'Đơn mới' },
        { id: 'preparing', label: 'Đang nấu' },
        { id: 'ready', label: 'Chờ giao' },
        { id: 'delivering', label: 'Đang giao' }
    ];

    useEffect(() => {
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
        const fetchOrders = async (initial = false) => {
            if (initial) setIsLoading(true);
            try {
                const data = await orderApiService.getRestaurantOrders(restaurantId);
                setOrders(data.items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
            } catch (err) { console.error(err); } finally { if (initial) setIsLoading(false); }
        };
        fetchOrders(true);
        const interval = setInterval(() => fetchOrders(false), 10000);
        return () => clearInterval(interval);
    }, [restaurantId]);

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        setUpdatingOrderId(orderId);
        try {
            await orderApiService.updateOrder(orderId, { status: newStatus });
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (err: any) { alert(err.message); } finally { setUpdatingOrderId(null); }
    };

    const filteredOrders = useMemo(() => {
        if (activeTab === 'All') return orders;
        return orders.filter(o => o.status.toLowerCase() === activeTab.toLowerCase());
    }, [orders, activeTab]);

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-4"></div>
                <p className="text-gray-400 font-medium text-sm">Đang đồng bộ đơn hàng...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-10">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-800 tracking-tight">Đơn hàng</h1>
                    <p className="text-gray-400 text-sm mt-1 font-medium">Quản lý quy trình phục vụ và giao nhận khách hàng.</p>
                </div>
                <div className="inline-flex p-1.5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
                                activeTab === tab.id 
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' 
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>
            
            {filteredOrders.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredOrders.map(order => (
                        <OrderCard 
                          key={order.id} 
                          order={order} 
                          onUpdateStatus={handleUpdateStatus}
                          onCardClick={setSelectedOrder} 
                          isUpdating={updatingOrderId}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-gray-100">
                    <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ClipboardListIcon className="h-8 w-8 text-gray-200" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700">Chưa có đơn hàng nào</h3>
                    <p className="text-gray-400 text-sm mt-1 font-medium">Đơn hàng mới sẽ tự động hiển thị tại đây.</p>
                </div>
            )}

            {selectedOrder && (
                <OrderDetailModal
                    isOpen={!!selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    order={selectedOrder}
                />
            )}
        </div>
    );
};

export default RestaurantOrdersPage;
