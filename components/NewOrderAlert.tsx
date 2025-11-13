import React from 'react';
import { LocationMarkerIcon, MotorcycleIcon, CashIcon, CheckCircleIcon, XCircleIcon } from './Icons';

type OrderInfo = {
  id: string;
  restaurantName: string;
  restaurantAddress: string;
  customerAddress: string;
  shippingFee: number;
  distance: number;
};

type NewOrderAlertProps = {
  order: OrderInfo;
  timeLeft: number;
  onAccept: () => void;
  onDecline: () => void;
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const NewOrderAlert: React.FC<NewOrderAlertProps> = ({ order, timeLeft, onAccept, onDecline }) => {
    const progressPercentage = (timeLeft / 30) * 100;

    return (
        <div className="bg-white p-6 rounded-lg shadow-xl border-2 border-orange-400 max-w-2xl mx-auto">
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Đơn hàng mới!</h2>
                <p className="text-gray-500">Bạn có một đơn hàng mới cần được giao.</p>
            </div>

            <div className="space-y-4 my-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start">
                    <LocationMarkerIcon className="h-5 w-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
                    <div>
                        <p className="text-xs text-gray-500">Điểm lấy hàng</p>
                        <p className="font-semibold text-gray-800">{order.restaurantName}</p>
                        <p className="text-sm text-gray-600">{order.restaurantAddress}</p>
                    </div>
                </div>
                <div className="flex items-start">
                    <LocationMarkerIcon className="h-5 w-5 text-blue-500 mr-3 mt-1 flex-shrink-0" />
                    <div>
                        <p className="text-xs text-gray-500">Điểm giao hàng</p>
                        <p className="font-semibold text-gray-800">Khách hàng</p>
                        <p className="text-sm text-gray-600">{order.customerAddress}</p>
                    </div>
                </div>
                 <div className="flex justify-between pt-3 border-t">
                     <div className="flex items-center text-sm">
                        <MotorcycleIcon className="h-5 w-5 text-gray-500 mr-2" />
                        <p>Quãng đường: <span className="font-semibold">{order.distance} km</span></p>
                     </div>
                     <div className="flex items-center text-sm">
                        <CashIcon className="h-5 w-5 text-green-500 mr-2" />
                        <p>Cước phí: <span className="font-semibold">{formatCurrency(order.shippingFee)}</span></p>
                     </div>
                 </div>
            </div>

            <div className="text-center mb-6">
                 <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div
                        className="bg-orange-500 h-2.5 rounded-full transition-all duration-1000 linear"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
                <p className="text-lg font-bold text-orange-600">{timeLeft}s</p>
                <p className="text-xs text-gray-500">để chấp nhận đơn hàng</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={onDecline}
                    className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                >
                    <XCircleIcon className="h-5 w-5 mr-2" />
                    Từ chối
                </button>
                <button
                    onClick={onAccept}
                    className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Chấp nhận
                </button>
            </div>
        </div>
    );
};

export default NewOrderAlert;
