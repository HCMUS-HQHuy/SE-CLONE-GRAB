
import React, { useState, useMemo, useEffect } from 'react';
import { SearchIcon, CheckCircleIcon, XCircleIcon } from '../components/Icons';
import ShipperDetailModal from '../components/ShipperDetailModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { shipperApiService, Driver } from '../services/shipperApi';
import { apiService, UserStatus } from '../services/api';

const ITEMS_PER_PAGE = 10;

const AdminShippersPage: React.FC = () => {
    const [shippers, setShippers] = useState<Driver[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Pending');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    const [selectedShipper, setSelectedShipper] = useState<Driver | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    
    const [confirmation, setConfirmation] = useState<{ 
        isOpen: boolean; 
        title: string; 
        message: string; 
        onConfirm: () => void; 
        color?: 'orange' | 'red'; 
    } | null>(null);

    useEffect(() => {
        fetchShippers();
    }, [currentPage, statusFilter]);

    const fetchShippers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await shipperApiService.getDrivers(currentPage, ITEMS_PER_PAGE, statusFilter, searchTerm);
            setShippers(response.items);
            setTotalPages(response.totalPages);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchShippers();
    };

    const handleUpdateAuthStatus = async (driverId: string, status: UserStatus) => {
        setIsLoading(true);
        try {
            // Bước 1: Cập nhật trạng thái trên Auth Service (Port 8003)
            await apiService.adminUpdateUserStatus(parseInt(driverId, 10), status);
            
            // Bước 2: Nếu là phê duyệt (active), gọi tiếp API verify trên Shipper Service (Port 8001)
            if (status === 'active') {
                try {
                    await shipperApiService.verifyDriver(driverId);
                } catch (verifyErr: any) {
                    throw new Error(`Auth OK nhưng Shipper Verify lỗi: ${verifyErr.message}`);
                }
            }

            fetchShippers();
            setConfirmation(null);
            setIsDetailModalOpen(false);
            // Thông báo ngắn gọn
        } catch (err: any) {
            alert(`Lỗi: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleApprove = (shipper: Driver) => {
        setConfirmation({
            isOpen: true,
            title: 'Phê duyệt tài xế',
            message: `Hệ thống sẽ kích hoạt tài khoản và xác thực hồ sơ cho tài xế "${shipper.fullName}".`,
            onConfirm: () => handleUpdateAuthStatus(shipper.id, 'active'),
            color: 'orange'
        });
    };

    const handleReject = (shipper: Driver) => {
        setConfirmation({
            isOpen: true,
            title: 'Từ chối tài xế',
            message: `Từ chối hồ sơ của "${shipper.fullName}"?`,
            onConfirm: () => handleUpdateAuthStatus(shipper.id, 'inactive'),
            color: 'red'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Quản lý Tài xế</h1>
                <button onClick={fetchShippers} className="text-sm text-orange-600 font-medium hover:underline">Làm mới</button>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-md border flex flex-wrap items-center justify-between gap-4">
                <form onSubmit={handleSearch} className="relative flex-grow max-w-md">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3"><SearchIcon className="h-5 w-5 text-gray-400" /></span>
                    <input 
                        type="text" 
                        placeholder="Tìm tên hoặc SĐT..." 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" 
                    />
                </form>
                <div className="flex items-center gap-4">
                     <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-lg py-2 px-3 text-sm font-medium">
                        <option value="Pending">Hồ sơ chờ duyệt</option>
                        <option value="Approved">Đã phê duyệt</option>
                        <option value="All">Tất cả hồ sơ</option>
                    </select>
                </div>
            </div>

            {isLoading && !shippers.length ? (
                <div className="py-20 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto"></div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md border overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tài xế</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số điện thoại</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động nhanh</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {shippers.length > 0 ? shippers.map(shipper => (
                                <tr key={shipper.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 font-bold text-blue-600 overflow-hidden">
                                                {shipper.profileImageUrl ? <img src={`http://localhost:8001${shipper.profileImageUrl}`} className="w-full h-full object-cover"/> : shipper.fullName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{shipper.fullName}</div>
                                                <div className="text-[10px] text-gray-400">DRIVER_{shipper.id.padStart(5, '0')}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{shipper.phoneNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {shipper.verificationStatus === 'Pending' ? (
                                            <div className="flex space-x-2">
                                                <button 
                                                    onClick={() => handleApprove(shipper)}
                                                    className="flex items-center bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-md text-xs font-bold hover:bg-green-100 transition-colors"
                                                >
                                                    <CheckCircleIcon className="h-3.5 w-3.5 mr-1" /> Duyệt
                                                </button>
                                                <button 
                                                    onClick={() => handleReject(shipper)}
                                                    className="flex items-center bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-md text-xs font-bold hover:bg-red-100 transition-colors"
                                                >
                                                    <XCircleIcon className="h-3.5 w-3.5 mr-1" /> Từ chối
                                                </button>
                                            </div>
                                        ) : (
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                                shipper.verificationStatus === 'Approved' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'
                                            }`}>
                                                {shipper.verificationStatus}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => { setSelectedShipper(shipper); setIsDetailModalOpen(true); }} 
                                            className="text-blue-600 hover:text-blue-700 font-bold hover:underline"
                                        >Xem hồ sơ</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="p-10 text-center text-gray-500 font-medium italic">Không tìm thấy tài xế nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {isDetailModalOpen && selectedShipper && (
                <ShipperDetailModal 
                    isOpen={isDetailModalOpen} 
                    onClose={() => setIsDetailModalOpen(false)} 
                    shipper={selectedShipper} 
                    onApprove={() => handleApprove(selectedShipper)}
                    onReject={() => handleReject(selectedShipper)}
                />
            )}

            {confirmation?.isOpen && (
                <ConfirmationModal 
                    isOpen={confirmation.isOpen} 
                    onClose={() => setConfirmation(null)} 
                    onConfirm={confirmation.onConfirm} 
                    title={confirmation.title} 
                    message={confirmation.message} 
                    confirmButtonColor={confirmation.color} 
                />
            )}
        </div>
    );
};

export default AdminShippersPage;
