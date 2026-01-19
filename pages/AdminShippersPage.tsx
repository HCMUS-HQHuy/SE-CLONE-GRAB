
import React, { useState, useMemo, useEffect } from 'react';
import { SearchIcon, CheckCircleIcon, XCircleIcon, ChevronLeftIcon, ChevronRightIcon, UserIcon } from '../components/Icons';
import ShipperDetailModal from '../components/ShipperDetailModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { shipperApiService, Driver } from '../services/shipperApi';
import { apiService, UserStatus } from '../services/api';

const ITEMS_PER_PAGE = 20;

const AdminShippersPage: React.FC = () => {
    const [shippers, setShippers] = useState<Driver[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Pending'); // Lọc theo verificationStatus
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
            await apiService.adminUpdateUserStatus(parseInt(driverId, 10), status);
            
            if (status === 'active') {
                await shipperApiService.verifyDriver(driverId);
            }

            fetchShippers();
            setConfirmation(null);
            setIsDetailModalOpen(false);
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
            message: `Hệ thống sẽ kích hoạt tài khoản cho tài xế "${shipper.fullName}".`,
            onConfirm: () => handleUpdateAuthStatus(shipper.id, 'active'),
            color: 'orange'
        });
    };

    const handleReject = (shipper: Driver) => {
        setConfirmation({
            isOpen: true,
            title: 'Từ chối tài xế',
            message: `Bạn muốn từ chối hồ sơ của "${shipper.fullName}"?`,
            onConfirm: () => handleUpdateAuthStatus(shipper.id, 'inactive'),
            color: 'red'
        });
    };

    const getVerificationStyle = (status: string) => {
        const s = status.toLowerCase();
        if (s === 'verified') return 'bg-green-50 text-green-600 border-green-100';
        if (s === 'pending') return 'bg-yellow-50 text-yellow-600 border-yellow-100';
        if (s === 'rejected') return 'bg-red-50 text-red-600 border-red-100';
        return 'bg-gray-50 text-gray-500 border-gray-100';
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">Đối tác Tài xế</h1>
                    <p className="text-gray-400 text-sm mt-1 font-medium">Quản lý và xác thực danh tính tài xế giao hàng.</p>
                </div>
                <button onClick={fetchShippers} className="text-xs font-semibold text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-full transition-colors border border-orange-100">Làm mới danh sách</button>
            </div>
            
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-6">
                <form onSubmit={handleSearch} className="relative flex-grow max-w-md">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5"><SearchIcon className="h-4 w-4 text-gray-300" /></span>
                    <input 
                        type="text" 
                        placeholder="Tìm theo tên hoặc số điện thoại..." 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-100 focus:bg-white outline-none transition-all text-sm" 
                    />
                </form>
                <div className="flex items-center space-x-3">
                     <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Trạng thái hồ sơ:</span>
                     <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-white border border-gray-100 rounded-xl py-2 px-4 text-sm font-semibold text-gray-600 outline-none focus:ring-2 focus:ring-orange-50">
                        <option value="Pending">Chờ duyệt</option>
                        <option value="Verified">Đã phê duyệt</option>
                        <option value="Rejected">Đã từ chối</option>
                        <option value="All">Tất cả</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-50">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Tài xế</th>
                            <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Liên hệ</th>
                            <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Trạng thái hồ sơ</th>
                            <th className="px-8 py-5 text-right text-[11px] font-bold text-gray-400 uppercase tracking-widest">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                        {isLoading && shippers.length === 0 ? (
                            <tr><td colSpan={4} className="py-20 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div></td></tr>
                        ) : shippers.length > 0 ? shippers.map(shipper => (
                            <tr key={shipper.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-8 py-6 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center mr-4 font-semibold text-blue-500 overflow-hidden border border-blue-100">
                                            {shipper.profileImageUrl ? <img src={`http://localhost:8001${shipper.profileImageUrl}`} className="w-full h-full object-cover"/> : <UserIcon className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-800 text-sm group-hover:text-orange-600 transition-colors">{shipper.fullName}</div>
                                            <div className="text-[10px] text-gray-400 font-bold mt-0.5">#{shipper.id.padStart(5, '0')}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-sm text-gray-500 font-medium">{shipper.phoneNumber}</td>
                                <td className="px-8 py-6 whitespace-nowrap">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getVerificationStyle(shipper.verificationStatus)}`}>
                                        {shipper.verificationStatus === 'Verified' ? 'Đã xác thực' : 
                                         shipper.verificationStatus === 'Pending' ? 'Chờ duyệt' : 'Từ chối'}
                                    </span>
                                </td>
                                <td className="px-8 py-6 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-3">
                                        {shipper.verificationStatus === 'Pending' && (
                                            <button onClick={() => handleApprove(shipper)} className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="Phê duyệt"><CheckCircleIcon className="h-5 w-5" /></button>
                                        )}
                                        <button 
                                            onClick={() => { setSelectedShipper(shipper); setIsDetailModalOpen(true); }} 
                                            className="text-xs font-bold text-orange-500 hover:text-orange-600 bg-orange-50/50 px-4 py-1.5 rounded-full transition-all"
                                        >Chi tiết</button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={4} className="p-20 text-center text-gray-400 font-medium italic text-sm">Không tìm thấy tài xế nào khớp với bộ lọc.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {totalPages > 1 && (
                 <div className="flex justify-center items-center space-x-4">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2.5 bg-white border border-gray-100 rounded-xl shadow-sm hover:bg-gray-50 disabled:opacity-30 transition-all"><ChevronLeftIcon className="h-4 w-4 text-gray-600"/></button>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Trang {currentPage} / {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2.5 bg-white border border-gray-100 rounded-xl shadow-sm hover:bg-gray-50 disabled:opacity-30 transition-all"><ChevronRightIcon className="h-4 w-4 text-gray-600"/></button>
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
