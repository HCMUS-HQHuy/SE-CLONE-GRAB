
import React, { useState, useEffect } from 'react';
import { XIcon, ClockIcon, PhoneIcon, HomeIcon, UserIcon, DocumentTextIcon, CheckBadgeIcon, XCircleIcon, ShieldCheckIcon, StarIcon } from './Icons';
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
        <div className="space-y-3">
            <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                <DocumentTextIcon className="h-3.5 w-3.5 mr-1.5 text-orange-400" />
                {label}
            </div>
            <div className="border border-gray-100 rounded-[1.5rem] overflow-hidden bg-gray-50 aspect-video flex items-center justify-center group relative shadow-inner">
                {path ? (
                    <>
                        <img 
                            src={`${BASE_IMG_URL}${path}`} 
                            alt={label} 
                            className="w-full h-full object-contain cursor-zoom-in group-hover:scale-105 transition-transform duration-500" 
                            onClick={() => window.open(`${BASE_IMG_URL}${path}`, '_blank')}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none"></div>
                    </>
                ) : (
                    <span className="text-gray-400 italic text-xs">Chưa tải lên ảnh này</span>
                )}
            </div>
        </div>
    );

    const getStatusBadge = () => {
        const status = restaurant.status.toUpperCase();
        const styles = status === 'ACTIVE' ? 'bg-green-50 text-green-600 border-green-100' : 
                      status === 'PENDING' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : 
                      'bg-red-50 text-red-600 border-red-100';
        
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-tight ${styles}`}>
                {status === 'ACTIVE' ? 'Đang hoạt động' : status === 'PENDING' ? 'Chờ duyệt' : 'Đã khóa'}
            </span>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                    <div className="flex items-center space-x-6">
                        <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-orange-50">
                            {restaurant.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800 tracking-tight">{restaurant.name}</h2>
                            <div className="flex items-center space-x-4 mt-1.5">
                                <div className="flex items-center">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase mr-2">Trạng thái:</span>
                                    {getStatusBadge()}
                                </div>
                                <span className="text-xs text-gray-400 font-medium">OWNER: #{restaurant.owner_id}</span>
                                <div className="flex items-center text-[11px] text-orange-500 font-bold">
                                    <StarIcon className="h-3.5 w-3.5 mr-1" />
                                    <span>{restaurant.rating.toFixed(1)} Rating</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-10 overflow-y-auto flex-grow space-y-12 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Section 1: Basic Info */}
                        <div className="space-y-8">
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Hồ sơ đối tác</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-start">
                                    <PhoneIcon className="h-4 w-4 text-orange-400 mr-4 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Số điện thoại</p>
                                        <p className="text-sm font-semibold text-gray-800">{restaurant.phone}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-start">
                                    <HomeIcon className="h-4 w-4 text-orange-400 mr-4 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Địa chỉ</p>
                                        <p className="text-sm font-semibold text-gray-800 leading-snug">{restaurant.address}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-start">
                                    <ClockIcon className="h-4 w-4 text-orange-400 mr-4 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Mở cửa</p>
                                        <p className="text-sm font-semibold text-gray-800">{restaurant.opening_hours}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-gray-50/30 border border-dashed border-gray-200 rounded-[1.5rem]">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Giới thiệu quán</p>
                                <p className="text-sm text-gray-600 leading-relaxed italic">
                                    "{restaurant.description || 'Chưa có thông tin mô tả chi tiết.'}"
                                </p>
                            </div>
                        </div>

                        {/* Section 2: Legal Documents */}
                        <div className="space-y-8">
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Hồ sơ pháp lý</h3>
                            <div className="grid grid-cols-1 gap-8">
                                <ImagePreview label="Giấy phép kinh doanh" path={restaurant.business_license_image} />
                                <ImagePreview label="Giấy chứng nhận ATVSTP" path={restaurant.food_safety_certificate_image} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-50 bg-gray-50/30 flex justify-between items-center px-10">
                    <button 
                        onClick={onClose}
                        className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest"
                    >
                        Đóng chi tiết
                    </button>
                    
                    <div className="flex space-x-3">
                        {restaurant.status === 'PENDING' ? (
                            <>
                                <button 
                                    onClick={onReject}
                                    className="px-6 py-2.5 bg-white border border-red-200 text-red-500 font-semibold text-xs rounded-full hover:bg-red-50 transition-all flex items-center"
                                >
                                    Từ chối hồ sơ
                                </button>
                                <button 
                                    onClick={onApprove}
                                    className="px-8 py-2.5 bg-orange-500 text-white font-semibold text-xs rounded-full hover:bg-orange-600 transition-all flex items-center shadow-lg shadow-orange-100"
                                >
                                    Phê duyệt nhà hàng
                                </button>
                            </>
                        ) : (
                             <button 
                                onClick={onClose}
                                className="px-10 py-2.5 bg-gray-800 text-white font-semibold text-xs rounded-full hover:bg-gray-900 transition-colors"
                            >
                                Đóng
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantDetailModal;
