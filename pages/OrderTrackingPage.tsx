import React, { useState, useEffect } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { Restaurant, FoodItem } from './HomePage';
import { HomeIcon, LocationMarkerIcon, MotorcycleIcon, ClockIcon, CheckCircleIcon } from '../components/Icons';
import ReviewModal from '../components/ReviewModal';
import DriverReviewModal from '../components/DriverReviewModal';

type CartItem = FoodItem & { quantity: number };
type PaymentMethod = 'cash' | 'bank_transfer';

type OrderState = {
  restaurant: Restaurant;
  items: CartItem[];
  total: number;
  paymentMethod: PaymentMethod;
};

const allStatuses = [
  { text: 'Chờ thanh toán', progress: 0 },
  { text: 'Chờ xác nhận', progress: 5 },
  { text: 'Đang chuẩn bị', progress: 10 },
  { text: 'Tài xế đang đến quán', progress: 30 },
  { text: 'Tài xế đã lấy hàng', progress: 50 },
  { text: 'Đang giao đến bạn', progress: 80 },
  { text: 'Giao hàng thành công!', progress: 100 }
];

const driverInfo = {
    name: 'Trần Văn An',
    avatar: 'https://i.pravatar.cc/150?u=driver'
};

const OrderTrackingPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const { restaurant, items, total, paymentMethod } = (location.state as OrderState) || {};
  
  const getInitialStatusIndex = () => {
    if (paymentMethod === 'bank_transfer') {
      const paymentStatus = localStorage.getItem(`payment_status_${orderId}`);
      if (paymentStatus === 'submitted') return 1; // Chờ xác nhận
      return 0; // Chờ thanh toán
    }
    return 2; // Đang chuẩn bị (for cash)
  };

  const [currentStatusIndex, setCurrentStatusIndex] = useState(getInitialStatusIndex());
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isDriverReviewModalOpen, setIsDriverReviewModalOpen] = useState(false);
  const [driverReviewSubmitted, setDriverReviewSubmitted] = useState(false);

  // Effect to simulate payment confirmation and delivery progress
  useEffect(() => {
    // If waiting for confirmation, simulate it
    if (currentStatusIndex === 1) { // "Chờ xác nhận"
      const confirmationTimer = setTimeout(() => {
        setCurrentStatusIndex(2); // Move to "Đang chuẩn bị"
      }, 4000); // Simulate 4s confirmation time
      return () => clearTimeout(confirmationTimer);
    }
    
    // Once order prep starts, simulate delivery progress
    if (currentStatusIndex >= 2 && currentStatusIndex < allStatuses.length - 1) {
      const interval = setInterval(() => {
        setCurrentStatusIndex(prevIndex => {
          if (prevIndex < allStatuses.length - 1) {
            return prevIndex + 1;
          }
          clearInterval(interval);
          return prevIndex;
        });
      }, 3000); // 3 seconds per step
      return () => clearInterval(interval);
    }
  }, [currentStatusIndex]);

  // Listen for localStorage changes from BankTransferPage
  useEffect(() => {
    const handleStorageChange = () => {
      const paymentStatus = localStorage.getItem(`payment_status_${orderId}`);
      if (paymentStatus === 'submitted' && currentStatusIndex === 0) {
        setCurrentStatusIndex(1); // Move to "Chờ xác nhận"
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [orderId, currentStatusIndex]);


  if (!restaurant || !items) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-gray-800">Không tìm thấy đơn hàng</h1>
        <Link to="/user/home" className="mt-6 inline-block bg-orange-500 text-white font-bold py-2 px-4 rounded hover:bg-orange-600 transition-colors">
            Trở về trang chủ
        </Link>
      </div>
    );
  }
  
  const handleReviewSubmit = (reviewData: { rating: number; comment: string; images: string[] }) => {
    localStorage.setItem('newReview', JSON.stringify({
        ...reviewData,
        restaurantId: restaurant.id,
        date: new Date().toLocaleDateString('vi-VN')
    }));
    setReviewSubmitted(true);
    setIsReviewModalOpen(false);
  };

  const handleDriverReviewSubmit = (reviewData: { rating: number; comment: string; tags: string[] }) => {
    localStorage.setItem('newDriverReview', JSON.stringify({
        ...reviewData,
        author: 'Bạn',
        date: new Date().toLocaleDateString('vi-VN')
    }));
    setDriverReviewSubmitted(true);
    setIsDriverReviewModalOpen(false);
  };

  const currentStatus = allStatuses[currentStatusIndex];
  const shipperProgress = currentStatus.progress > 30 ? (currentStatus.progress - 30) / (100 - 30) * 100 : 0;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };
  
  const renderPostDeliveryActions = () => {
    if (currentStatus.progress < 100) return null;

    return (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviewSubmitted ? (
                 <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center flex flex-col justify-center">
                    <CheckCircleIcon className="h-10 w-10 text-green-500 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-green-800">Cảm ơn đã đánh giá nhà hàng!</h3>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <h3 className="text-xl font-semibold text-gray-800">Đánh giá nhà hàng</h3>
                    <p className="text-gray-600 mt-2">Chia sẻ cảm nhận của bạn về <span className="font-bold">{restaurant.name}</span>.</p>
                    <button onClick={() => setIsReviewModalOpen(true)} className="mt-4 inline-block bg-orange-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-600 transition-colors">
                        Viết đánh giá
                    </button>
                </div>
            )}
            {driverReviewSubmitted ? (
                <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center flex flex-col justify-center">
                    <CheckCircleIcon className="h-10 w-10 text-green-500 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-green-800">Cảm ơn đã đánh giá tài xế!</h3>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <h3 className="text-xl font-semibold text-gray-800">Đánh giá tài xế</h3>
                    <p className="text-gray-600 mt-2">Tài xế <span className="font-bold">{driverInfo.name}</span> đã phục vụ bạn thế nào?</p>
                    <button onClick={() => setIsDriverReviewModalOpen(true)} className="mt-4 inline-block bg-orange-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-600 transition-colors">
                        Viết đánh giá
                    </button>
                </div>
            )}
        </div>
    )
  }

  return (
    <>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mã đơn hàng: #{orderId}</h1>
          <p className="text-lg text-gray-600 mt-2">{currentStatus.text}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Hành trình đơn hàng</h2>
              {currentStatusIndex >= 2 && (
                <div className="relative w-full h-80 bg-gray-200 rounded-lg overflow-hidden my-6">
                    <div className="absolute top-1/2 left-[15%] w-[70%] h-1 bg-gray-400 border-t-2 border-dashed border-gray-500"></div>
                    <div className="absolute top-1/2 left-[15%] -translate-y-1/2 text-center">
                        <div className="bg-white p-2 rounded-full shadow-lg"><LocationMarkerIcon className="h-8 w-8 text-red-500" /></div>
                        <p className="text-xs font-semibold mt-2 whitespace-nowrap">{restaurant.name}</p>
                    </div>
                    <div className="absolute top-1/2 right-[15%] -translate-y-1/2 text-center">
                        <div className="bg-white p-2 rounded-full shadow-lg"><HomeIcon className="h-8 w-8 text-blue-500" /></div>
                        <p className="text-xs font-semibold mt-2">Nhà bạn</p>
                    </div>
                    {currentStatus.progress > 30 && (
                        <div className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-linear" style={{ left: `calc(15% + ${shipperProgress * 0.7}%)` }}>
                            <div className="bg-orange-500 p-2 rounded-full shadow-lg animate-pulse"><MotorcycleIcon className="h-8 w-8 text-white" /></div>
                        </div>
                    )}
                </div>
              )}
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                  <div className="bg-orange-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${currentStatus.progress}%` }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                  <span>Xác nhận</span>
                  <span>Đang giao</span>
                  <span>Hoàn thành</span>
              </div>
              <div className="mt-6 border-t pt-4">
                  <div className="flex items-center text-lg">
                      <ClockIcon className="h-6 w-6 text-gray-500 mr-3"/>
                      <span>Thời gian dự kiến nhận hàng:</span>
                      <span className="font-bold text-orange-600 ml-2">~15-20 phút</span>
                  </div>
              </div>
          </div>

          <div className="space-y-6">
              {currentStatusIndex >=2 && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">Tài xế</h3>
                  <div className="flex items-center space-x-4">
                      <img className="h-14 w-14 rounded-full object-cover" src={driverInfo.avatar} alt="Shipper"/>
                      <div>
                          <p className="font-semibold text-gray-800">{driverInfo.name}</p>
                          <p className="text-sm text-gray-500">BS: 59-T1 123.45</p>
                      </div>
                  </div>
              </div>
              )}
              <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">Chi tiết đơn hàng</h3>
                  <div className="space-y-2">
                      {items.map(item => (
                          <div key={item.id} className="flex justify-between items-center text-sm">
                            <span>{item.quantity}x {item.name}</span>
                            <span className="text-gray-600">{formatCurrency(parseFloat((item.newPrice || item.price || '0').replace(/\D/g, '')) * item.quantity)}</span>
                          </div>
                      ))}
                  </div>
                  <div className="border-t mt-4 pt-4">
                      <div className="flex justify-between font-bold text-lg">
                          <span>Tổng cộng</span>
                          <span className="text-orange-600">{formatCurrency(total)}</span>
                      </div>
                  </div>
              </div>
          </div>
        </div>
        {renderPostDeliveryActions()}
      </div>
      <ReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmit={handleReviewSubmit}
        orderId={orderId!}
        restaurantName={restaurant.name}
      />
      <DriverReviewModal
        isOpen={isDriverReviewModalOpen}
        onClose={() => setIsDriverReviewModalOpen(false)}
        onSubmit={handleDriverReviewSubmit}
        driverName={driverInfo.name}
        driverAvatar={driverInfo.avatar}
      />
    </>
  );
};

export default OrderTrackingPage;