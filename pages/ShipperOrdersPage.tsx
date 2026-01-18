
import React, { useState, useEffect, useRef } from 'react';
import NewOrderAlert from '../components/NewOrderAlert';
import DeliveryInProgress from '../components/DeliveryInProgress';
import { ClockIcon } from '../components/Icons';
import { shipperApiService, TripItem } from '../services/shipperApi';
import { apiService } from '../services/api';
import { orderApiService } from '../services/orderApi';

type PageState = 'waiting' | 'new-order' | 'delivery-in-progress';

const ShipperOrdersPage: React.FC = () => {
    const [pageState, setPageState] = useState<PageState>('waiting');
    const [activeTrip, setActiveTrip] = useState<TripItem | null>(null);
    const [timeLeft, setTimeLeft] = useState(30);
    const [driverId, setDriverId] = useState<string | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const pollingIntervalRef = useRef<any>(null);

    // Lấy thông tin driverId khi mount
    useEffect(() => {
        const init = async () => {
            try {
                const me = await apiService.getMe('shipper');
                setDriverId(me.id.toString());
            } catch (err) {
                console.error("Lỗi lấy thông tin tài xế:", err);
            }
        };
        init();
    }, []);

    // Cơ chế Polling kiểm tra Trips mới hoặc trạng thái hiện tại
    useEffect(() => {
        if (!driverId) return;

        const pollTrips = async () => {
            try {
                const data = await shipperApiService.getDriverTrips(driverId, true);
                
                // 1. Tìm đơn mới (Assigned)
                const assignedTrip = data.items.find(trip => trip.status === 'Assigned');
                if (assignedTrip && pageState === 'waiting') {
                    setActiveTrip(assignedTrip);
                    setPageState('new-order');
                    setTimeLeft(30);
                    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                    return;
                }

                // 2. Nếu đang có đơn đang giao, cập nhật activeTrip để đồng bộ UI
                const inProgressTrip = data.items.find(trip => 
                    ['Accepted', 'PickedUp', 'InTransit'].includes(trip.status)
                );
                
                if (inProgressTrip) {
                    setActiveTrip(inProgressTrip);
                    setPageState('delivery-in-progress');
                    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                }
            } catch (err) {
                console.error("Polling Trips Error:", err);
            }
        };

        if (pageState === 'waiting') {
            pollTrips();
            pollingIntervalRef.current = setInterval(pollTrips, 5000);
        }

        return () => {
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        };
    }, [driverId, pageState]);

    // Countdown timer
    useEffect(() => {
        if (pageState === 'new-order' && timeLeft > 0) {
            const timer = setTimeout(() => {
                setTimeLeft(prevTime => prevTime - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (pageState === 'new-order' && timeLeft === 0) {
            handleDecline();
        }
    }, [pageState, timeLeft]);

    const handleAccept = async () => {
        if (!activeTrip) return;
        
        setIsActionLoading(true);
        try {
            // Cập nhật Trip sang 'Accepted'
            await shipperApiService.updateTripStatus(activeTrip.id, 'Accepted');
            
            // Cập nhật Order sang 'driver_accepted'
            await orderApiService.updateOrder(activeTrip.orderId, { 
                status: 'driver_accepted',
                driver_id: driverId || undefined
            });

            setPageState('delivery-in-progress');
        } catch (err: any) {
            alert(err.message || "Lỗi khi chấp nhận đơn hàng.");
            setPageState('waiting');
            setActiveTrip(null);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDecline = async () => {
        if (!activeTrip) {
            setPageState('waiting');
            return;
        }

        setIsActionLoading(true);
        try {
            await shipperApiService.updateTripStatus(activeTrip.id, 'Rejected');
        } catch (err) {
            console.error("Lỗi từ chối đơn hàng:", err);
        } finally {
            setIsActionLoading(false);
            setPageState('waiting');
            setActiveTrip(null);
        }
    };

    const handlePickup = async () => {
        if (!activeTrip) return;

        setIsActionLoading(true);
        try {
            // 1. Cập nhật Trip sang 'PickedUp' (Đã lấy hàng)
            await shipperApiService.updateTripStatus(activeTrip.id, 'PickedUp');
            
            // 2. Cập nhật Order sang 'delivering' (Đang vận chuyển)
            await orderApiService.updateOrder(activeTrip.orderId, { status: 'delivering' });
            
            // 3. Tự động chuyển Trip sang 'InTransit' (Đang di chuyển trên đường)
            await shipperApiService.updateTripStatus(activeTrip.id, 'InTransit');
        } catch (err: any) {
            alert(err.message || "Lỗi khi cập nhật trạng thái đã lấy hàng.");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleCompleteDelivery = async () => {
        if (!activeTrip) return;

        setIsActionLoading(true);
        try {
            // SỬ DỤNG API COMPLETE MỚI THEO YÊU CẦU
            await shipperApiService.completeTrip(activeTrip.id);

            // Cập nhật Order sang 'delivered' trên Order Service
            await orderApiService.updateOrder(activeTrip.orderId, { status: 'delivered' });

            alert('Giao hàng thành công!');
            setPageState('waiting');
            setActiveTrip(null);
        } catch (err: any) {
            alert(err.message || 'Lỗi khi hoàn thành đơn hàng.');
        } finally {
            setIsActionLoading(false);
        }
    };

    const getFormattedOrderData = () => {
        if (!activeTrip) return null;

        const addrParts = activeTrip.deliveryAddress.split('|');
        const customerDisplay = addrParts.length >= 3 ? addrParts[2].trim() : activeTrip.deliveryAddress;

        return {
            id: activeTrip.orderId.substring(0, 8).toUpperCase(),
            restaurantName: "Nhà hàng đối tác",
            restaurantAddress: activeTrip.pickupAddress,
            customerAddress: customerDisplay,
            shippingFee: activeTrip.fare,
            distance: activeTrip.distanceKm || 0,
            status: activeTrip.status
        };
    };

    const renderContent = () => {
        const orderData = getFormattedOrderData();

        switch (pageState) {
            case 'waiting':
                return (
                    <div className="text-center py-24 px-4 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <div className="relative mx-auto h-24 w-24 mb-6">
                            <div className="absolute inset-0 bg-orange-100 rounded-full animate-ping opacity-25"></div>
                            <div className="relative h-24 w-24 bg-orange-50 rounded-full flex items-center justify-center">
                                <ClockIcon className="h-12 w-12 text-orange-500" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900">Bạn đang Online</h3>
                        <p className="text-gray-500 mt-2 font-medium">Hệ thống đang tìm kiếm đơn hàng phù hợp...</p>
                        <div className="mt-8 flex items-center justify-center space-x-2 text-xs font-bold text-green-600 bg-green-50 px-4 py-2 rounded-full w-fit mx-auto">
                            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span>SẴN SÀNG NHẬN ĐƠN</span>
                        </div>
                    </div>
                );
            case 'new-order':
                return orderData && (
                    <NewOrderAlert
                        order={orderData}
                        timeLeft={timeLeft}
                        onAccept={handleAccept}
                        onDecline={handleDecline}
                    />
                );
            case 'delivery-in-progress':
                return orderData && (
                     <DeliveryInProgress
                        order={orderData}
                        onPickup={handlePickup}
                        onCompleteDelivery={handleCompleteDelivery}
                    />
                );
            default:
                return null;
        }
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 relative">
            {isActionLoading && (
                <div className="fixed inset-0 bg-white/50 backdrop-blur-[1px] z-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
                </div>
            )}
            
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Điều phối Đơn hàng</h1>
                {driverId && (
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        ID: DRIVER_{driverId.padStart(5, '0')}
                    </div>
                )}
            </div>
            {renderContent()}
        </div>
    );
};

export default ShipperOrdersPage;
