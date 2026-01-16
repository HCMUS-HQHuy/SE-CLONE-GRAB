
import React, { useState, useEffect } from 'react';
import { XIcon, ClockIcon, PhoneIcon, HomeIcon, UserIcon, DocumentTextIcon, CheckBadgeIcon, XCircleIcon, ShieldCheckIcon } from './Icons';
import { RestaurantListItem } from '../services/restaurantApi';
import { apiService, AdminUserListItem } from '../services/api';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    restaurant: RestaurantListItem;
    onApprove?: () => void;
    onReject?: () => void;
};

const BASE_IMG_URL = 'http://localhost:8004/';

const RestaurantDetailModal: React.FC<Props> = ({ isOpen, onClose, restaurant, onApprove, onReject }) => {
    const [authData, setAuthData] = useState<AdminUserListItem | null>(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(false);

    useEffect(() => {
        if (isOpen && restaurant.owner_id) {
            fetchAuthStatus();
        }
    }, [isOpen, restaurant.owner_id]);

    const fetchAuthStatus = async () => {
        setIsLoadingAuth(true);
        try {
            const data = await apiService.adminGetUserDetail(restaurant.owner_id);
            setAuthData(data);
        } catch (err) {
            console.error("Failed to fetch auth status", err);
        } finally {
            setIsLoadingAuth(false);
        }
    };

    if (!isOpen) return null;

    const ImagePreview: React.FC<{ label: string, path: string }> = ({ label, path }) => (
        <div className="space-y-2">
            <div className="flex items-center text-sm font-medium text-gray-700">
                <DocumentTextIcon className="h-4 w-4 mr-1.5 text-orange-500" />
                {label}
            </div>
            <div className="border rounded-lg overflow-hidden bg-gray-100 aspect-video flex items-center justify-center group relative shadow-inner">
                {path ? (
                    <img 
                        src={`${BASE_IMG_URL}${path}`} 
                        alt={label} 
                        className="w-full h-full object-contain cursor-zoom-in group-hover:scale-105 transition-transform" 
                        onClick={() => window.open(`${BASE_IMG_URL}${path}`, '_blank')}
                    />
                ) : (
                    <span className="text-gray-400 italic text-sm">Không có ảnh</span>
                )}
            </div>
        </div>
    );

    const getAuthStatusBadge = () => {
        if (isLoadingAuth) return <span className="animate-pulse bg-gray-200 h-4 w-16 rounded"></span>;
        if (!authData) return <span className="text-gray-400">N/A</span>;
        
        const status = authData.status;
        const styles = status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : 
                      status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 
                      'bg-red-100 text-red-700 border-red-200';
        
        return (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${styles}`}>
                {status}
            </span>
        );
    };

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
                                <div className="flex items-center mr-4">
                                    <ShieldCheckIcon className="h-3.5 w-3.5 mr-1 text-blue-500" />
                                    <span className="text-xs mr-1 text-gray-400 font-medium">Auth Status:</span>
                                    {getAuthStatusBadge()}
                                </div>
                                <span className="flex items-center"><ClockIcon className="h-3 w-3 mr-1" /> {new Date(restaurant.created_at).toLocaleDateString('vi-VN')}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors group">
                        <XIcon className="h-6 w-6 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto flex-grow space-y-8 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center border-l-4 border-orange-500 pl-3">Thông tin quán</h3>
                            <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <div className="flex items-start">
                                    <PhoneIcon className="h-5 w-5 text-orange-400 mr-4 mt-0.5" />
                                    <div><p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Số điện thoại</p><p className="font-bold text-gray-800">{restaurant.phone}</p></div>
                                </div>
                                <div className="flex items-start">
                                    <HomeIcon className="h-5 w-5 text-orange-400 mr-4 mt-0.5" />
                                    <div><p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Địa chỉ</p><p className="font-bold text-gray-800 leading-snug">{restaurant.address}</p></div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center border-l-4 border-orange-500 pl-3">Hồ sơ pháp lý</h3>
                            <ImagePreview label="Giấy phép kinh doanh" path={restaurant.business_license_image} />
                            <ImagePreview label="ATVSTP" path={restaurant.food_safety_certificate_image} />
                        </div>
                    </div>
                </div>

                {/* Footer Hành động */}
                <div className="p-5 border-t bg-gray-50 flex justify-end items-center px-8 space-x-3">
                    {/* Nếu authStatus không phải pending, xóa luôn các record hành động này */}
                    {authData?.status === 'pending' ? (
                        <>
                            <button 
                                onClick={onReject}
                                className="px-6 py-2.5 bg-white border-2 border-red-500 text-red-500 font-bold rounded-xl hover:bg-red-50 transition-all flex items-center shadow-sm"
                            >
                                <XCircleIcon className="h-5 w-5 mr-2" />
                                Từ chối
                            </button>
                            <button 
                                onClick={onApprove}
                                className="px-8 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all flex items-center shadow-lg shadow-green-100"
                            >
                                <CheckBadgeIcon className="h-5 w-5 mr-2" />
                                Duyệt nhà hàng
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={onClose}
                            className="px-6 py-2.5 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-900 transition-colors shadow-lg"
                        >
                            Đã xử lý (Đóng)
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RestaurantDetailModal;
