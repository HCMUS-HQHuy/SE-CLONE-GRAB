
import React, { useState, useEffect } from 'react';
import { 
    XIcon, UserIcon, PhoneIcon, CheckBadgeIcon, 
    XCircleIcon, DocumentTextIcon, ClockIcon, MotorcycleIcon, ShieldCheckIcon 
} from './Icons';
import { Driver } from '../services/shipperApi';
import { apiService, AdminUserListItem } from '../services/api';

type ShipperDetailModalProps = {
    isOpen: boolean;
    onClose: () => void;
    shipper: Driver;
    onApprove?: () => void;
    onReject?: () => void;
};

const SHIPPER_BASE_URL = 'http://localhost:8001';

const ShipperDetailModal: React.FC<ShipperDetailModalProps> = ({ isOpen, onClose, shipper, onApprove, onReject }) => {
    const [authData, setAuthData] = useState<AdminUserListItem | null>(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(false);

    useEffect(() => {
        if (isOpen && shipper.id) {
            fetchAuthStatus();
        }
    }, [isOpen, shipper.id]);

    const fetchAuthStatus = async () => {
        setIsLoadingAuth(true);
        try {
            const data = await apiService.adminGetUserDetail(parseInt(shipper.id, 10));
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
                <DocumentTextIcon className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
                {label}
            </div>
            <div className="border border-gray-100 rounded-[1.5rem] overflow-hidden bg-gray-50 aspect-[4/3] flex items-center justify-center group relative shadow-inner">
                {path ? (
                    <>
                        <img 
                            src={`${SHIPPER_BASE_URL}${path}`} 
                            alt={label} 
                            className="w-full h-full object-cover cursor-zoom-in group-hover:scale-105 transition-transform duration-500" 
                            onClick={() => window.open(`${SHIPPER_BASE_URL}${path}`, '_blank')}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none"></div>
                    </>
                ) : (
                    <div className="text-center p-4">
                        <XCircleIcon className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                        <span className="text-gray-400 italic text-xs">Chưa có dữ liệu ảnh</span>
                    </div>
                )}
            </div>
        </div>
    );

    const getVerificationBadge = () => {
        const status = shipper.verificationStatus;
        const styles = status === 'Verified' ? 'bg-green-50 text-green-600 border-green-100' : 
                      status === 'Pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : 
                      'bg-red-50 text-red-600 border-red-100';
        
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-tight ${styles}`}>
                {status === 'Verified' ? 'Đã xác thực' : status === 'Pending' ? 'Chờ duyệt' : 'Từ chối'}
            </span>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                    <div className="flex items-center space-x-6">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-blue-600 flex items-center justify-center text-white shadow-lg overflow-hidden border-2 border-white ring-4 ring-blue-50">
                            {shipper.profileImageUrl ? (
                                <img src={`${SHIPPER_BASE_URL}${shipper.profileImageUrl}`} className="w-full h-full object-cover" alt="Avatar"/>
                            ) : (
                                <UserIcon className="h-8 w-8" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800 tracking-tight">{shipper.fullName}</h2>
                            <div className="flex items-center space-x-4 mt-1.5">
                                <div className="flex items-center">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase mr-2">Hồ sơ:</span>
                                    {getVerificationBadge()}
                                </div>
                                <span className="text-xs text-gray-400 font-medium">DRIVER_ID: {shipper.id}</span>
                                <span className={`flex items-center text-[10px] font-bold uppercase ${shipper.status === 'Online' ? 'text-green-500' : 'text-gray-400'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${shipper.status === 'Online' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
                                    {shipper.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-10 overflow-y-auto flex-grow bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="md:col-span-1 space-y-8">
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Thông tin cơ bản</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Số điện thoại</p>
                                    <p className="text-sm font-semibold text-gray-800">{shipper.phoneNumber}</p>
                                </div>
                                <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Email đăng ký</p>
                                    <p className="text-sm font-semibold text-gray-800">{shipper.email}</p>
                                </div>
                                <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Số GPLX</p>
                                    <p className="text-sm font-semibold text-gray-800">{shipper.licenseNumber || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-8">
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Giấy tờ định danh</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <ImagePreview label="Mặt trước CCCD" path={shipper.citizenIdImageUrl} />
                                <ImagePreview label="Bằng lái xe" path={shipper.driverLicenseImageUrl} />
                                <div className="sm:col-span-2">
                                    <ImagePreview label="Đăng ký xe (Cà vẹt)" path={shipper.driverRegistrationImageUrl} />
                                </div>
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
                        Đóng cửa sổ
                    </button>
                    
                    <div className="flex space-x-3">
                        {shipper.verificationStatus === 'Pending' ? (
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
                                    Phê duyệt ngay
                                </button>
                            </>
                        ) : (
                            <button 
                                onClick={onClose}
                                className="px-10 py-2.5 bg-gray-800 text-white font-semibold text-xs rounded-full hover:bg-gray-900 transition-colors"
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

export default ShipperDetailModal;
