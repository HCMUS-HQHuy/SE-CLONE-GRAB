
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
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white rounded-3xl p-12 flex flex-col items-center shadow-xl border border-gray-100">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-6"></div>
                    <p className="text-gray-400 font-semibold text-xs tracking-widest uppercase">Đang đồng bộ...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-xl">
                    <XCircleIcon className="h-16 w-16 text-red-400 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold text-gray-800 tracking-tight">Đã có lỗi</h3>
                    <p className="text-gray-500 mt-2 text-sm leading-relaxed">{error || 'Không tìm thấy dữ liệu đơn hàng.'}</p>
                    <button onClick={onClose} className="mt-8 w-full bg-gray-50 text-gray-600 py-3 rounded-2xl font-semibold text-sm hover:bg-gray-100 transition-colors">Đóng cửa sổ</button>
                </div>
            </div>
        );
    }

    const steps = [
        { label: 'Chờ xác nhận', icon: <ClockIcon className="h-4 w-4"/> },
        { label: 'Đã xác nhận', icon: <CheckCircleIcon className="h-4 w-4"/> },
        { label: 'Chế biến', icon: <ClipboardListIcon className="h-4 w-4"/> },
        { label: 'Đang giao', icon: <LocationMarkerIcon className="h-4 w-4"/> },
        { label: 'Hoàn tất', icon: <CheckCircleIcon className="h-4 w-4"/> }
    ];

    const getActiveStepIndex = (status: string) => {
        const s = status.toLowerCase();
        if (s === 'pending_restaurant' || s === 'pending') return 0;
        if (s === 'restaurant_accepted') return 2;
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
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-100/50" onClick={e => e.stopPropagation()}>
                <div className="p-8 border-b border-gray-50 sticky top-0 bg-white/90 backdrop-blur-md z-10 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 tracking-tight">Đơn hàng #{order.id.substring(0, 8).toUpperCase()}</h2>
                        <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-widest flex items-center">
                            <span className="h-1.5 w-1.5 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                            Cập nhật trực tuyến
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-300 hover:text-gray-500">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-8 space-y-12">
                    {/* PROGRESS BAR SECTION */}
                    <div className="py-4">
                        {isCancelled ? (
                            <div className="flex items-center justify-center space-x-4 text-red-500 bg-red-50/50 p-8 rounded-[2rem] border border-red-100 border-dashed">
                                <XCircleIcon className="h-7 w-7" />
                                <span className="text-base font-semibold uppercase tracking-wide">Đơn hàng đã bị hủy</span>
                            </div>
                        ) : (
                            <div className="relative">
                                {/* Track Line */}
                                <div className="absolute top-5 left-[12%] right-[12%] h-0.5 bg-gray-100 -z-0">
                                    <div 
                                        className="h-full bg-orange-400 transition-all duration-1000 ease-in-out" 
                                        style={{ width: `${currentIdx >= 0 ? (currentIdx / (steps.length - 1)) * 100 : 0}%` }}
                                    ></div>
                                </div>

                                {/* Status Points */}
                                <div className="flex justify-between relative z-10 px-2">
                                    {steps.map((step, idx) => {
                                        const isPast = idx < currentIdx;
                                        const isCurrent = idx === currentIdx;
                                        const isFuture = idx > currentIdx;
                                        
                                        return (
                                            <div key={idx} className="flex flex-col items-center flex-1">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-700 ${
                                                    isPast ? 'bg-orange-100 text-orange-600' : 
                                                    isCurrent ? 'bg-orange-500 text-white shadow-lg ring-4 ring-orange-100' : 
                                                    'bg-white text-gray-200 border-2 border-gray-100'
                                                }`}>
                                                    {step.icon}
                                                </div>
                                                <p className={`text-[10px] mt-4 font-bold text-center leading-tight tracking-tight px-1 uppercase ${
                                                    isCurrent ? 'text-orange-600' : 'text-gray-400'
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-10">
                            <section>
                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-5 ml-1">Đối tác vận chuyển</h3>
                                {restaurant ? (
                                    <div className="flex items-center space-x-5 bg-gray-50/50 p-5 rounded-3xl border border-gray-100">
                                        <div className="h-12 w-12 rounded-2xl bg-orange-500 flex items-center justify-center font-semibold text-white shadow-md shadow-orange-100">
                                            {restaurant.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800 text-base">{restaurant.name}</p>
                                            <div className="flex items-center text-[11px] text-orange-500 mt-1.5 font-bold">
                                                <StarIcon className="h-3.5 w-3.5 mr-1.5" />
                                                <span>{restaurant.rating.toFixed(1)} Đánh giá quán</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="animate-pulse bg-gray-50 h-20 rounded-3xl"></div>
                                )}
                            </section>

                            <section>
                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-5 ml-1">Chi tiết nhận hàng</h3>
                                <div className="space-y-5 p-6 bg-gray-50/50 rounded-3xl border border-gray-100">
                                    <div className="flex items-start">
                                        <div className="h-8 w-8 bg-white rounded-xl flex items-center justify-center mr-4 shadow-sm text-orange-400 flex-shrink-0">
                                            <LocationMarkerIcon className="h-4 w-4"/>
                                        </div>
                                        <span className="text-sm text-gray-600 font-medium leading-relaxed pt-1">{order.delivery_address}</span>
                                    </div>
                                    <div className="flex items-center border-t border-gray-100 pt-5">
                                        <div className="h-8 w-8 bg-white rounded-xl flex items-center justify-center mr-4 shadow-sm text-blue-400 flex-shrink-0">
                                            <PhoneIcon className="h-4 w-4"/>
                                        </div>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">SĐT Đã được bảo mật</span>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <section>
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-5 ml-1">Danh mục món ăn</h3>
                            <div className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm">
                                <ul className="divide-y divide-gray-50 max-h-60 overflow-y-auto px-4">
                                    {order.items.map((item: any, idx: number) => (
                                        <li key={idx} className="py-5 flex justify-between items-center group">
                                            <div className="flex items-center min-w-0 pr-4">
                                                <span className="h-7 w-7 rounded-lg bg-orange-50 text-orange-600 font-bold flex items-center justify-center mr-4 text-[10px] flex-shrink-0 border border-orange-100/50">
                                                    {item.quantity}x
                                                </span>
                                                <span className="text-gray-700 font-medium text-sm truncate">{item.product_name}</span>
                                            </div>
                                            <span className="font-semibold text-gray-800 text-sm">{formatCurrency(item.unit_price * item.quantity)}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="bg-gray-50/50 p-6 space-y-3.5 border-t border-gray-50">
                                    <div className="flex justify-between text-xs font-medium text-gray-400">
                                        <span>Tạm tính</span>
                                        <span className="text-gray-600">{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-medium text-gray-400">
                                        <span>Phí giao hàng</span>
                                        <span className="text-gray-600">{formatCurrency(deliveryFee)}</span>
                                    </div>
                                    {discountAmount > 0 && (
                                        <div className="flex justify-between text-xs text-green-600 font-semibold bg-green-50/50 px-3 py-1.5 rounded-lg">
                                            <span className="flex items-center"><TagIcon className="h-3.5 w-3.5 mr-2" /> Ưu đãi giảm giá</span>
                                            <span>-{formatCurrency(discountAmount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-baseline border-t border-gray-100 pt-5 mt-3">
                                        <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Tổng đơn</span>
                                        <span className="text-2xl font-black text-orange-500 tracking-tighter">{formatCurrency(finalTotal)}</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                <div className="p-8 border-t border-gray-50 bg-gray-50/30 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-12 py-3.5 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 transition-all shadow-lg shadow-orange-100 active:scale-[0.98] text-sm tracking-wide"
                    >
                        Quay lại trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserOrderDetailModal;
