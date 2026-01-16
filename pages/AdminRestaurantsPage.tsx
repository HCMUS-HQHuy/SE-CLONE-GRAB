
import React, { useState, useMemo, useEffect } from 'react';
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/Icons';
import { restaurantApiService, RestaurantListItem } from '../services/restaurantApi';
import RestaurantDetailModal from '../components/RestaurantDetailModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { apiService, UserStatus } from '../services/api';

const ITEMS_PER_PAGE = 10;

const AdminRestaurantsPage: React.FC = () => {
    const [restaurants, setRestaurants] = useState<RestaurantListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('PENDING');
    const [currentPage, setCurrentPage] = useState(1);
    
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
            const data = await restaurantApiService.getRestaurants(0, 100, statusFilter);
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
        try {
            await apiService.adminUpdateUserStatus(ownerId, status);
            fetchRestaurants();
            setConfirmation(null);
            setIsDetailModalOpen(false);
        } catch (err: any) {
            alert(err.message || 'Lỗi cập nhật trạng thái Auth.');
        }
    };
    
    const handleApprove = (res: RestaurantListItem) => {
        setConfirmation({
            isOpen: true,
            title: 'Phê duyệt đối tác',
            message: `Kích hoạt tài khoản của "${res.name}"? Sau khi duyệt, chủ quán có thể bắt đầu bán hàng.`,
            onConfirm: () => handleUpdateAuthStatus(res.owner_id, 'active'),
            color: 'orange'
        });
    };

    const handleReject = (res: RestaurantListItem) => {
        setConfirmation({
            isOpen: true,
            title: 'Từ chối hồ sơ',
            message: `Bạn muốn từ chối hồ sơ của "${res.name}"? Trạng thái tài khoản sẽ chuyển về Inactive.`,
            onConfirm: () => handleUpdateAuthStatus(res.owner_id, 'inactive'),
            color: 'red'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Đối tác Nhà hàng</h1>
                <button onClick={fetchRestaurants} className="text-sm text-orange-600 font-medium hover:underline">Làm mới</button>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-md border flex flex-wrap items-center justify-between gap-4">
                <div className="relative flex-grow max-w-md">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3"><SearchIcon className="h-5 w-5 text-gray-400" /></span>
                    <input type="text" placeholder="Tìm tên quán..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <div className="flex items-center gap-4">
                     <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-lg py-2 px-3 text-sm font-medium">
                        <option value="PENDING">Hồ sơ mới</option>
                        <option value="ACTIVE">Đang hoạt động</option>
                        <option value="All">Tất cả</option>
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhà hàng</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Địa chỉ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đăng ký</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredRestaurants.length > 0 ? filteredRestaurants.map(res => (
                                <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded bg-orange-100 flex items-center justify-center mr-3 font-bold text-orange-600">
                                                {res.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{res.name}</div>
                                                <div className="text-[10px] text-gray-400">ID: {res.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{res.address}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(res.created_at).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => { setSelectedRestaurant(res); setIsDetailModalOpen(true); }} 
                                            className="text-orange-600 hover:text-orange-700 bg-orange-50 px-4 py-1.5 rounded-lg transition-all font-bold border border-orange-100"
                                        >Xem chi tiết</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="p-10 text-center text-gray-500">Không tìm thấy nhà hàng nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

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
