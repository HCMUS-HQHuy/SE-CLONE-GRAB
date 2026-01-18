
import React, { useState, useEffect, useRef } from 'react';
import NewOrderAlert from '../components/NewOrderAlert';
import DeliveryInProgress from '../components/DeliveryInProgress';
import { ClockIcon } from '../components/Icons';
import { shipperApiService, TripItem } from '../services/shipperApi';
import { apiService } from '../services/api';

type PageState = 'waiting' | 'new-order' | 'delivery-in-progress';

const ShipperOrdersPage: React.FC = () => {
    const [pageState, setPageState] = useState<PageState>('waiting');
    const [activeTrip, setActiveTrip] = useState<TripItem | null>(null);
    const [timeLeft, setTimeLeft] = useState(30);
    const [driverId, setDriverId] = useState<string | null>(null);
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

    // Cơ chế Polling kiểm tra Trips mới
    useEffect(() => {
        if (!driverId || pageState !== 'waiting') {
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
            return;
        }

        const pollTrips = async () => {
            try {
                // Chỉ lấy các chuyến đi đang hoạt động (Assigned, Accepted, InTransit)
                const data = await shipperApiService.getDriverTrips(driverId, true);
                
                // Tìm chuyến đi có trạng thái "Assigned" (Mới được gán, cần xác nhận)
                const assignedTrip = data.items.find(trip => trip.status === 'Assigned');
                
                if (assignedTrip) {
                    setActiveTrip(assignedTrip);
                    setPageState('new-order');
                    setTimeLeft(30); // Reset timer cho đơn mới
                    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                }
            } catch (err) {
                console.error("Polling Trips Error:", err);
            }
        };

        // Chạy ngay lần đầu và sau đó mỗi 5 giây
        pollTrips();
        pollingIntervalRef.current = setInterval(pollTrips, 5000);

        return () => {
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        };
    }, [driverId, pageState]);

    // Countdown timer cho màn hình nhận đơn
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

    const handleAccept = () => {
        // Trong thực tế sẽ gọi API PUT /api/Trips/{id}/accept
        // Hiện tại giả lập chuyển trạng thái UI
        setPageState('delivery-in-progress');
    };

    const handleDecline = () => {
        // Trong thực tế sẽ gọi API PUT /api/Trips/{id}/decline
        setPageState('waiting');
        setActiveTrip(null);
    };

    const handleCompleteDelivery = () => {
        // Trong thực tế sẽ gọi API PUT /api/Trips/{id}/complete
        alert('Giao hàng thành công!');
        setPageState('waiting');
        setActiveTrip(null);
    };

    // Hàm format thông tin hiển thị từ dữ liệu Trip
    const getFormattedOrderData = () => {
        if (!activeTrip) return null;

        // Bóc tách địa chỉ giao hàng (Tên | SĐT | Địa chỉ)
        const addrParts = activeTrip.deliveryAddress.split('|');
        const customerDisplay = addrParts.length >= 3 ? addrParts[2].trim() : activeTrip.deliveryAddress;

        return {
            id: activeTrip.orderId.substring(0, 8).toUpperCase(),
            restaurantName: "Nhà hàng đối tác", // Trip API chưa trả về tên quán, tạm dùng placeholder hoặc pickupAddress
            restaurantAddress: activeTrip.pickupAddress,
            customerAddress: customerDisplay,
            shippingFee: activeTrip.fare,
            distance: activeTrip.distanceKm || 0,
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
                        <p className="text-gray-500 mt-2 font-medium">Hệ thống đang tìm kiếm đơn hàng phù hợp với vị trí của bạn...</p>
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
                        onCompleteDelivery={handleCompleteDelivery}
                    />
                );
            default:
                return null;
        }
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
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
