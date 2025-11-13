import React, { useState, useEffect } from 'react';
import NewOrderAlert from '../components/NewOrderAlert';
import DeliveryInProgress from '../components/DeliveryInProgress';
import { ClockIcon } from '../components/Icons';

// Mock order data based on the use case
const mockNewOrder = {
  id: '#67890',
  restaurantName: 'Quán Ăn Gỗ',
  restaurantAddress: '123 Đường Lê Lợi, Quận 1, TP.HCM',
  customerAddress: '456 Nguyễn Huệ, Quận 1, TP.HCM',
  shippingFee: 25000,
  distance: 3.2, // in km
};

type PageState = 'waiting' | 'new-order' | 'delivery-in-progress';

const ShipperOrdersPage: React.FC = () => {
    const [pageState, setPageState] = useState<PageState>('waiting');
    const [timeLeft, setTimeLeft] = useState(30);

    // Simulate receiving a new order after a delay
    useEffect(() => {
        if (pageState === 'waiting') {
            const timer = setTimeout(() => {
                setPageState('new-order');
                setTimeLeft(30);
            }, 5000); // New order appears after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [pageState]);

    // Countdown timer for the new order alert
    useEffect(() => {
        if (pageState === 'new-order' && timeLeft > 0) {
            const timer = setTimeout(() => {
                setTimeLeft(prevTime => prevTime - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (pageState === 'new-order' && timeLeft === 0) {
            // Time's up, automatically decline (TX02-Alt-2)
            handleDecline();
        }
    }, [pageState, timeLeft]);

    const handleAccept = () => {
        setPageState('delivery-in-progress');
    };

    const handleDecline = () => {
        // TX02-Alt-1: Shipper declines
        setPageState('waiting');
    };

    const handleCompleteDelivery = () => {
        alert('Giao hàng thành công!');
        setPageState('waiting');
    };


    const renderContent = () => {
        switch (pageState) {
            case 'waiting':
                return (
                    <div className="text-center py-16 px-4 bg-white rounded-lg shadow-sm border">
                        <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-pulse" />
                        <h3 className="text-xl font-semibold text-gray-800">Bạn đang Online</h3>
                        <p className="text-gray-500 mt-2">Đang chờ đơn hàng mới...</p>
                    </div>
                );
            case 'new-order':
                return (
                    <NewOrderAlert
                        order={mockNewOrder}
                        timeLeft={timeLeft}
                        onAccept={handleAccept}
                        onDecline={handleDecline}
                    />
                );
            case 'delivery-in-progress':
                return (
                     <DeliveryInProgress
                        order={mockNewOrder}
                        onCompleteDelivery={handleCompleteDelivery}
                    />
                );
            default:
                return null;
        }
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Đơn hàng</h1>
            {renderContent()}
        </div>
    );
};

export default ShipperOrdersPage;
