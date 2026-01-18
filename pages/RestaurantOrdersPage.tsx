import React, { useState, useMemo, useEffect } from 'react';
import { ClockIcon, CheckCircleIcon, XCircleIcon, TruckIcon, ChevronLeftIcon, ChevronRightIcon, ClipboardListIcon } from '../components/Icons';
import OrderDetailModal from '../components/OrderDetailModal';
import { orderApiService, OrderResponseData } from '../services/orderApi';
import { restaurantApiService } from '../services/restaurantApi';
import { apiService } from '../services/api';

// Map trạng thái API sang nhãn hiển thị Tiếng Việt
const STATUS_MAP: Record<string, string> = {
    'pending_restaurant': 'Chờ xác nhận',
    'restaurant_accepted': 'Đã chấp nhận',
    'restaurant_rejected': 'Đã từ chối',
    'preparing': 'Đang chế biến',
    'ready': 'Sẵn sàng giao',
    'finding_driver': 'Đang tìm tài xế',
    'driver_accepted': 'Tài xế đã nhận',
    'delivering': 'Đang giao hàng',
    'delivered': 'Đã hoàn thành',
    'cancelled': 'Đã hủy',
    'pending': 'Chờ xử lý',
    'confirmed': 'Đã xác nhận'
};

// ADDED: Exported Order type for use in other components like OrderDetailModal
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

// ADDED: Mock orders for Dashboard page statistics (fixes DashboardPage import error)
export const mockOrders = [
    { id: '1', status: 'Hoàn thành' },
    { id: '2', status: 'Hoàn thành' },
    { id: '3', status: 'Mới' },
    { id: '4', status: 'Đang chuẩn bị' },
    { id: '5', status: 'Sẵn sàng giao' },
    { id: '6', status: 'Đã hủy' }
];

export const getStatusStyles = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'pending_restaurant') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (s === 'restaurant_accepted' || s === 'confirmed') return 'bg-green-100 text-green-800 border-green-200';
    if (s === 'restaurant_rejected' || s === 'cancelled') return 'bg-red-100 text-red-800 border-red-200';
    if (s === 'preparing') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (s === 'ready' || s === 'finding_driver') return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    if (s === 'delivered') return 'bg-gray-100 text-gray-800 border-gray-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
};

export const formatCurrency = (amount: string | number) => {
    const val = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val).replace(/\s/g, '');
};

export const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString('vi-VN');
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
                        onClick={(e) => handleActionClick(e, 'restaurant_accepted')} 
                        className="flex items-center text-xs font-bold text-white bg-green-500 hover:bg-green-600 px-3 py-2 rounded-lg transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isLoading ? '...' : <><CheckCircleIcon className="h-4 w-4 mr-1" /> Nhận đơn</>}
                    </button>
                    <button 
                        disabled={isLoading}
                        onClick={(e) => handleActionClick(e, 'restaurant_rejected')} 
                        className="flex items-center text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isLoading ? '...' : <><XCircleIcon className="h-4 w-4 mr-1" /> Từ chối</>}
                    </button>
                </div>
            );
        }
        
        if (s === 'restaurant_accepted') {
            return (
                <button 
                    disabled={isLoading}
                    onClick={(e) => handleActionClick(e, 'preparing')} 
                    className="flex items-center text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg transition-all active:scale-95 disabled:opacity-50"
                >
                    {isLoading ? '...' : <><ClipboardListIcon className="h-4 w-4 mr-1" /> Chế biến</>}
                </button>
            );
        }

        if (s === 'preparing') {
            return (
                <button 
                    disabled={isLoading}
                    onClick={(e) => handleActionClick(e, 'ready')} 
                    className="flex items-center text-xs font-bold text-white bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg transition-all active:scale-95 disabled:opacity-50"
                >
                    {isLoading ? '...' : <><TruckIcon className="h-4 w-4 mr-1" /> Sẵn sàng giao</>}
                </button>
            );
        }

        return null;
    }

    // Map UI format to Modal expectance
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
        <div onClick={() => onCardClick(mappedForModal)} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 cursor-pointer transition-all hover:shadow-md hover:border-orange-200 group">
            <div className="flex justify-between items-start mb-4">
                <div className="min-w-0 flex-1">
                    <h3 className="font-black text-orange-600 text-sm tracking-tight uppercase">#{order.id.substring(0, 8)}</h3>
                    <p className="font-bold text-gray-900 mt-1 truncate">{mappedForModal.customerName}</p>
                    <div className="flex items-center text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">
                        <ClockIcon className="h-3 w-3 mr-1" /> {formatDateTime(order.created_at)}
                    </div>
                </div>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase ${getStatusStyles(order.status)}`}>
                    {STATUS_MAP[order.status.toLowerCase()] || order.status}
                </span>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-3 mb-4">
                {order.items.length > 0 && (
                    <p className="text-sm text-gray-600 line-clamp-1">
                        <span className="font-black text-gray-900">{order.items[0].quantity}x</span> {order.items[0].product_name}
                        {order.items.length > 1 && <span className="text-gray-400 italic ml-1"> +{order.items.length - 1} món khác</span>}
                    </p>
                )}
            </div>

            <div className="flex justify-between items-center pt-2">
                <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Tổng cộng</p>
                    <p className="font-black text-lg text-gray-900">{formatCurrency(order.total_amount)}</p>
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
        { id: 'pending_restaurant', label: 'Chờ nhận' },
        { id: 'preparing', label: 'Đang nấu' },
        { id: 'ready', label: 'Chờ tài xế' },
        { id: 'delivering', label: 'Đang giao' }
    ];

    useEffect(() => {
        const init = async () => {
            try {
                const me = await apiService.getMe('seller');
                const res = await restaurantApiService.getRestaurantByOwner(me.id);
                setRestaurantId(res.id.toString());
            } catch (err) {
                console.error("Lỗi khi xác định nhà hàng:", err);
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (!restaurantId) return;

        const fetchOrders = async (initial = false) => {
            if (initial) setIsLoading(true);
            try {
                const data = await orderApiService.getRestaurantOrders(restaurantId);
                // Sắp xếp đơn mới nhất lên đầu
                const sorted = data.items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setOrders(sorted);
            } catch (err) {
                console.error("Lỗi tải đơn hàng:", err);
            } finally {
                if (initial) setIsLoading(false);
            }
        };

        fetchOrders(true);
        const interval = setInterval(() => fetchOrders(false), 10000); // Polling mỗi 10 giây
        return () => clearInterval(interval);
    }, [restaurantId]);

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        setUpdatingOrderId(orderId);
        try {
            await orderApiService.updateOrder(orderId, { status: newStatus });
            // Cập nhật state local
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (err: any) {
            alert(err.message || "Không thể cập nhật trạng thái đơn hàng.");
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const filteredOrders = useMemo(() => {
        if (activeTab === 'All') return orders;
        return orders.filter(o => o.status.toLowerCase() === activeTab.toLowerCase());
    }, [orders, activeTab]);

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                <p className="text-gray-500 font-medium">Đang tải danh sách đơn hàng...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Quản lý Đơn hàng</h1>
                    <p className="text-gray-500 mt-1">Cập nhật và xử lý các yêu cầu từ khách hàng.</p>
                </div>
                <div className="flex bg-gray-100 p-1.5 rounded-2xl space-x-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                activeTab === tab.id 
                                ? 'bg-white text-orange-600 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>
            
            {filteredOrders.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
                    <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ClipboardListIcon className="h-8 w-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Không có đơn hàng nào</h3>
                    <p className="text-gray-500 mt-1">Các đơn hàng mới sẽ xuất hiện ở đây.</p>
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