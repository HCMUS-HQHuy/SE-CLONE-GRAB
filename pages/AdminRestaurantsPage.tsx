
import React, { useState, useMemo, useEffect } from 'react';
import { SearchIcon, CheckCircleIcon, XCircleIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/Icons';
import { restaurantApiService, RestaurantListItem } from '../services/restaurantApi';
import RestaurantDetailModal from '../components/RestaurantDetailModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { apiService, UserStatus } from '../services/api';

const LIMIT = 100;

const AdminRestaurantsPage: React.FC = () => {
    const [restaurants, setRestaurants] = useState<RestaurantListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('PENDING'); // Lọc theo PENDING, ACTIVE, REJECTED
    
    const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantListItem | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    
    const [confirmation, setConfirmation] = useState<{
        isOpen: boolean; 
        title: string; 
        message: string; 
        onConfirm: () => void; 
        color?: 'orange' | 'red'; 
    } | null>(null);

    useEffect(() => {
        fetchRestaurants();
    }, [statusFilter]);

    const fetchRestaurants = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Sử dụng API với skip và limit (mặc định trang đầu skip=0)
            const data = await restaurantApiService.getRestaurants(0, LIMIT, statusFilter);
            setRestaurants(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredRestaurants = useMemo(() => {
        return restaurants.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [restaurants, searchTerm]);

    const handleUpdateAuthStatus = async (ownerId: number, status: UserStatus) => {
        setIsLoading(true);
        try {
            await apiService.adminUpdateUserStatus(ownerId, status);
            fetchRestaurants();
            setConfirmation(null);
            setIsDetailModalOpen(false);
        } catch (err: any) {
            alert(err.message || 'Lỗi cập nhật trạng thái Auth.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleApprove = (res: RestaurantListItem) => {
        setConfirmation({
            isOpen: true,
            title: 'Phê duyệt nhà hàng',
            message: `Hệ thống sẽ kích hoạt tài khoản kinh doanh cho "${res.name}".`,
            onConfirm: () => handleUpdateAuthStatus(res.owner_id, 'active'),
            color: 'orange'
        });
    };

    const handleReject = (res: RestaurantListItem) => {
        setConfirmation({
            isOpen: true,
            title: 'Từ chối hồ sơ',
            message: `Bạn muốn từ chối hồ sơ của "${res.name}"?`,
            onConfirm: () => handleUpdateAuthStatus(res.owner_id, 'inactive'),
            color: 'red'
        });
    };

    const getStatusStyle = (status: string) => {
        const s = status.toUpperCase();
        if (s === 'ACTIVE') return 'bg-green-50 text-green-600 border-green-100';
        if (s === 'PENDING') return 'bg-yellow-50 text-yellow-600 border-yellow-100';
        if (s === 'REJECTED') return 'bg-red-50 text-red-600 border-red-100';
        return 'bg-gray-50 text-gray-500 border-gray-100';
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">Đối tác Nhà hàng</h1>
                    <p className="text-gray-400 text-sm mt-1 font-medium">Xét duyệt hồ sơ và quản lý trạng thái các gian hàng.</p>
                </div>
                <button onClick={fetchRestaurants} className="text-xs font-semibold text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-full transition-colors border border-orange-100">Làm mới dữ liệu</button>
            </div>
            
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-6">
                <div className="relative flex-grow max-w-md">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5"><SearchIcon className="h-4 w-4 text-gray-300" /></span>
                    <input 
                        type="text" 
                        placeholder="Tìm tên quán..." 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-100 focus:bg-white outline-none transition-all text-sm" 
                    />
                </div>
                <div className="flex items-center space-x-3">
                     <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Lọc hồ sơ:</span>
                     <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-white border border-gray-100 rounded-xl py-2 px-4 text-sm font-semibold text-gray-600 outline-none focus:ring-2 focus:ring-orange-50">
                        <option value="PENDING">Hồ sơ mới</option>
                        <option value="ACTIVE">Đang hoạt động</option>
                        <option value="REJECTED">Đã từ chối</option>
                        <option value="All">Tất cả</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-50">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Nhà hàng</th>
                            <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Ngày đăng ký</th>
                            <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Trạng thái</th>
                            <th className="px-8 py-5 text-right text-[11px] font-bold text-gray-400 uppercase tracking-widest">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                        {isLoading && restaurants.length === 0 ? (
                            <tr><td colSpan={4} className="py-20 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div></td></tr>
                        ) : filteredRestaurants.length > 0 ? filteredRestaurants.map(res => (
                            <tr key={res.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-8 py-6 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-11 h-11 rounded-2xl bg-orange-50 flex items-center justify-center mr-4 font-semibold text-orange-500 border border-orange-100 group-hover:bg-orange-500 group-hover:text-white transition-all">
                                            {res.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-800 text-sm group-hover:text-orange-600 transition-colors">{res.name}</div>
                                            <div className="text-[10px] text-gray-400 font-bold mt-0.5 tracking-tight">OWNER_ID: #{res.owner_id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-sm text-gray-500 font-medium">
                                    {new Date(res.created_at).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="px-8 py-6 whitespace-nowrap">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusStyle(res.status)}`}>
                                        {res.status === 'ACTIVE' ? 'Hoạt động' : 
                                         res.status === 'PENDING' ? 'Chờ duyệt' : 'Đã khóa/Từ chối'}
                                    </span>
                                </td>
                                <td className="px-8 py-6 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-3">
                                        {res.status === 'PENDING' && (
                                            <button onClick={() => handleApprove(res)} className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="Phê duyệt"><CheckCircleIcon className="h-5 w-5" /></button>
                                        )}
                                        <button 
                                            onClick={() => { setSelectedRestaurant(res); setIsDetailModalOpen(true); }} 
                                            className="text-xs font-bold text-orange-500 hover:text-orange-600 bg-orange-50/50 px-4 py-1.5 rounded-full transition-all"
                                        >Hồ sơ</button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={4} className="p-20 text-center text-gray-400 font-medium italic text-sm">Không tìm thấy nhà hàng nào trong mục này.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isDetailModalOpen && selectedRestaurant && (
                <RestaurantDetailModal 
                    isOpen={isDetailModalOpen} 
                    onClose={() => setIsDetailModalOpen(false)} 
                    restaurant={selectedRestaurant} 
                    onApprove={() => handleApprove(selectedRestaurant)}
                    onReject={() => handleReject(selectedRestaurant)}
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

export default AdminRestaurantsPage;
