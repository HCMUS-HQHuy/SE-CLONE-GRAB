
import React from 'react';
import { XIcon, ClockIcon, HomeIcon, UserIcon, PhoneIcon, CheckBadgeIcon } from './Icons';
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
      className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
            <div>
                <h2 className="text-lg font-semibold text-gray-800 tracking-tight">
                    Đơn hàng <span className="text-orange-500">#{order.id.substring(0, 8).toUpperCase()}</span>
                </h2>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 flex items-center">
                    <ClockIcon className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
                    <span>Đặt lúc: {formatDateTime(order.createdAt)}</span>
                </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white rounded-lg transition-colors text-gray-400 border border-transparent hover:border-gray-100"
            >
              <XIcon className="h-5 w-5" />
            </button>
        </div>
        
        {/* Content */}
        <div className="p-8 overflow-y-auto flex-grow space-y-8 bg-white">
            {/* Status Section */}
            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Trạng thái</span>
                <span className={`text-[10px] font-semibold px-3 py-1 rounded-md border uppercase tracking-tight ${getStatusStyles(order.status)}`}>
                    {order.status}
                </span>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-1 gap-6">
                <div>
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Người nhận</h3>
                    <div className="flex items-center bg-gray-50/30 p-3 rounded-xl border border-gray-50">
                        <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center mr-4 text-orange-500 border border-orange-100">
                            <UserIcon className="h-4 w-4"/>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">{order.customerName}</p>
                            <p className="text-[10px] text-gray-400 font-medium">Khách hàng</p>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Giao đến</h3>
                    <div className="flex items-start bg-gray-50/30 p-3 rounded-xl border border-gray-50">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mr-4 text-blue-500 border border-blue-100 flex-shrink-0">
                            <HomeIcon className="h-4 w-4"/>
                        </div>
                        <div className="pt-0.5">
                            <p className="text-sm font-medium text-gray-800 leading-snug">{order.address}</p>
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5 uppercase tracking-wide">Địa chỉ nhận hàng</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Items List */}
            <div>
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Danh sách món</h3>
                <div className="bg-gray-50/30 rounded-xl border border-gray-50 overflow-hidden">
                    <ul className="divide-y divide-gray-50">
                        {order.items.map((item, index) => (
                            <li key={index} className="flex justify-between items-center p-4 text-sm hover:bg-white transition-colors">
                                <div className="flex items-center">
                                    <span className="h-6 w-6 rounded bg-orange-50 text-orange-600 font-bold flex items-center justify-center mr-3 text-[10px] border border-orange-100">
                                        {item.quantity}x
                                    </span>
                                    <span className="text-gray-700 font-medium">{item.name}</span>
                                </div>
                                <span className="font-semibold text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            
            {/* Summary */}
            <div className="pt-6 border-t border-dashed border-gray-200">
                 <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
                        <span>Giá trị món ăn</span>
                        <span className="text-gray-700">{formatCurrency(order.total)}</span>
                    </div>
                     <div className="flex justify-between text-xl font-semibold text-gray-800 tracking-tighter pt-2 px-1">
                      <span className="text-sm font-medium text-gray-500 uppercase tracking-widest mt-1">Tổng cộng</span>
                      <span className="text-orange-600">{formatCurrency(order.total)}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-50 bg-gray-50/30 flex justify-end">
            <button 
                type="button" 
                onClick={onClose}
                className="px-8 py-2.5 bg-gray-900 text-white font-semibold text-xs rounded-lg hover:bg-black transition-all shadow-md active:scale-95 uppercase tracking-widest"
            >
                Đóng
            </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
