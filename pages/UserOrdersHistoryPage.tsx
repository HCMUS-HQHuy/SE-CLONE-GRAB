
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { orderApiService, OrderResponseData } from '../services/orderApi';
import { apiService } from '../services/api';
import { ClipboardListIcon, ClockIcon, CashIcon, ChevronRightIcon, TagIcon } from '../components/Icons';
import UserOrderDetailModal from '../components/UserOrderDetailModal';

const formatCurrency = (amount: string | number) => {
    const val = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val).replace(/\s/g, '');
};

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
        case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'CONFIRMED': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'PREPARING': return 'bg-orange-100 text-orange-700 border-orange-200';
        case 'SHIPPING': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
        case 'DELIVERED': return 'bg-green-100 text-green-700 border-green-200';
        case 'CANCELLED': 
        case 'REJECTED':
        case 'RESTAURANT_REJECTED':
        case 'DRIVER_REJECTED': return 'bg-red-100 text-red-700 border-red-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
};

const UserOrdersHistoryPage: React.FC = () => {
    const [orders, setOrders] = useState<OrderResponseData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
        
        const params = new URLSearchParams(location.search);
        const newOrderId = params.get('newOrder');
        if (newOrderId) {
            setSelectedOrderId(newOrderId);
        }
    }, [location.search]);

    const fetchOrders = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const me = await apiService.getMe('user');
            const data = await orderApiService.getUserOrders(me.id.toString());
            const sorted = data.items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setOrders(sorted);
        } catch (err: any) {
            setError(err.message || 'Không thể tải lịch sử đơn hàng.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseModal = () => {
        setSelectedOrderId(null);
        navigate('/user/orders', { replace: true });
        fetchOrders();
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                <p className="text-gray-500 font-medium">Đang tải lịch sử đơn hàng...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Đơn hàng của tôi</h1>
                    <p className="text-gray-500 mt-1">Theo dõi và quản lý các món ăn bạn đã đặt.</p>
                </div>
                <button 
                    onClick={fetchOrders}
                    className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center bg-orange-50 px-4 py-2 rounded-full transition-all"
                >
                    Làm mới
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6">
                    {error}
                </div>
            )}

            {orders.length > 0 ? (
                <div className="space-y-4">
                    {orders.map(order => {
                        const subtotal = parseFloat(order.subtotal || '0');
                        const deliveryFee = parseFloat(order.delivery_fee || '0');
                        const discountVal = parseFloat(order.discount || '0');
                        const calculatedTotal = Math.max(0, subtotal + deliveryFee - discountVal);

                        return (
                            <div 
                                key={order.id}
                                onClick={() => setSelectedOrderId(order.id)}
                                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                            >
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                    <div className="flex items-start space-x-4">
                                        <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                                            <ClipboardListIcon className="h-6 w-6 text-orange-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">Đơn hàng #{order.id.substring(0, 8).toUpperCase()}</h3>
                                            <div className="flex items-center text-xs text-gray-500 mt-1 space-x-3">
                                                <span className="flex items-center"><ClockIcon className="h-3.5 w-3.5 mr-1" /> {formatDate(order.created_at)}</span>
                                                <span className="flex items-center"><CashIcon className="h-3.5 w-3.5 mr-1" /> {order.payment_method === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}</span>
                                            </div>
                                            {discountVal > 0 && (
                                                <div className="flex items-center text-[10px] text-green-600 font-black mt-1 uppercase tracking-tight">
                                                    <TagIcon className="h-3 w-3 mr-1" /> Đã giảm {formatCurrency(discountVal)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end sm:space-x-6">
                                        <div className="text-right">
                                            <p className="text-lg font-black text-gray-900">{formatCurrency(calculatedTotal)}</p>
                                            <span className={`inline-block px-2.5 py-0.5 mt-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(order.status)}`}>
                                                {order.status === 'driver_rejected' ? 'SHIPPER IS UNAVAILABLE' : order.status}
                                            </span>
                                        </div>
                                        <ChevronRightIcon className="h-5 w-5 text-gray-300 group-hover:text-orange-500 transition-colors hidden sm:block" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
                    <ClipboardListIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800">Bạn chưa đặt món nào</h3>
                    <p className="text-gray-500 mt-2">Khám phá các nhà hàng ngon xung quanh bạn ngay!</p>
                    <button 
                        onClick={() => window.location.href = '/user/home'}
                        className="mt-8 bg-orange-500 text-white font-black py-3 px-8 rounded-xl shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all"
                    >
                        Đặt món ngay
                    </button>
                </div>
            )}

            {selectedOrderId && (
                <UserOrderDetailModal 
                    orderId={selectedOrderId} 
                    onClose={handleCloseModal} 
                />
            )}
        </div>
    );
};

export default UserOrdersHistoryPage;
