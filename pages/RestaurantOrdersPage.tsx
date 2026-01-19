
import React, { useState, useMemo, useEffect } from 'react';
import { ClockIcon, CheckCircleIcon, XCircleIcon, TruckIcon, ChevronLeftIcon, ChevronRightIcon, ClipboardListIcon, ExclamationIcon, PackageIcon } from '../components/Icons';
import OrderDetailModal from '../components/OrderDetailModal';
import { orderApiService, OrderResponseData } from '../services/orderApi';
import { restaurantApiService } from '../services/restaurantApi';
import { apiService } from '../services/api';

// Map trạng thái API sang nhãn hiển thị Tiếng Việt cho Seller
const STATUS_MAP: Record<string, string> = {
    'pending_restaurant': 'Đơn hàng mới',
    'restaurant_accepted': 'Đã xác nhận',
    'restaurant_rejected': 'Đã từ chối',
    'preparing': 'Đang chế biến',
    'ready': 'Chờ tài xế',
    'driver_rejected': 'Tìm lại tài xế', // Chuyển đổi theo yêu cầu
    'finding_driver': 'Đang tìm tài xế',
    'driver_accepted': 'Tài xế đã nhận',
    'delivering': 'Đang giao hàng',
    'delivered': 'Hoàn thành',
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
    items: {
        name: string;
        quantity: number;
        price: number;
    }[];
};

const ITEMS_PER_PAGE = 9;

export const getStatusStyles = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'pending_restaurant') return 'bg-amber-50 text-amber-600 border-amber-100';
    if (s === 'restaurant_accepted' || s === 'confirmed') return 'bg-blue-50 text-blue-600 border-blue-100';
    if (s === 'restaurant_rejected' || s === 'cancelled') return 'bg-rose-50 text-rose-600 border-rose-100';
    if (s === 'preparing') return 'bg-orange-50 text-orange-600 border-orange-100';
    if (s === 'ready' || s === 'finding_driver') return 'bg-indigo-50 text-indigo-600 border-indigo-100';
    if (s === 'driver_rejected') return 'bg-purple-50 text-purple-600 border-purple-100'; // Màu đặc thù cho điều phối lại
    if (s === 'delivered') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    return 'bg-gray-50 text-gray-500 border-gray-100';
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
                        className="flex items-center text-[10px] font-black uppercase tracking-widest text-white bg-emerald-500 hover:bg-emerald-600 px-3 py-2 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isLoading ? '...' : 'Nhận đơn'}
                    </button>
                    <button 
                        disabled={isLoading}
                        onClick={(e) => handleActionClick(e, 'restaurant_rejected')} 
                        className="flex items-center text-[10px] font-black uppercase tracking-widest text-white bg-rose-500 hover:bg-rose-600 px-3 py-2 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isLoading ? '...' : 'Từ chối'}
                    </button>
                </div>
            );
        }
        
        if (s === 'restaurant_accepted') {
            return (
                <button 
                    disabled={isLoading}
                    onClick={(e) => handleActionClick(e, 'preparing')} 
                    className="flex items-center text-[10px] font-black uppercase tracking-widest text-white bg-orange-500 hover:bg-orange-600 px-5 py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-orange-100"
                >
                    {isLoading ? '...' : 'Bắt đầu nấu'}
                </button>
            );
        }

        if (s === 'preparing') {
            return (
                <button 
                    disabled={isLoading}
                    onClick={(e) => handleActionClick(e, 'ready')} 
                    className="flex items-center text-[10px] font-black uppercase tracking-widest text-white bg-indigo-500 hover:bg-indigo-600 px-5 py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-indigo-100"
                >
                    {isLoading ? '...' : 'Hoàn tất món'}
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
        <div onClick={() => onCardClick(mappedForModal)} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 cursor-pointer transition-all hover:shadow-md hover:border-orange-200 group">
            <div className="flex justify-between items-start mb-5">
                <div className="min-w-0 flex-1">
                    <h3 className="font-black text-orange-500 text-xs tracking-widest uppercase">#{order.id.substring(0, 8)}</h3>
                    <p className="font-black text-gray-800 mt-1 truncate text-base">{mappedForModal.customerName}</p>
                    <div className="flex items-center text-[10px] text-gray-400 mt-1.5 uppercase font-bold tracking-widest">
                        <ClockIcon className="h-3 w-3 mr-1.5" /> {formatDateTime(order.created_at)}
                    </div>
                </div>
                <span className={`text-[10px] font-black px-3 py-1.5 rounded-full border uppercase tracking-tighter ${getStatusStyles(order.status)}`}>
                    {STATUS_MAP[order.status.toLowerCase()] || order.status}
                </span>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-4 mb-5 border border-gray-100 shadow-inner">
                {order.items.length > 0 && (
                    <p className="text-sm text-gray-600 line-clamp-1">
                        <span className="font-black text-gray-900">{order.items[0].quantity}x</span> {order.items[0].product_name}
                        {order.items.length > 1 && <span className="text-gray-400 italic ml-1 font-medium"> +{order.items.length - 1} món khác</span>}
                    </p>
                )}
            </div>

            <div className="flex justify-between items-center pt-2">
                <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Thanh toán</p>
                    <p className="font-black text-xl text-gray-900 tracking-tighter">{formatCurrency(order.total_amount)}</p>
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
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [restaurantId, setRestaurantId] = useState<string | null>(null);
    
    // Hệ thống filter categories mới
    const tabs = [
        { id: 'All', label: 'Tất cả' },
        { id: 'New', label: 'Mới' },
        { id: 'Cooking', label: 'Đang nấu' },
        { id: 'Waiting', label: 'Chờ giao' },
        { id: 'Shipping', label: 'Đang đi' },
        { id: 'Finished', label: 'Kết thúc' }
    ];

    useEffect(() => {
        const init = async () => {
            try {
                const me = await apiService.getMe('seller');
                const res = await restaurantApiService.getRestaurantByOwner(me.id);
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
        const interval = setInterval(() => fetchOrders(false), 15000);
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
        return orders.filter(o => {
            const s = o.status.toLowerCase();
            if (activeTab === 'All') return true;
            if (activeTab === 'New') return s === 'pending_restaurant';
            if (activeTab === 'Cooking') return s === 'preparing' || s === 'restaurant_accepted';
            if (activeTab === 'Waiting') return s === 'ready' || s === 'finding_driver' || s === 'driver_rejected';
            if (activeTab === 'Shipping') return s === 'driver_accepted' || s === 'delivering';
            if (activeTab === 'Finished') return s === 'delivered' || s === 'cancelled' || s === 'restaurant_rejected';
            return true;
        });
    }, [orders, activeTab]);

    // Logic Phân trang
    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredOrders, currentPage]);

    useEffect(() => {
        setCurrentPage(1); // Reset trang khi đổi tab
    }, [activeTab]);

    if (isLoading && orders.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-4"></div>
                <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Đang tải dữ liệu...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-10 bg-gray-50/30 min-h-screen">
            <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-800 tracking-tight">Đơn hàng</h1>
                    <p className="text-gray-400 text-sm mt-1 font-medium">Quản lý và cập nhật tiến độ món ăn cho khách hàng.</p>
                </div>
                <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto custom-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
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
            
            {paginatedOrders.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {paginatedOrders.map(order => (
                            <OrderCard 
                                key={order.id} 
                                order={order} 
                                onUpdateStatus={handleUpdateStatus}
                                onCardClick={setSelectedOrder} 
                                isUpdating={updatingOrderId}
                            />
                        ))}
                    </div>
                    
                    {/* PAGINATION UI */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-6 pt-10">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                            >
                                <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                            </button>
                            <div className="flex items-center space-x-2">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trang</span>
                                <span className="text-base font-black text-gray-800">{currentPage}</span>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">/ {totalPages}</span>
                            </div>
                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                            >
                                <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-32 bg-white rounded-[3rem] shadow-sm border border-dashed border-gray-200">
                    <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <PackageIcon className="h-10 w-10 text-gray-200" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Không có đơn hàng nào</h3>
                    <p className="text-gray-400 mt-2 font-medium">Các đơn hàng thuộc mục "{tabs.find(t => t.id === activeTab)?.label}" sẽ xuất hiện ở đây.</p>
                </div>
            )}

            {selectedOrder && (
                <OrderDetailModal
                    isOpen={!!selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    order={selectedOrder}
                />
            )}
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #F3F4F6; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default RestaurantOrdersPage;
