
import React, { useState, useEffect } from 'react';
import { orderApiService, OrderResponseData } from '../services/orderApi';
import { restaurantApiService, RestaurantListItem } from '../services/restaurantApi';
import { XIcon, ClockIcon, LocationMarkerIcon, PhoneIcon, CheckCircleIcon, CashIcon, ClipboardListIcon, StarIcon, XCircleIcon, TagIcon } from './Icons';

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

    useEffect(() => {
        let interval: any;

        const fetchDetails = async (initial = false) => {
            if (initial) setIsLoading(true);
            try {
                const orderData = await orderApiService.getOrderById(orderId);
                setOrder(orderData);
                
                if (!restaurant) {
                    const resData = await restaurantApiService.getRestaurantById(parseInt(orderData.restaurant_id, 10));
                    setRestaurant(resData);
                }

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
                    <p className="text-gray-500 font-bold">ĐANG TẢI THÔNG TIN...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center">
                    <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900">Lỗi</h3>
                    <p className="text-gray-500 mt-2">{error || 'Không tìm thấy đơn hàng.'}</p>
                    <button onClick={onClose} className="mt-6 w-full bg-gray-100 py-3 rounded-xl font-bold">Đóng</button>
                </div>
            </div>
        );
    }

    // Định nghĩa các bước theo đúng yêu cầu hình ảnh
    const steps = [
        { label: 'CHỜ XÁC NHẬN', icon: <ClockIcon className="h-5 w-5"/> },
        { label: 'ĐÃ XÁC NHẬN', icon: <CheckCircleIcon className="h-5 w-5"/> },
        { label: 'ĐANG CHẾ BIẾN', icon: <ClipboardListIcon className="h-5 w-5"/> },
        { label: 'ĐANG GIAO HÀNG', icon: <LocationMarkerIcon className="h-5 w-5"/> },
        { label: 'ĐÃ HOÀN TẤT', icon: <CheckCircleIcon className="h-5 w-5"/> }
    ];

    // Logic mapping trạng thái API sang index của progress bar
    const getActiveStepIndex = (status: string) => {
        const s = status.toLowerCase();
        if (s === 'pending_restaurant' || s === 'pending') return 0;
        if (s === 'restaurant_accepted') return 2; // Nhận đơn là nhảy thẳng đến đang chế biến (bước 2)
        if (s === 'driver_accepted' || s === 'delivering' || s === 'shipping') return 3;
        if (s === 'delivered') return 4;
        return -1;
    };

    const currentIdx = getActiveStepIndex(order.status);
    const isCancelled = order.status.toUpperCase() === 'CANCELLED' || order.status.toUpperCase() === 'REJECTED' || order.status.toLowerCase() === 'restaurant_rejected';
    
    const subtotal = parseFloat(order.subtotal || '0');
    const deliveryFee = parseFloat(order.delivery_fee || '0');
    const discountAmount = parseFloat(order.discount || '0');
    const finalTotal = Math.max(0, subtotal + deliveryFee - discountAmount);

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-8 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Đơn hàng #{order.id.substring(0, 8).toUpperCase()}</h2>
                        <p className="text-xs text-gray-400 mt-1 font-bold uppercase tracking-widest flex items-center">
                            <span className="h-1.5 w-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                            Tự động cập nhật trực tuyến
                        </p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                        <XIcon className="h-7 w-7 text-gray-400" />
                    </button>
                </div>

                <div className="p-8 space-y-10">
                    {/* TRẠNG THÁI TIẾN TRÌNH (PROGRESS BAR) */}
                    <div className="py-6">
                        {isCancelled ? (
                            <div className="flex items-center justify-center space-x-3 text-red-600 bg-red-50 p-6 rounded-[2rem] border-2 border-dashed border-red-100">
                                <XCircleIcon className="h-8 w-8" />
                                <span className="text-lg font-black uppercase tracking-tight">Đơn hàng đã bị hủy hoặc bị từ chối</span>
                            </div>
                        ) : (
                            <div className="relative">
                                {/* Thanh nối giữa các bước */}
                                <div className="absolute top-6 left-[10%] right-[10%] h-0.5 bg-gray-100 -z-0">
                                    <div 
                                        className="h-full bg-orange-500 transition-all duration-1000 ease-out" 
                                        style={{ width: `${currentIdx >= 0 ? (currentIdx / (steps.length - 1)) * 100 : 0}%` }}
                                    ></div>
                                </div>

                                {/* Các vòng tròn trạng thái */}
                                <div className="flex justify-between relative z-10">
                                    {steps.map((step, idx) => {
                                        const isActive = idx <= currentIdx;
                                        return (
                                            <div key={idx} className="flex flex-col items-center flex-1">
                                                <div className={`h-12 w-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ${
                                                    isActive 
                                                    ? 'bg-orange-500 text-white scale-110 ring-4 ring-orange-50' 
                                                    : 'bg-white text-gray-300 border-2 border-gray-100'
                                                }`}>
                                                    {step.icon}
                                                </div>
                                                <p className={`text-[10px] mt-4 font-black text-center leading-tight tracking-tight px-1 ${
                                                    isActive ? 'text-orange-600' : 'text-gray-300'
                                                }`}>
                                                    {step.label}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Thông tin đối tác</h3>
                                {restaurant ? (
                                    <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        <div className="h-12 w-12 rounded-xl bg-orange-500 flex items-center justify-center font-black text-white shadow-md">
                                            {restaurant.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 text-lg leading-tight">{restaurant.name}</p>
                                            <div className="flex items-center text-xs text-orange-500 mt-1 font-bold">
                                                <StarIcon className="h-3 w-3 mr-1" />
                                                <span>{restaurant.rating.toFixed(1)} đánh giá</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="animate-pulse flex space-x-4">
                                        <div className="rounded-xl bg-gray-200 h-12 w-12"></div>
                                        <div className="flex-1 space-y-2 py-1">
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Địa điểm giao hàng</h3>
                                <div className="space-y-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="flex items-start">
                                        <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center mr-3 shadow-sm text-orange-500 flex-shrink-0">
                                            <LocationMarkerIcon className="h-4 w-4"/>
                                        </div>
                                        <span className="text-sm text-gray-700 font-bold leading-relaxed">{order.delivery_address}</span>
                                    </div>
                                    <div className="flex items-center border-t border-gray-200/50 pt-3">
                                        <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center mr-3 shadow-sm text-blue-500 flex-shrink-0">
                                            <PhoneIcon className="h-4 w-4"/>
                                        </div>
                                        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Thông tin liên hệ bảo mật</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-1">Tóm tắt món ăn</h3>
                            <div className="bg-white border-2 border-gray-50 rounded-[2rem] overflow-hidden shadow-sm">
                                <ul className="divide-y divide-gray-50 max-h-56 overflow-y-auto px-2">
                                    {order.items.map((item: any, idx: number) => (
                                        <li key={idx} className="p-4 flex justify-between items-center group transition-colors hover:bg-gray-50/50">
                                            <div className="flex items-center min-w-0">
                                                <span className="h-7 w-7 rounded-lg bg-orange-50 text-orange-600 font-black flex items-center justify-center mr-4 text-[10px] flex-shrink-0">
                                                    {item.quantity}x
                                                </span>
                                                <span className="text-gray-900 font-bold text-sm truncate">{item.product_name}</span>
                                            </div>
                                            <span className="font-black text-gray-900 text-sm ml-4">{formatCurrency(item.unit_price * item.quantity)}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="bg-orange-50/50 p-6 space-y-3 border-t-2 border-orange-100/50">
                                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        <span>Tạm tính</span>
                                        <span>{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        <span>Phí giao hàng</span>
                                        <span>{formatCurrency(deliveryFee)}</span>
                                    </div>
                                    {discountAmount > 0 && (
                                        <div className="flex justify-between text-xs text-green-600 font-black uppercase tracking-wider">
                                            <span className="flex items-center"><TagIcon className="h-3.5 w-3.5 mr-1.5" /> Giảm giá</span>
                                            <span>-{formatCurrency(discountAmount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-2xl font-black text-orange-600 border-t border-orange-200/30 pt-4 mt-2">
                                        <span className="tracking-tighter">TỔNG CỘNG</span>
                                        <span>{formatCurrency(finalTotal)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 border-t bg-gray-50/30 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-10 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-gray-800 transition-all shadow-xl active:scale-95 text-lg tracking-tight"
                    >
                        ĐÓNG CHI TIẾT
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserOrderDetailModal;
