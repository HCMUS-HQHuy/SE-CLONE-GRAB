
import React, { useState, useMemo, useEffect } from 'react';
import { SearchIcon, CheckCircleIcon, XCircleIcon } from '../components/Icons';
import { restaurantApiService, RestaurantListItem } from '../services/restaurantApi';
import RestaurantDetailModal from '../components/RestaurantDetailModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { apiService, UserStatus } from '../services/api';

const AdminRestaurantsPage: React.FC = () => {
    const [restaurants, setRestaurants] = useState<RestaurantListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('PENDING');
    
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

    const handleUpdateAuthStatus = async (restaurant: RestaurantListItem, status: UserStatus) => {
        setIsLoading(true);
        try {
            // 1. Cập nhật Auth status (8003)
            await apiService.adminUpdateUserStatus(restaurant.owner_id, status);
            
            // 2. Cập nhật Restaurant status (8004)
            if (status === 'active') {
                await restaurantApiService.updateStatus(restaurant.id, 'ACTIVE');
            } else if (status === 'inactive') {
                await restaurantApiService.updateStatus(restaurant.id, 'REJECTED');
            }

            fetchRestaurants();
            setConfirmation(null);
            setIsDetailModalOpen(false);
        } catch (err: any) {
            alert(err.message || 'Lỗi cập nhật trạng thái.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleApprove = (res: RestaurantListItem) => {
        setConfirmation({
            isOpen: true,
            title: 'Phê duyệt đối tác',
            message: `Kích hoạt tài khoản kinh doanh cho "${res.name}" trên toàn hệ thống?`,
            onConfirm: () => handleUpdateAuthStatus(res, 'active'),
            color: 'orange'
        });
    };

    const handleReject = (res: RestaurantListItem) => {
        setConfirmation({
            isOpen: true,
            title: 'Từ chối hồ sơ',
            message: `Bạn muốn từ chối hồ sơ của "${res.name}"?`,
            onConfirm: () => handleUpdateAuthStatus(res, 'inactive'),
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

            {isLoading && !restaurants.length ? (
                <div className="py-20 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto"></div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md border overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhà hàng</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
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
                                    <td className="px-6 py-4 whitespace-nowrap">
                                         <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                                            res.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border-green-200' :
                                            res.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                            'bg-red-100 text-red-700 border-red-200'
                                        }`}>
                                            {res.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end items-center space-x-2">
                                            {res.status === 'PENDING' && (
                                                <>
                                                    <button onClick={() => handleApprove(res)} className="p-1.5 bg-green-50 text-green-600 rounded-md hover:bg-green-100" title="Duyệt hồ sơ"><CheckCircleIcon className="h-5 w-5" /></button>
                                                    <button onClick={() => handleReject(res)} className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100" title="Từ chối hồ sơ"><XCircleIcon className="h-5 w-5" /></button>
                                                </>
                                            )}
                                            <button 
                                                onClick={() => { setSelectedRestaurant(res); setIsDetailModalOpen(true); }} 
                                                className="text-orange-600 hover:text-orange-700 bg-orange-50 px-4 py-1.5 rounded-lg transition-all font-bold border border-orange-100"
                                            >Xem hồ sơ</button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={3} className="p-10 text-center text-gray-500">Không tìm thấy nhà hàng nào.</td></tr>
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
