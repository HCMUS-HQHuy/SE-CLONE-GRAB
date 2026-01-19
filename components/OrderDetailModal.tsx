import React from 'react';
import { XIcon, ClockIcon, HomeIcon, UserIcon } from './Icons';
import { Order, getStatusStyles, formatCurrency, formatDateTime } from '../pages/RestaurantOrdersPage';

type OrderDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
};

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ isOpen, onClose, order }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-detail-title"
    >
      <div 
        className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start border-b pb-4 mb-6">
            <div>
                <h2 id="order-detail-title" className="text-xl font-bold text-orange-600">
                    Chi tiết đơn hàng {order.id}
                </h2>
                <div className="text-xs text-gray-500 mt-2 flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1.5" />
                    <span>Đặt lúc: {formatDateTime(order.createdAt)}</span>
                </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors duration-300"
              aria-label="Close"
            >
              <XIcon className="h-6 w-6" />
            </button>
        </div>
        
        <div className="space-y-6">
            {/* Customer Info */}
            <div>
                <h3 className="font-semibold text-gray-800 mb-3">Thông tin khách hàng</h3>
                <div className="text-sm space-y-2 text-gray-600">
                    <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-3 text-gray-400"/>
                        <span>{order.customerName}</span>
                    </div>
                    <div className="flex items-start">
                        <HomeIcon className="h-4 w-4 mr-3 mt-0.5 text-gray-400"/>
                        <span>{order.address}</span>
                    </div>
                </div>
            </div>

            {/* Order Items */}
            <div>
                <h3 className="font-semibold text-gray-800 mb-3">Danh sách món ăn</h3>
                <div className="border rounded-md">
                    <ul className="divide-y">
                        {order.items.map((item, index) => (
                            <li key={index} className="flex justify-between items-center p-3 text-sm">
                                <div className="flex items-center">
                                    <span className="font-bold text-orange-500 mr-3">{item.quantity}x</span>
                                    <span className="text-gray-800">{item.name}</span>
                                </div>
                                <span className="text-gray-600">{formatCurrency(item.price * item.quantity)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            
            {/* Payment Summary */}
            <div>
                 <h3 className="font-semibold text-gray-800 mb-3">Tổng thanh toán</h3>
                 <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Tổng tiền món</span>
                        <span className="font-medium text-gray-800">{formatCurrency(order.total)}</span>
                    </div>
                     <div className="flex justify-between text-base font-bold border-t pt-2 mt-2">
                      <span className="text-gray-900">Thanh toán</span>
                      <span className="text-orange-600">{formatCurrency(order.total)}</span>
                    </div>
                </div>
            </div>

             {/* Status */}
            <div>
                <h3 className="font-semibold text-gray-800 mb-2">Trạng thái</h3>
                <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${getStatusStyles(order.status)}`}>
                    {order.status}
                </span>
            </div>
        </div>

        <div className="mt-8 pt-5 border-t flex justify-end">
            <button 
                type="button" 
                onClick={onClose}
                className="bg-orange-500 py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
                Đóng
            </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
