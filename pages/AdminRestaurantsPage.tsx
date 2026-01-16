
import React, { useState, useMemo, useEffect } from 'react';
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon, OfficeBuildingIcon, CheckBadgeIcon, LockIcon as LockClosedIcon, XCircleIcon } from '../components/Icons';
import { restaurantApiService, RestaurantListItem } from '../services/restaurantApi';
import RestaurantDetailModal from '../components/RestaurantDetailModal';
import ConfirmationModal from '../components/ConfirmationModal';

const ITEMS_PER_PAGE = 10;

const AdminRestaurantsPage: React.FC = () => {
    const [restaurants, setRestaurants] = useState<RestaurantListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('PENDING'); // Mặc định hiển thị chờ duyệt
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

    const handleUpdateStatus = async (restaurantId: number, status: string) => {
        try {
            await restaurantApiService.updateStatus(restaurantId, status);
            fetchRestaurants();
            setConfirmation(null);
            setIsDetailModalOpen(false); // Đóng modal nếu đang thao tác từ trong đó
        } catch (err: any) {
            alert(err.message);
        }
    };
    
    const handleApprove = (res: RestaurantListItem) => {
        setConfirmation({
            isOpen: true,
            title: 'Phê duyệt nhà hàng',
            message: `Bạn xác nhận hồ sơ của "${res.name}" đã hợp lệ và cho phép hoạt động?`,
            onConfirm: () => handleUpdateStatus(res.id, 'ACTIVE'),
            color: 'orange'
        });
    };

    const handleReject = (res: RestaurantListItem) => {
        setConfirmation({
            isOpen: true,
            title: 'Từ chối hồ sơ',
            message: `Từ chối hồ sơ của "${res.name}"? Bạn nên thông báo lý do cho chủ quán.`,
            onConfirm: () => handleUpdateStatus(res.id, 'REJECTED'),
            color: 'red'
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
            case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
            case 'BANNED': return 'bg-gray-800 text-white';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Quản lý Đối tác Nhà hàng</h1>
                <button onClick={fetchRestaurants} className="text-sm text-orange-600 font-medium hover:underline">Làm mới</button>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-md border flex flex-wrap items-center justify-between gap-4">
                <div className="relative flex-grow max-w-md">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3"><SearchIcon className="h-5 w-5 text-gray-400" /></span>
                    <input type="text" placeholder="Tìm tên quán..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <div className="flex items-center gap-4">
                     <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-lg py-2 px-3 text-sm font-medium">
                        <option value="All">Tất cả trạng thái</option>
                        <option value="PENDING">Chờ duyệt (New)</option>
                        <option value="ACTIVE">Đang hoạt động</option>
                        <option value="REJECTED">Đã từ chối</option>
                        <option value="BANNED">Đã khóa</option>
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="py-20 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Đang tải dữ liệu từ Seller Service...</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md border overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhà hàng</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Địa chỉ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredRestaurants.length > 0 ? filteredRestaurants.map(res => (
                                <tr key={res.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded bg-orange-100 flex items-center justify-center mr-3 font-bold text-orange-600">
                                                {res.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{res.name}</div>
                                                <div className="text-xs text-gray-500">ID: {res.id} | Owner: {res.owner_id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{res.address}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getStatusBadge(res.status)}`}>
                                            {res.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            {res.status === 'PENDING' && (
                                                <>
                                                    <button onClick={() => handleApprove(res)} className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors" title="Duyệt hồ sơ"><CheckBadgeIcon className="h-6 w-6"/></button>
                                                    <button onClick={() => handleReject(res)} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Từ chối"><XCircleIcon className="h-6 w-6"/></button>
                                                </>
                                            )}
                                            <button 
                                                onClick={() => { setSelectedRestaurant(res); setIsDetailModalOpen(true); }} 
                                                className="text-orange-600 hover:bg-orange-50 px-3 py-1 rounded-md transition-all font-bold border border-transparent hover:border-orange-200"
                                            >Chi tiết</button>
                                        </div>
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
