
import React, { useState, useMemo, useEffect } from 'react';
import { SearchIcon } from '../components/Icons';
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
        try {
            await apiService.adminUpdateUserStatus(parseInt(driverId, 10), status);
            fetchShippers();
            setConfirmation(null);
            setIsDetailModalOpen(false);
        } catch (err: any) {
            alert(err.message || 'Lỗi kết nối Auth Service.');
        }
    };
    
    const handleApprove = (shipper: Driver) => {
        setConfirmation({
            isOpen: true,
            title: 'Phê duyệt tài xế',
            message: `Kích hoạt tài khoản cho tài xế "${shipper.fullName}" để có thể nhận đơn hàng ngay lập tức?`,
            onConfirm: () => handleUpdateAuthStatus(shipper.id, 'active'),
            color: 'orange'
        });
    };

    const handleReject = (shipper: Driver) => {
        setConfirmation({
            isOpen: true,
            title: 'Từ chối tài xế',
            message: `Từ chối hồ sơ của "${shipper.fullName}"? Tài khoản sẽ không thể đăng nhập hoặc nhận đơn.`,
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

            {isLoading ? (
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã số định danh</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
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
                                            <div className="font-semibold text-gray-900">{shipper.fullName}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{shipper.phoneNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                                        DRIVER_{shipper.id.padStart(5, '0')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => { setSelectedShipper(shipper); setIsDetailModalOpen(true); }} 
                                            className="text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-1.5 rounded-lg transition-all font-bold border border-blue-100"
                                        >Chi tiết</button>
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
