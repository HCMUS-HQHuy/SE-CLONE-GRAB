
import React, { useState, useMemo, useEffect } from 'react';
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon, UserIcon, CheckBadgeIcon, XCircleIcon } from '../components/Icons';
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

    const handleUpdateStatus = async (driverId: string, status: UserStatus) => {
        try {
            // Sử dụng API của Auth Service (Port 8003) theo yêu cầu
            await apiService.adminUpdateUserStatus(parseInt(driverId, 10), status);
            
            fetchShippers();
            setConfirmation(null);
            setIsDetailModalOpen(false);
        } catch (err: any) {
            alert(err.message || 'Có lỗi xảy ra khi cập nhật trạng thái tài khoản.');
        }
    };
    
    const handleApprove = (shipper: Driver) => {
        setConfirmation({
            isOpen: true,
            title: 'Phê duyệt tài xế',
            message: `Bạn xác nhận hồ sơ của "${shipper.fullName}" đã hợp lệ và kích hoạt tài khoản để nhận đơn?`,
            onConfirm: () => handleUpdateStatus(shipper.id, 'active'),
            color: 'orange'
        });
    };

    const handleReject = (shipper: Driver) => {
        setConfirmation({
            isOpen: true,
            title: 'Từ chối tài xế',
            message: `Từ chối hồ sơ của "${shipper.fullName}"? Tài khoản sẽ chuyển về trạng thái Inactive.`,
            onConfirm: () => handleUpdateStatus(shipper.id, 'inactive'),
            color: 'red'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Kiểm duyệt Tài xế</h1>
                <button onClick={fetchShippers} className="text-sm text-orange-600 font-medium hover:underline">Làm mới dữ liệu</button>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-md border flex flex-wrap items-center justify-between gap-4">
                <form onSubmit={handleSearch} className="relative flex-grow max-w-md">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3"><SearchIcon className="h-5 w-5 text-gray-400" /></span>
                    <input 
                        type="text" 
                        placeholder="Tìm tên hoặc SĐT tài xế..." 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" 
                    />
                </form>
                <div className="flex items-center gap-4">
                     <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-lg py-2 px-3 text-sm font-medium">
                        <option value="All">Tất cả hồ sơ</option>
                        <option value="Pending">Chờ duyệt (Mới)</option>
                        <option value="Approved">Đã phê duyệt</option>
                        <option value="Rejected">Đã từ chối</option>
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="py-20 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Đang kết nối Shipper Service (Port 8001)...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 p-10 text-center rounded-lg border border-red-100 text-red-600">
                    <p className="font-bold">Lỗi: {error}</p>
                    <button onClick={fetchShippers} className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg">Thử lại</button>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md border overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tài xế</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số điện thoại</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã số tài xế</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
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
                                                <div className="text-xs text-gray-500">Hệ thống: ID_{shipper.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{shipper.phoneNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                                        {shipper.id.padStart(6, '0')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            {shipper.verificationStatus === 'Pending' && (
                                                <>
                                                    <button onClick={() => handleApprove(shipper)} className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors" title="Duyệt"><CheckBadgeIcon className="h-6 w-6"/></button>
                                                    <button onClick={() => handleReject(shipper)} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Từ chối"><XCircleIcon className="h-6 w-6"/></button>
                                                </>
                                            )}
                                            <button 
                                                onClick={() => { setSelectedShipper(shipper); setIsDetailModalOpen(true); }} 
                                                className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-md transition-all font-bold border border-transparent hover:border-blue-200"
                                            >Chi tiết</button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="p-10 text-center text-gray-500 italic font-medium">Không tìm thấy tài xế nào theo tiêu chí lọc.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                 <div className="flex justify-center items-center space-x-2 mt-4">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border rounded bg-white hover:bg-gray-100 disabled:opacity-50"><ChevronLeftIcon className="h-5 w-5"/></button>
                    <span className="text-sm font-medium px-4">Trang {currentPage} / {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border rounded bg-white hover:bg-gray-100 disabled:opacity-50"><ChevronRightIcon className="h-5 w-5"/></button>
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
