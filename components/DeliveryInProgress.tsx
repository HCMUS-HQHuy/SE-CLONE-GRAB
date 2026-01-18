
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
  onPickup: () => Promise<void>;
  onCompleteDelivery: () => Promise<void>;
};

type DeliveryStatus = 'picking_up' | 'delivering';

const DeliveryInProgress: React.FC<DeliveryInProgressProps> = ({ order, onPickup, onCompleteDelivery }) => {
    const [status, setStatus] = useState<DeliveryStatus>('picking_up');
    const [isLoading, setIsLoading] = useState(false);

    const handlePickupAction = async () => {
        setIsLoading(true);
        try {
            await onPickup();
            setStatus('delivering');
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCompleteAction = async () => {
        setIsLoading(true);
        try {
            await onCompleteDelivery();
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Đang giao đơn hàng {order.id}</h2>
            <p className="text-gray-500 mb-6">
                {status === 'picking_up' 
                    ? 'Bạn đang trên đường đến nhà hàng để lấy món.' 
                    : 'Món ăn đã được lấy! Vui lòng giao đến địa chỉ của khách hàng.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Map placeholder and addresses */}
                <div>
                    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 mb-6 border border-dashed border-gray-400">
                        <div className="text-center">
                             <LocationMarkerIcon className="h-10 w-10 mx-auto text-gray-400 mb-2 animate-bounce" />
                             <p className="text-sm font-medium">Bản đồ đang tải...</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className={`flex items-start transition-opacity ${status === 'delivering' ? 'opacity-50' : 'opacity-100'}`}>
                            <div className={`mt-1 mr-4 flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${status === 'picking_up' ? 'bg-red-100 animate-pulse' : 'bg-gray-100'}`}>
                                <LocationMarkerIcon className={`h-5 w-5 ${status === 'picking_up' ? 'text-red-600' : 'text-gray-400'}`}/>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Điểm lấy hàng</p>
                                <p className="font-semibold text-gray-800">{order.restaurantName}</p>
                                <p className="text-sm text-gray-600">{order.restaurantAddress}</p>
                            </div>
                        </div>
                        
                        <div className="h-8 w-px bg-gray-200 ml-4"></div>
                        
                        <div className={`flex items-start transition-opacity ${status === 'picking_up' ? 'opacity-50' : 'opacity-100'}`}>
                             <div className={`mt-1 mr-4 flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${status === 'delivering' ? 'bg-blue-100 animate-pulse' : 'bg-gray-100'}`}>
                                <HomeIcon className={`h-5 w-5 ${status === 'delivering' ? 'text-blue-600' : 'text-gray-400'}`}/>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Điểm giao hàng</p>
                                <p className="font-semibold text-gray-800">Khách hàng</p>
                                <p className="text-sm text-gray-600">{order.customerAddress}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Actions and Info */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <h3 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-tight">Quy trình giao hàng</h3>
                    
                    {status === 'picking_up' && (
                        <div className="space-y-4">
                            <button
                                onClick={handlePickupAction}
                                disabled={isLoading}
                                className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isLoading ? 'Đang cập nhật...' : 'XÁC NHẬN ĐÃ LẤY HÀNG'}
                            </button>
                             <button className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                                <PhoneIcon className="h-5 w-5 mr-2" />
                                Gọi cho nhà hàng
                            </button>
                        </div>
                    )}

                    {status === 'delivering' && (
                        <div className="space-y-4">
                            <button
                                onClick={handleCompleteAction}
                                disabled={isLoading}
                                className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isLoading ? 'Đang cập nhật...' : <><CheckCircleIcon className="h-5 w-5 mr-2" /> XÁC NHẬN ĐÃ GIAO HÀNG</>}
                            </button>
                            <button className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                                <PhoneIcon className="h-5 w-5 mr-2" />
                                Gọi cho khách hàng
                            </button>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-xs text-gray-400 italic text-center">
                            Lưu ý: Mọi thay đổi trạng thái sẽ được thông báo ngay lập tức cho Khách hàng và Nhà hàng.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryInProgress;
