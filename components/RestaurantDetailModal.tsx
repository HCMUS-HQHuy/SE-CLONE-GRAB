
import React from 'react';
import { XIcon, ClockIcon, PhoneIcon, HomeIcon, UserIcon, DocumentTextIcon, CheckBadgeIcon } from './Icons';
import { RestaurantListItem } from '../services/restaurantApi';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    restaurant: RestaurantListItem;
};

const BASE_IMG_URL = 'http://localhost:8004/';

const RestaurantDetailModal: React.FC<Props> = ({ isOpen, onClose, restaurant }) => {
    if (!isOpen) return null;

    const ImagePreview: React.FC<{ label: string, path: string }> = ({ label, path }) => (
        <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">{label}</p>
            <div className="border rounded-lg overflow-hidden bg-gray-100 aspect-video flex items-center justify-center">
                {path ? (
                    <img 
                        src={`${BASE_IMG_URL}${path}`} 
                        alt={label} 
                        className="w-full h-full object-contain cursor-zoom-in hover:scale-105 transition-transform" 
                        onClick={() => window.open(`${BASE_IMG_URL}${path}`, '_blank')}
                    />
                ) : (
                    <span className="text-gray-400 italic text-sm">Không có ảnh</span>
                )}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{restaurant.name}</h2>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold mr-3 border ${
                                restaurant.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-green-100 text-green-800 border-green-200'
                            }`}>
                                {restaurant.status}
                            </span>
                            <span>Ngày đăng ký: {new Date(restaurant.created_at).toLocaleDateString('vi-VN')}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <XIcon className="h-6 w-6 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto flex-grow space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Section 1: Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-orange-600 flex items-center">
                                <DocumentTextIcon className="h-5 w-5 mr-2"/> Thông tin cơ bản
                            </h3>
                            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-start">
                                    <UserIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-500">Mã chủ sở hữu (Owner ID)</p>
                                        <p className="font-medium">{restaurant.owner_id}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <PhoneIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-500">Số điện thoại</p>
                                        <p className="font-medium">{restaurant.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <HomeIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-500">Địa chỉ kinh doanh</p>
                                        <p className="font-medium">{restaurant.address}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <ClockIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-500">Giờ hoạt động</p>
                                        <p className="font-medium">{restaurant.opening_hours}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <p className="text-sm font-medium text-gray-700 mb-1">Mô tả quán:</p>
                                <p className="text-gray-600 text-sm leading-relaxed">{restaurant.description || 'Chưa có mô tả.'}</p>
                            </div>
                        </div>

                        {/* Section 2: Legal Documents */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-orange-600 flex items-center">
                                <CheckBadgeIcon className="h-5 w-5 mr-2"/> Hồ sơ pháp lý
                            </h3>
                            <ImagePreview label="Giấy phép kinh doanh" path={restaurant.business_license_image} />
                            <ImagePreview label="Giấy chứng nhận ATVSTP" path={restaurant.food_safety_certificate_image} />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-8 py-2.5 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-900 transition-colors"
                    >
                        Đóng cửa sổ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RestaurantDetailModal;
