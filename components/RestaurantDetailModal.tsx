
import React from 'react';
import { XIcon, ClockIcon, PhoneIcon, HomeIcon, UserIcon, DocumentTextIcon, CheckBadgeIcon, XCircleIcon } from './Icons';
import { RestaurantListItem } from '../services/restaurantApi';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    restaurant: RestaurantListItem;
    onApprove?: () => void;
    onReject?: () => void;
};

const BASE_IMG_URL = 'http://localhost:8004/';

const RestaurantDetailModal: React.FC<Props> = ({ isOpen, onClose, restaurant, onApprove, onReject }) => {
    if (!isOpen) return null;

    const ImagePreview: React.FC<{ label: string, path: string }> = ({ label, path }) => (
        <div className="space-y-2">
            <div className="flex items-center text-sm font-medium text-gray-700">
                <DocumentTextIcon className="h-4 w-4 mr-1.5 text-orange-500" />
                {label}
            </div>
            <div className="border rounded-lg overflow-hidden bg-gray-100 aspect-video flex items-center justify-center group relative shadow-inner">
                {path ? (
                    <>
                        <img 
                            src={`${BASE_IMG_URL}${path}`} 
                            alt={label} 
                            className="w-full h-full object-contain cursor-zoom-in group-hover:scale-105 transition-transform" 
                            onClick={() => window.open(`${BASE_IMG_URL}${path}`, '_blank')}
                        />
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"></div>
                    </>
                ) : (
                    <span className="text-gray-400 italic text-sm">Không có ảnh</span>
                )}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-200">
                            {restaurant.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{restaurant.name}</h2>
                            <div className="flex items-center text-sm text-gray-500 mt-0.5">
                                <span className={`px-2 py-0.5 rounded-md text-xs font-bold mr-3 border flex items-center ${
                                    restaurant.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-green-50 text-green-700 border-green-200'
                                }`}>
                                    <ClockIcon className="h-3 w-3 mr-1" />
                                    {restaurant.status}
                                </span>
                                <span className="flex items-center"><ClockIcon className="h-3 w-3 mr-1" /> Đăng ký: {new Date(restaurant.created_at).toLocaleDateString('vi-VN')}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors group">
                        <XIcon className="h-6 w-6 text-gray-400 group-hover:text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto flex-grow space-y-8 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Section 1: Basic Info */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center border-l-4 border-orange-500 pl-3">
                                Thông tin đối tác
                            </h3>
                            <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <div className="flex items-start">
                                    <UserIcon className="h-5 w-5 text-orange-400 mr-4 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Mã chủ sở hữu</p>
                                        <p className="font-bold text-gray-800">#{restaurant.owner_id}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <PhoneIcon className="h-5 w-5 text-orange-400 mr-4 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Số điện thoại</p>
                                        <p className="font-bold text-gray-800">{restaurant.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <HomeIcon className="h-5 w-5 text-orange-400 mr-4 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Địa chỉ kinh doanh</p>
                                        <p className="font-bold text-gray-800 leading-snug">{restaurant.address}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <ClockIcon className="h-5 w-5 text-orange-400 mr-4 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Giờ hoạt động</p>
                                        <p className="font-bold text-gray-800">{restaurant.opening_hours}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-5 border border-gray-200 rounded-2xl bg-white shadow-sm">
                                <div className="flex items-center mb-2 text-sm font-bold text-gray-700">
                                    <DocumentTextIcon className="h-4 w-4 mr-2 text-orange-500"/>
                                    Giới thiệu quán
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed italic">
                                    "{restaurant.description || 'Chưa có mô tả chi tiết từ chủ quán.'}"
                                </p>
                            </div>
                        </div>

                        {/* Section 2: Legal Documents */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center border-l-4 border-orange-500 pl-3">
                                Hồ sơ pháp lý
                            </h3>
                            <div className="grid grid-cols-1 gap-6">
                                <ImagePreview label="Giấy phép kinh doanh" path={restaurant.business_license_image} />
                                <ImagePreview label="Giấy chứng nhận ATVSTP" path={restaurant.food_safety_certificate_image} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t bg-gray-50 flex justify-between items-center px-8">
                    <button 
                        onClick={onClose}
                        className="text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors flex items-center"
                    >
                        <XCircleIcon className="h-5 w-5 mr-2" />
                        Đóng
                    </button>
                    
                    <div className="flex space-x-3">
                        {restaurant.status === 'PENDING' ? (
                            <>
                                <button 
                                    onClick={onReject}
                                    className="px-6 py-2.5 bg-white border-2 border-red-500 text-red-500 font-bold rounded-xl hover:bg-red-50 transition-all flex items-center shadow-sm"
                                >
                                    <XCircleIcon className="h-5 w-5 mr-2" />
                                    Từ chối hồ sơ
                                </button>
                                <button 
                                    onClick={onApprove}
                                    className="px-8 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all flex items-center shadow-lg shadow-green-100"
                                >
                                    <CheckBadgeIcon className="h-5 w-5 mr-2" />
                                    Duyệt ngay
                                </button>
                            </>
                        ) : (
                             <button 
                                onClick={onClose}
                                className="px-8 py-2.5 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-900 transition-colors shadow-lg shadow-gray-200"
                            >
                                Quay lại
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantDetailModal;
