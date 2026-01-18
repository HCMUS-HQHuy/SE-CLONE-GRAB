
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
        case 'PENDING': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
        case 'CONFIRMED': return 'bg-blue-50 text-blue-600 border-blue-100';
        case 'PREPARING': return 'bg-orange-50 text-orange-600 border-orange-100';
        case 'SHIPPING': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
        case 'DELIVERED': return 'bg-green-50 text-green-600 border-green-100';
        case 'CANCELLED': return 'bg-red-50 text-red-600 border-red-100';
        default: return 'bg-gray-50 text-gray-600 border-gray-100';
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
            <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50/50">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-4"></div>
                <p className="text-gray-400 font-medium text-sm">Đang tải lịch sử đơn hàng...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
            <div className="mb-10 flex items-end justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">Đơn hàng của tôi</h1>
                    <p className="text-gray-400 text-sm mt-1">Theo dõi các món ăn bạn đã đặt gần đây.</p>
                </div>
                <button 
                    onClick={fetchOrders}
                    className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center bg-orange-50/50 px-4 py-2 rounded-full transition-all border border-orange-100/50"
                >
                    Làm mới
                </button>
            </div>

            {error && (
                <div className="bg-red-50/50 border border-red-100 text-red-500 p-4 rounded-2xl mb-8 text-sm font-medium">
                    {error}
                </div>
            )}

            {orders.length > 0 ? (
                <div className="space-y-5">
                    {orders.map(order => {
                        const subtotal = parseFloat(order.subtotal || '0');
                        const deliveryFee = parseFloat(order.delivery_fee || '0');
                        const discountVal = parseFloat(order.discount || '0');
                        const calculatedTotal = Math.max(0, subtotal + deliveryFee - discountVal);

                        return (
                            <div 
                                key={order.id}
                                onClick={() => setSelectedOrderId(order.id)}
                                className="bg-white rounded-3xl p-6 border border-gray-100/50 shadow-sm hover:shadow-md hover:border-orange-100 transition-all cursor-pointer group"
                            >
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6">
                                    <div className="flex items-start space-x-5">
                                        <div className="h-14 w-14 rounded-2xl bg-gray-50 flex items-center justify-center flex-shrink-0 border border-gray-100 group-hover:bg-orange-50 transition-colors">
                                            <ClipboardListIcon className="h-6 w-6 text-gray-400 group-hover:text-orange-400 transition-colors" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-gray-800 text-base group-hover:text-orange-600 transition-colors">#{order.id.substring(0, 8).toUpperCase()}</h3>
                                            <div className="flex items-center text-[11px] text-gray-400 mt-1.5 space-x-4 font-medium uppercase tracking-wider">
                                                <span className="flex items-center"><ClockIcon className="h-3.5 w-3.5 mr-1.5 opacity-60" /> {formatDate(order.created_at)}</span>
                                                <span className="flex items-center"><CashIcon className="h-3.5 w-3.5 mr-1.5 opacity-60" /> {order.payment_method === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}</span>
                                            </div>
                                            {discountVal > 0 && (
                                                <div className="flex items-center text-[10px] text-green-500 font-semibold mt-2 uppercase tracking-tight bg-green-50 w-fit px-2 py-0.5 rounded-md">
                                                    <TagIcon className="h-3 w-3 mr-1" /> Giảm {formatCurrency(discountVal)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end sm:space-x-8 border-t sm:border-t-0 pt-4 sm:pt-0">
                                        <div className="text-left sm:text-right">
                                            <p className="text-lg font-semibold text-gray-800 tracking-tight">{formatCurrency(calculatedTotal)}</p>
                                            <span className={`inline-block px-3 py-1 mt-1.5 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <ChevronRightIcon className="h-5 w-5 text-gray-300 group-hover:text-orange-400 transition-colors hidden sm:block" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] border border-dashed border-gray-200 py-24 text-center px-6">
                    <ClipboardListIcon className="h-16 w-16 text-gray-100 mx-auto mb-6" />
                    <h3 className="text-lg font-semibold text-gray-700">Bạn chưa đặt món nào</h3>
                    <p className="text-gray-400 text-sm mt-2 max-w-xs mx-auto leading-relaxed">Hãy khám phá các nhà hàng tuyệt vời xung quanh bạn và đặt món ngay hôm nay!</p>
                    <button 
                        onClick={() => window.location.href = '/user/home'}
                        className="mt-10 bg-orange-500 text-white font-semibold py-3 px-10 rounded-full shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all active:scale-95"
                    >
                        Khám phá ngay
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
