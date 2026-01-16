
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
        <div className="space-y-2">
            <div className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                <DocumentTextIcon className="h-4 w-4 mr-1.5 text-blue-500" />
                {label}
            </div>
            <div className="border rounded-xl overflow-hidden bg-gray-50 aspect-[4/3] flex items-center justify-center group relative shadow-inner border-gray-200">
                {path ? (
                    <>
                        <img 
                            src={`${SHIPPER_BASE_URL}${path}`} 
                            alt={label} 
                            className="w-full h-full object-cover cursor-zoom-in group-hover:scale-105 transition-transform" 
                            onClick={() => window.open(`${SHIPPER_BASE_URL}${path}`, '_blank')}
                        />
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"></div>
                    </>
                ) : (
                    <div className="text-center p-4">
                        <XCircleIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <span className="text-gray-400 italic text-xs">Không có ảnh hồ sơ</span>
                    </div>
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
                        <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg overflow-hidden border-2 border-white">
                            {shipper.profileImageUrl ? (
                                <img src={`${SHIPPER_BASE_URL}${shipper.profileImageUrl}`} className="w-full h-full object-cover" alt="Avatar"/>
                            ) : (
                                <UserIcon className="h-8 w-8" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{shipper.fullName}</h2>
                            <div className="flex items-center space-x-3 mt-1 text-sm">
                                <div className="flex items-center">
                                    <ShieldCheckIcon className="h-4 w-4 mr-1 text-blue-500" />
                                    <span className="text-xs text-gray-400 font-bold uppercase mr-1.5">Auth Status:</span>
                                    {getAuthStatusBadge()}
                                </div>
                                <span className="text-gray-400 font-medium">DRIVER_ID: {shipper.id}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors group">
                        <XIcon className="h-6 w-6 text-gray-400 group-hover:text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto flex-grow bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1 space-y-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center">
                                <span className="w-8 h-px bg-gray-200 mr-2"></span> Thông tin liên hệ
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <PhoneIcon className="h-5 w-5 text-blue-500 mr-3" />
                                    <span className="text-gray-800 font-medium">{shipper.phoneNumber}</span>
                                </div>
                                <div className="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <MotorcycleIcon className="h-5 w-5 text-blue-500 mr-3" />
                                    <span className="text-gray-800 font-medium">Status: {shipper.status}</span>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center">
                                <span className="w-8 h-px bg-gray-200 mr-2"></span> Hồ sơ định danh
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <ImagePreview label="CCCD / CMND" path={shipper.citizenIdImageUrl} />
                                <ImagePreview label="Bằng lái xe" path={shipper.driverLicenseImageUrl} />
                                <div className="sm:col-span-2">
                                    <ImagePreview label="Đăng ký xe (Cà vẹt)" path={shipper.driverRegistrationImageUrl} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Hành động: Thay thế nút Hoàn tất bằng Verify/Reject khi cần */}
                <div className="p-5 border-t bg-gray-50 flex justify-between items-center px-8">
                    <button 
                        onClick={onClose}
                        className="text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors flex items-center"
                    >
                        <XCircleIcon className="h-5 w-5 mr-2" />
                        Đóng chi tiết
                    </button>
                    
                    <div className="flex space-x-3">
                        {shipper.verificationStatus === 'Pending' ? (
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
                                className="px-8 py-2.5 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-900 transition-colors shadow-lg"
                            >
                                Đã xử lý (Xong)
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShipperDetailModal;
