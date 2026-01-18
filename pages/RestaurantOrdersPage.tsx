
import React, { useState, useMemo, useEffect } from 'react';
import { ClockIcon, CheckCircleIcon, XCircleIcon, ClipboardListIcon, TagIcon } from '../components/Icons';
import OrderDetailModal from '../components/OrderDetailModal';
import { orderApiService, OrderResponseData } from '../services/orderApi';
import { apiService } from '../services/api';

// Map trạng thái API sang nhãn hiển thị Tiếng Việt
const STATUS_MAP: Record<string, string> = {
    'pending_restaurant': 'Chờ xác nhận',
    'restaurant_accepted': 'Đã chấp nhận',
    'restaurant_rejected': 'Đã từ chối',
    'preparing': 'Đang chuẩn bị',
    'ready': 'Sẵn sàng giao',
    'finding_driver': 'Đang tìm tài xế',
    'driver_accepted': 'Tài xế đã nhận',
    'delivering': 'Đang giao hàng',
    'delivered': 'Đã hoàn tất',
    'cancelled': 'Đã hủy',
    'pending': 'Chờ xử lý',
    'confirmed': 'Đã xác nhận'
};

export type Order = {
    id: string;
    customerName: string;
    address: string;
    total: number;
    status: string;
    createdAt: string;
    subtotal: number;
    deliveryFee: number;
    discount: number;
    items: {
        name: string;
        quantity: number;
        price: number;
    }[];
};

// FIX: Added mockOrders export for DashboardPage usage.
export const mockOrders: Order[] = [
    { id: 'ORD001', customerName: 'Nguyễn Văn A', address: '123 Lê Lợi, Q1', total: 150000, status: 'Hoàn thành', createdAt: '2024-07-31T10:00:00Z', subtotal: 135000, deliveryFee: 15000, discount: 0, items: [] },
    { id: 'ORD002', customerName: 'Trần Thị B', address: '456 Nguyễn Huệ, Q1', total: 200000, status: 'Đang chuẩn bị', createdAt: '2024-07-31T11:30:00Z', subtotal: 185000, deliveryFee: 15000, discount: 0, items: [] },
    { id: 'ORD003', customerName: 'Lê Văn C', address: '789 CMT8, Q3', total: 120000, status: 'Mới', createdAt: '2024-07-31T12:00:00Z', subtotal: 105000, deliveryFee: 15000, discount: 0, items: [] },
    { id: 'ORD004', customerName: 'Phạm Văn D', address: '101 Cách Mạng Tháng 8, Q10', total: 300000, status: 'Sẵn sàng giao', createdAt: '2024-07-31T13:00:00Z', subtotal: 285000, deliveryFee: 15000, discount: 0, items: [] },
    { id: 'ORD005', customerName: 'Võ Thị E', address: '202 Võ Văn Kiệt, Q1', total: 0, status: 'Đã hủy', createdAt: '2024-07-31T14:00:00Z', subtotal: 100000, deliveryFee: 15000, discount: 115000, items: [] },
];

export const getStatusStyles = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
        case 'pending_restaurant': return 'bg-blue-50 text-blue-600 border-blue-100';
        case 'restaurant_accepted':
        case 'driver_accepted':
        case 'delivering':
        case 'preparing':
        case 'ready':
            return 'bg-green-50 text-green-600 border-green-100';
        case 'delivered': return 'bg-gray-100 text-gray-600 border-gray-200';
        case 'restaurant_rejected':
        case 'cancelled':
            return 'bg-red-50 text-red-600 border-red-100';
        default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
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

    const statusLower = order.status.toLowerCase();
    const isLoading = isUpdating === order.id;

    // Map UI format to Modal expectance
    const mappedForModal: Order = {
        id: order.id,
        customerName: order.delivery_address.split('|')[0]?.trim() || 'Khách hàng',
        address: order.delivery_address.split('|')[2]?.trim() || order.delivery_address,
        total: Math.max(0, parseFloat(order.subtotal) + parseFloat(order.delivery_fee) - parseFloat(order.discount)),
        subtotal: parseFloat(order.subtotal),
        deliveryFee: parseFloat(order.delivery_fee),
        discount: parseFloat(order.discount),
        status: (STATUS_MAP[statusLower] || order.status),
        createdAt: order.created_at,
        items: order.items.map(i => ({
            name: i.product_name,
            quantity: i.quantity,
            price: parseFloat(i.unit_price)
        }))
    };

    return (
        <div 
            onClick={() => onCardClick(mappedForModal)} 
            className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 cursor-pointer transition-all hover:shadow-xl hover:translate-y-[-4px] flex flex-col justify-between h-full"
        >
            <div>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-black text-orange-500 text-base tracking-tight">#{order.id.substring(0, 8).toUpperCase()}</h3>
                    <span className={`text-[11px] font-black px-3 py-1 rounded-full border uppercase tracking-tight ${getStatusStyles(order.status)}`}>
                        {STATUS_MAP[statusLower] || order.status}
                    </span>
                </div>
                
                <div className="mb-4">
                    <p className="font-black text-gray-900 text-lg leading-tight">{mappedForModal.customerName}</p>
                    <div className="flex items-center text-[12px] text-gray-400 mt-1 font-bold">
                        <ClockIcon className="h-3.5 w-3.5 mr-1" /> {formatDateTime(order.created_at)}
                    </div>
                </div>

                <div className="bg-gray-50/80 rounded-2xl p-4 mb-6 min-h-[60px] flex items-center">
                    {order.items.length > 0 && (
                        <p className="text-sm text-gray-700 font-medium">
                            <span className="font-black text-gray-900">{order.items[0].quantity}x</span> {order.items[0].product_name}
                            {order.items.length > 1 && <span className="text-gray-400 italic font-normal ml-1"> +{order.items.length - 1} món khác</span>}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex justify-between items-end pt-2 border-t border-gray-50 mt-auto">
                <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Tổng cộng</p>
                    <p className="font-black text-2xl text-gray-900 tracking-tight">{formatCurrency(mappedForModal.total)}</p>
                </div>
                
                <div onClick={e => e.stopPropagation()} className="flex space-x-2">
                    {statusLower === 'pending_restaurant' && (
                        <>
                            <button 
                                disabled={isLoading}
                                onClick={(e) => handleActionClick(e, 'restaurant_accepted')} 
                                className="flex items-center justify-center text-sm font-black text-white bg-green-500 hover:bg-green-600 px-5 py-2.5 rounded-2xl transition-all active:scale-95 shadow-md shadow-green-100 disabled:opacity-50"
                            >
                                {isLoading ? '...' : <><CheckCircleIcon className="h-4 w-4 mr-2" /> Nhận đơn</>}
                            </button>
                            <button 
                                disabled={isLoading}
                                onClick={(e) => handleActionClick(e, 'restaurant_rejected')} 
                                className="flex items-center justify-center text-sm font-black text-white bg-red-500 hover:bg-red-600 px-5 py-2.5 rounded-2xl transition-all active:scale-95 shadow-md shadow-red-100 disabled:opacity-50"
                            >
                                {isLoading ? '...' : <><XCircleIcon className="h-4 w-4 mr-2" /> Từ chối</>}
                            </button>
                        </>
                    )}
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
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [restaurantId, setRestaurantId] = useState<string | null>(null);
    
    const tabs = [
        { id: 'All', label: 'Tất cả' },
        { id: 'pending_restaurant', label: 'Chờ nhận' },
        { id: 'Active', label: 'Đang xử lý' },
        { id: 'delivered', label: 'Hoàn tất' }
    ];

    useEffect(() => {
        const init = async () => {
            try {
                const me = await apiService.getMe('seller');
                const resData = await (await fetch(`http://localhost:8004/api/v1/restaurants/owner/${me.id}`, {
                    headers: apiService.getAuthHeaders('seller')
                })).json();
                const res = Array.isArray(resData) ? resData[0] : resData;
                setRestaurantId(res.id.toString());
            } catch (err) {
                console.error("Lỗi xác định nhà hàng:", err);
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
                const sorted = data.items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setOrders(sorted);
            } catch (err) {
                console.error("Lỗi tải đơn hàng:", err);
            } finally {
                if (initial) setIsLoading(false);
            }
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
        } catch (err: any) {
            alert(err.message || "Không thể cập nhật trạng thái.");
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const filteredOrders = useMemo(() => {
        if (activeTab === 'All') return orders;
        if (activeTab === 'Active') {
            return orders.filter(o => !['pending_restaurant', 'delivered', 'restaurant_rejected', 'cancelled'].includes(o.status.toLowerCase()));
        }
        return orders.filter(o => o.status.toLowerCase() === activeTab.toLowerCase());
    }, [orders, activeTab]);

    if (isLoading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                <p className="text-gray-500 font-bold tracking-tight">ĐANG TẢI ĐƠN HÀNG...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 sm:p-10">
            <div className="flex flex-col md:flex-row justify-between md:items-end mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Đơn hàng</h1>
                    <p className="text-gray-500 mt-2 font-medium">Theo dõi và vận hành cửa hàng của bạn một cách tối ưu.</p>
                </div>
                <div className="flex bg-gray-100 p-1.5 rounded-[1.5rem] space-x-1 shadow-inner border border-gray-200/50">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-2.5 rounded-[1.2rem] text-xs font-black transition-all uppercase tracking-wider ${
                                activeTab === tab.id 
                                ? 'bg-white text-orange-600 shadow-md border border-gray-100' 
                                : 'text-gray-500 hover:text-gray-900'
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
                <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                    <div className="h-20 w-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ClipboardListIcon className="h-10 w-10 text-orange-200" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900">Danh sách trống</h3>
                    <p className="text-gray-500 mt-2 font-medium px-4">Không tìm thấy đơn hàng nào trong mục "{tabs.find(t => t.id === activeTab)?.label}".</p>
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
