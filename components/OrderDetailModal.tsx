
import React from 'react';
import { XIcon, ClockIcon, HomeIcon, UserIcon, TagIcon } from './Icons';
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
      className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="relative bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-8">
            <div>
                <h2 className="text-2xl font-black text-orange-600 tracking-tight">
                    Đơn hàng #{order.id.substring(0, 8).toUpperCase()}
                </h2>
                <div className="text-xs text-gray-400 mt-1.5 flex items-center font-bold uppercase tracking-wider">
                    <ClockIcon className="h-4 w-4 mr-1.5 text-gray-300" />
                    <span>Đặt lúc: {formatDateTime(order.createdAt)}</span>
                </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-300 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-all"
            >
              <XIcon className="h-6 w-6" />
            </button>
        </div>
        
        <div className="space-y-8">
            {/* Customer Info */}
            <div className="bg-gray-50/80 p-6 rounded-[2rem] border border-gray-100">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Thông tin khách hàng</h3>
                <div className="space-y-4">
                    <div className="flex items-center group">
                        <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center mr-4 shadow-sm border border-gray-100 text-gray-400 group-hover:text-orange-500 transition-colors">
                            <UserIcon className="h-5 w-5"/>
                        </div>
                        <span className="font-bold text-gray-800 text-lg">{order.customerName}</span>
                    </div>
                    <div className="flex items-start group">
                        <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center mr-4 shadow-sm border border-gray-100 text-gray-400 group-hover:text-orange-500 transition-colors flex-shrink-0">
                            <HomeIcon className="h-5 w-5 mt-0.5"/>
                        </div>
                        <span className="text-gray-600 font-medium leading-relaxed pt-1.5">{order.address}</span>
                    </div>
                </div>
            </div>

            {/* Order Items */}
            <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-2">Danh sách món ăn</h3>
                <div className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm">
                    <ul className="divide-y divide-gray-50">
                        {order.items.map((item, index) => (
                            <li key={index} className="flex justify-between items-center p-4 text-sm hover:bg-gray-50 transition-colors">
                                <div className="flex items-center">
                                    <span className="h-7 w-7 bg-orange-50 text-orange-600 font-black flex items-center justify-center rounded-lg mr-4 text-xs">
                                        {item.quantity}
                                    </span>
                                    <span className="text-gray-800 font-bold text-base">{item.name}</span>
                                </div>
                                <span className="font-black text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            
            {/* Payment Summary */}
            <div className="bg-orange-50/50 p-6 rounded-[2rem] border border-orange-100">
                 <h3 className="text-xs font-black text-orange-400 uppercase tracking-widest mb-4">Chi tiết thanh toán</h3>
                 <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">Tạm tính</span>
                        <span className="font-bold text-gray-800">{formatCurrency(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">Phí giao hàng</span>
                        <span className="font-bold text-gray-800">{formatCurrency(order.deliveryFee)}</span>
                    </div>
                    {order.discount > 0 && (
                        <div className="flex justify-between text-sm text-green-600 font-black">
                            <span className="flex items-center"><TagIcon className="h-4 w-4 mr-1.5" /> Giảm giá</span>
                            <span>-{formatCurrency(order.discount)}</span>
                        </div>
                    )}
                     <div className="flex justify-between text-2xl font-black border-t border-orange-200/50 pt-4 mt-4">
                      <span className="text-gray-900">TỔNG CỘNG</span>
                      <span className="text-orange-600">{formatCurrency(order.total)}</span>
                    </div>
                </div>
            </div>

             {/* Status */}
            <div className="flex items-center justify-between px-2">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Trạng thái</span>
                <span className={`text-sm font-black px-5 py-2 rounded-2xl border uppercase tracking-tight ${getStatusStyles(order.status)}`}>
                    {order.status}
                </span>
            </div>
        </div>

        <div className="mt-10 flex justify-end">
            <button 
                type="button" 
                onClick={onClose}
                className="w-full bg-gray-900 text-white py-4 rounded-[1.5rem] font-black text-lg hover:bg-gray-800 transition-all active:scale-[0.98] shadow-xl shadow-gray-200"
            >
                ĐÓNG CHI TIẾT
            </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
