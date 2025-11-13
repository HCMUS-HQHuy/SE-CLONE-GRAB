import React, { useState } from 'react';
import { LocationMarkerIcon, HomeIcon, CheckCircleIcon, PhoneIcon } from './Icons';

type OrderInfo = {
  id: string;
  restaurantName: string;
  restaurantAddress: string;
  customerAddress: string;
};

type DeliveryInProgressProps = {
  order: OrderInfo;
  onCompleteDelivery: () => void;
};

type DeliveryStatus = 'picking_up' | 'delivering';

const DeliveryInProgress: React.FC<DeliveryInProgressProps> = ({ order, onCompleteDelivery }) => {
    const [status, setStatus] = useState<DeliveryStatus>('picking_up');

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Đang giao đơn hàng {order.id}</h2>
            <p className="text-gray-500 mb-6">Hãy làm theo hướng dẫn để hoàn thành đơn hàng.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Map placeholder and addresses */}
                <div>
                    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 mb-6">
                        <p>Bản đồ sẽ được hiển thị ở đây</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start">
                            <div className="mt-1 mr-4 flex-shrink-0 h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                                <LocationMarkerIcon className="h-5 w-5 text-red-600"/>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">Lấy hàng tại: {order.restaurantName}</p>
                                <p className="text-sm text-gray-600">{order.restaurantAddress}</p>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-gray-300 ml-5"></div>
                        <div className="flex items-start">
                             <div className="mt-1 mr-4 flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <HomeIcon className="h-5 w-5 text-blue-600"/>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">Giao hàng đến</p>
                                <p className="text-sm text-gray-600">{order.customerAddress}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Actions and Info */}
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Hành động</h3>
                    {status === 'picking_up' && (
                        <div className="space-y-3">
                            <button
                                onClick={() => setStatus('delivering')}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                            >
                                Đã lấy hàng
                            </button>
                             <button className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                <PhoneIcon className="h-5 w-5 mr-2" />
                                Gọi cho nhà hàng
                            </button>
                        </div>
                    )}

                    {status === 'delivering' && (
                        <div className="space-y-3">
                            <button
                                onClick={onCompleteDelivery}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircleIcon className="h-5 w-5 mr-2" />
                                Đã giao hàng
                            </button>
                            <button className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                <PhoneIcon className="h-5 w-5 mr-2" />
                                Gọi cho khách hàng
                            </button>
                        </div>
                    )}

                    <div className="mt-6 border-t pt-4">
                        <p className="text-sm text-gray-500">Nếu có vấn đề gì xảy ra, vui lòng liên hệ tổng đài hỗ trợ.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryInProgress;
