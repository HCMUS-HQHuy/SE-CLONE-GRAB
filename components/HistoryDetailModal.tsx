import React from 'react';
import { XIcon, HomeIcon, UserIcon, StarIcon, CashIcon, ClipboardListIcon } from './Icons';
import { DeliveryHistory } from '../pages/ShipperHistoryPage';

type HistoryDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  order: DeliveryHistory;
};

const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const time = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const day = date.toLocaleDateString('vi-VN');
    return `${time}, ${day}`;
};

const HistoryDetailModal: React.FC<HistoryDetailModalProps> = ({ isOpen, onClose, order }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog" aria-modal="true" aria-labelledby="history-detail-title"
    >
      <div 
        className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start border-b pb-4 mb-6">
            <div>
                <h2 id="history-detail-title" className="text-xl font-bold text-orange-600">
                    Chi tiết chuyến đi {order.id}
                </h2>
                <p className="text-sm text-gray-500 mt-1">Hoàn thành lúc: {formatDateTime(order.date)}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
              <XIcon className="h-6 w-6" />
            </button>
        </div>
        
        <div className="space-y-6">
            {/* Location Info */}
            <div>
                <div className="flex items-start mb-3">
                    <div className="mt-1 mr-4 flex-shrink-0 h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                        <ClipboardListIcon className="h-5 w-5 text-red-600"/>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800">{order.restaurantName}</p>
                        <p className="text-sm text-gray-600">{order.restaurantAddress}</p>
                    </div>
                </div>
                 <div className="flex items-start">
                    <div className="mt-1 mr-4 flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <HomeIcon className="h-5 w-5 text-blue-600"/>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800">{order.customerName}</p>
                        <p className="text-sm text-gray-600">{order.customerAddress}</p>
                    </div>
                </div>
            </div>

            {/* Earnings Detail */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <CashIcon className="h-5 w-5 mr-2 text-green-600"/>
                    Chi tiết thu nhập
                </h3>
                <div className="space-y-2 text-sm border-t pt-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Phí giao hàng</span>
                        <span className="font-medium text-gray-800">{formatCurrency(order.earningsDetail.deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Thưởng</span>
                        <span className="font-medium text-gray-800">{formatCurrency(order.earningsDetail.bonus)}</span>
                    </div>
                     <div className="flex justify-between text-base font-bold border-t pt-2 mt-2">
                      <span className="text-gray-900">Tổng cộng</span>
                      <span className="text-green-600">{formatCurrency(order.earnings)}</span>
                    </div>
                </div>
            </div>

            {/* Customer Review */}
            {order.review ? (
                <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Đánh giá từ khách hàng</h3>
                     <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                             <p className="text-sm font-semibold text-blue-900">Đánh giá</p>
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <StarIcon key={i} className={`w-4 h-4 ${i < (order.review?.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} />
                                ))}
                            </div>
                        </div>
                        <p className="text-sm text-gray-700 italic">"{order.review.comment}"</p>
                    </div>
                </div>
            ) : (
                order.status === 'Hoàn thành' && (
                    <div className="text-center text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
                        Chuyến đi này chưa có đánh giá.
                    </div>
                )
            )}
        </div>

        <div className="mt-8 pt-5 border-t flex justify-end">
            <button 
                type="button" 
                onClick={onClose}
                className="bg-orange-500 py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-orange-600 focus:outline-none"
            >
                Đóng
            </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryDetailModal;
