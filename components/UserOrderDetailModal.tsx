
import React, { useState, useEffect } from 'react';
import { orderApiService, OrderResponseData } from '../services/orderApi';
import { restaurantApiService, RestaurantListItem } from '../services/restaurantApi';
// Add XCircleIcon to the imports
import { XIcon, ClockIcon, LocationMarkerIcon, PhoneIcon, CheckCircleIcon, CashIcon, ClipboardListIcon, StarIcon, XCircleIcon } from './Icons';

type Props = {
    orderId: string;
    onClose: () => void;
};

const formatCurrency = (amount: string | number) => {
    const val = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val).replace(/\s/g, '');
};

const UserOrderDetailModal: React.FC<Props> = ({ orderId, onClose }) => {
    const [order, setOrder] = useState<OrderResponseData | null>(null);
    const [restaurant, setRestaurant] = useState<RestaurantListItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Cơ chế Polling để cập nhật trạng thái đơn hàng mỗi 5 giây
    useEffect(() => {
        let interval: any;

        const fetchDetails = async (initial = false) => {
            if (initial) setIsLoading(true);
            try {
                const orderData = await orderApiService.getOrderById(orderId);
                setOrder(orderData);
                
                // Nếu chưa có thông tin nhà hàng, tải thông tin nhà hàng
                if (!restaurant) {
                    const resData = await restaurantApiService.getRestaurantById(parseInt(orderData.restaurant_id, 10));
                    setRestaurant(resData);
                }

                // Nếu đơn hàng đã kết thúc (Giao xong hoặc Hủy), dừng polling
                const finishedStatus = ['DELIVERED', 'CANCELLED', 'REJECTED'];
                if (finishedStatus.includes(orderData.status.toUpperCase())) {
                    clearInterval(interval);
                }
            } catch (err: any) {
                if (initial) setError(err.message || 'Lỗi tải chi tiết đơn hàng.');
            } finally {
                if (initial) setIsLoading(false);
            }
        };

        fetchDetails(true);
        interval = setInterval(() => fetchDetails(false), 5000);

        return () => clearInterval(interval);
    }, [orderId]);

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white rounded-3xl p-10 flex flex-col items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-4"></div>
                    <p className="text-gray-500">Đang chuẩn bị thông tin...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center">
                    {/* Fixed: XCircleIcon is now imported */}
                    <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900">Lỗi</h3>
                    <p className="text-gray-500 mt-2">{error || 'Không tìm thấy đơn hàng.'}</p>
                    <button onClick={onClose} className="mt-6 w-full bg-gray-100 py-3 rounded-xl font-bold">Đóng</button>
                </div>
            </div>
        );
    }

    const steps = [
        { key: 'PENDING', label: 'Chờ xác nhận', icon: <ClockIcon className="h-5 w-5"/> },
        { key: 'CONFIRMED', label: 'Đã xác nhận', icon: <CheckCircleIcon className="h-5 w-5"/> },
        { key: 'PREPARING', label: 'Đang chế biến', icon: <ClipboardListIcon className="h-5 w-5"/> },
        { key: 'SHIPPING', label: 'Đang giao hàng', icon: <LocationMarkerIcon className="h-5 w-5"/> },
        { key: 'DELIVERED', label: 'Đã hoàn tất', icon: <CheckCircleIcon className="h-5 w-5"/> }
    ];

    const currentIdx = steps.findIndex(s => s.key === order.status.toUpperCase());
    const isCancelled = order.status.toUpperCase() === 'CANCELLED' || order.status.toUpperCase() === 'REJECTED';

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-black text-gray-900">Chi tiết đơn #{order.id.substring(0, 8).toUpperCase()}</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Tự động cập nhật mỗi 5 giây</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <XIcon className="h-6 w-6 text-gray-400" />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Status Tracker */}
                    <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                        {isCancelled ? (
                            <div className="flex items-center space-x-3 text-red-600 bg-red-50 p-4 rounded-2xl border border-red-100">
                                {/* Fixed: XCircleIcon is now imported */}
                                <XCircleIcon className="h-6 w-6" />
                                <span className="font-bold">Đơn hàng đã bị hủy hoặc bị từ chối</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between relative px-2">
                                {steps.map((step, idx) => {
                                    const isActive = idx <= currentIdx;
                                    return (
                                        <div key={step.key} className="flex flex-col items-center relative z-10 flex-1">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow-sm transition-all duration-500 ${
                                                isActive ? 'bg-orange-500 text-white' : 'bg-white text-gray-300'
                                            }`}>
                                                {step.icon}
                                            </div>
                                            <p className={`text-[10px] mt-2 font-bold text-center uppercase tracking-tight ${
                                                isActive ? 'text-orange-600' : 'text-gray-300'
                                            }`}>{step.label}</p>
                                        </div>
                                    );
                                })}
                                {/* Progress Line */}
                                <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200 -z-0">
                                    <div 
                                        className="h-full bg-orange-500 transition-all duration-700" 
                                        style={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Info Section */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Nhà hàng</h3>
                                {restaurant ? (
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center font-bold text-orange-600">
                                            {restaurant.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">{restaurant.name}</p>
                                            <div className="flex items-center text-xs text-gray-500">
                                                <StarIcon className="h-3 w-3 text-yellow-400 mr-1" />
                                                <span>{restaurant.rating.toFixed(1)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">Đang tải thông tin quán...</p>
                                )}
                            </div>

                            <div>
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Giao đến</h3>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p className="flex items-start">
                                        <LocationMarkerIcon className="h-4 w-4 mr-2 text-orange-500 mt-0.5 flex-shrink-0"/>
                                        <span>{order.delivery_address}</span>
                                    </p>
                                    <p className="flex items-center">
                                        <PhoneIcon className="h-4 w-4 mr-2 text-orange-500 flex-shrink-0"/>
                                        <span>Thông tin liên hệ được bảo mật</span>
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Thanh toán</h3>
                                <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                                    <CashIcon className="h-5 w-5 text-gray-400"/>
                                    <span className="font-bold">{order.payment_method === 'CASH' ? 'Tiền mặt khi nhận hàng' : 'Đã thanh toán chuyển khoản'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Order Items Section */}
                        <div>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Món ăn đã chọn</h3>
                            <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                <ul className="divide-y divide-gray-50 max-h-48 overflow-y-auto">
                                    {order.items.map((item: any, idx: number) => (
                                        <li key={idx} className="p-3 flex justify-between items-center text-sm">
                                            <div className="flex items-center">
                                                <span className="h-6 w-6 rounded bg-orange-50 text-orange-600 font-bold flex items-center justify-center mr-3 text-xs">
                                                    {item.quantity}
                                                </span>
                                                <span className="text-gray-700 font-medium">{item.product_name}</span>
                                            </div>
                                            <span className="font-bold text-gray-900">{formatCurrency(item.unit_price * item.quantity)}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="bg-orange-50 p-4 space-y-2">
                                    <div className="flex justify-between text-xs text-gray-600">
                                        <span>Tạm tính</span>
                                        <span>{formatCurrency(order.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-600">
                                        <span>Phí giao hàng</span>
                                        <span>{formatCurrency(order.delivery_fee)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-black text-orange-600 border-t border-orange-100 pt-2 mt-2">
                                        <span>Tổng thanh toán</span>
                                        <span>{formatCurrency(order.total_amount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t bg-gray-50/50 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-8 py-3 bg-gray-900 text-white font-black rounded-2xl hover:bg-gray-800 transition-all shadow-lg active:scale-95"
                    >
                        Đóng chi tiết
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserOrderDetailModal;
