import React, { useState, useMemo } from 'react';
// FIX: Import LockIcon and alias it as LockClosedIcon to resolve missing export error.
import { SearchIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon, OfficeBuildingIcon, CheckBadgeIcon, LockIcon as LockClosedIcon, DotsVerticalIcon } from '../components/Icons';
import RestaurantDetailModal, { FullRestaurant } from '../components/RestaurantDetailModal';
import ConfirmationModal from '../components/ConfirmationModal';

// Types
export type RestaurantStatus = 'pending' | 'approved' | 'suspended';

// Mock Data
const mockRestaurants: FullRestaurant[] = [
    {
        id: '1001', name: 'Quán Ăn Gỗ', ownerName: 'Chủ Quán Gỗ', ownerEmail: 'owner@quanango.com', phone: '090 123 4567',
        address: '123 Đường Lê Lợi, Quận 1, TP.HCM', cuisine: 'Món Việt', status: 'approved', createdAt: '2023-02-01',
        bannerUrl: 'https://cdn.xanhsm.com/2025/01/e0898853-nha-hang-khu-ngoai-giao-doan-3.jpg', logoUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448609.png',
        menu: [
            { id: 'm1-1', name: 'Cơm tấm sườn bì chả', price: 35000, category: 'Món chính', image: 'https://sakos.vn/wp-content/uploads/2024/10/bia-4.jpg', isAvailable: true },
            { id: 'm1-2', name: 'Nước ép cam tươi', price: 35000, category: 'Đồ uống', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', isAvailable: false },
        ],
        orders: [{ id: '#12345', customerName: 'Nguyễn Văn A', total: 105000, status: 'Mới', date: '2024-07-30T17:30:00Z' }],
        tickets: [{ id: 'TICKET-XYZ', subject: 'Khách phàn nàn về thái độ', status: 'open', lastUpdate: '2024-07-30' }],
        security: { alerts: ['Tần suất chỉnh giá món ăn cao bất thường.'], logs: [{ ip: '192.168.1.10', device: 'Desktop', timestamp: '2024-07-30 10:00', action: 'Đăng nhập' }] }
    },
    {
        id: '1002', name: 'Bếp Việt', ownerName: 'Chủ Bếp Việt', ownerEmail: 'owner@bepviet.com', phone: '091 234 5678',
        address: '45 Phạm Ngọc Thạch, Quận 3, TP.HCM', cuisine: 'Món Việt', status: 'pending', createdAt: '2024-07-25',
        bannerUrl: 'https://images.unsplash.com/photo-1504754524776-8f4f37790774?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80', logoUrl: 'https://cdn-icons-png.flaticon.com/512/4555/4555035.png',
        menu: [], orders: [], tickets: [], security: { alerts: [], logs: [] }
    },
    {
        id: '1003', name: 'Phở Ngon 3 Miền', ownerName: 'Chủ Phở Ngon', ownerEmail: 'owner@phongon.com', phone: '092 345 6789',
        address: '212 Nguyễn Trãi, Quận 5, TP.HCM', cuisine: 'Phở & Bún', status: 'suspended', createdAt: '2023-06-10',
        bannerUrl: 'https://images.unsplash.com/photo-1569429453484-a245f09978b7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80', logoUrl: 'https://cdn-icons-png.flaticon.com/512/5856/5856424.png',
        menu: [], orders: [], tickets: [], security: { alerts: ['Nhiều yêu cầu hoàn tiền bất thường.'], logs: [] }
    },
];

const ITEMS_PER_PAGE = 10;

const StatusBadge: React.FC<{ status: RestaurantStatus }> = ({ status }) => {
    const styles = {
        approved: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        suspended: 'bg-red-100 text-red-800',
    };
    const text = {
        approved: 'Đã duyệt',
        pending: 'Đang chờ duyệt',
        suspended: 'Bị khóa',
    };
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>{text[status]}</span>;
};


const AdminRestaurantsPage: React.FC = () => {
    const [restaurants, setRestaurants] = useState<FullRestaurant[]>(mockRestaurants);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    
    const [selectedRestaurant, setSelectedRestaurant] = useState<FullRestaurant | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    
    const [confirmation, setConfirmation] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; color?: 'orange' | 'red'; } | null>(null);

    const filteredRestaurants = useMemo(() => {
        return restaurants
            .filter(r => statusFilter === 'All' || r.status === statusFilter)
            .filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [restaurants, searchTerm, statusFilter]);

    const paginatedRestaurants = filteredRestaurants.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleUpdateRestaurant = (updatedRestaurant: FullRestaurant) => {
        setRestaurants(prev => prev.map(r => r.id === updatedRestaurant.id ? updatedRestaurant : r));
    };
    
    const handleChangeStatus = (restaurant: FullRestaurant, newStatus: RestaurantStatus) => {
        const actionText = newStatus === 'approved' ? 'duyệt' : newStatus === 'suspended' ? 'khóa' : 'mở khóa';
        const titleText = newStatus === 'approved' ? 'Duyệt' : newStatus === 'suspended' ? 'Khóa' : 'Mở khóa';

        setConfirmation({
            isOpen: true,
            title: `${titleText} nhà hàng?`,
            message: `Bạn có chắc chắn muốn ${actionText} nhà hàng ${restaurant.name}?`,
            onConfirm: () => {
                handleUpdateRestaurant({ ...restaurant, status: newStatus });
                setConfirmation(null);
            },
            color: newStatus === 'suspended' ? 'red' : 'orange'
        });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Quản lý nhà hàng</h1>
            
            <div className="bg-white p-4 rounded-lg shadow-md border flex flex-wrap items-center justify-between gap-4">
                <div className="relative flex-grow max-w-md">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3"><SearchIcon className="h-5 w-5 text-gray-400" /></span>
                    <input type="text" placeholder="Tìm kiếm nhà hàng..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div className="flex items-center gap-4">
                     <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <option value="All">Tất cả trạng thái</option>
                        <option value="pending">Đang chờ duyệt</option>
                        <option value="approved">Đã duyệt</option>
                        <option value="suspended">Bị khóa</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md border overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhà hàng</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chủ sở hữu</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedRestaurants.map(restaurant => (
                            <tr key={restaurant.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img className="h-10 w-10 rounded-full object-cover mr-3" src={restaurant.logoUrl} alt={restaurant.name} />
                                        <div>
                                            <div className="font-medium text-gray-900">{restaurant.name}</div>
                                            <div className="text-sm text-gray-500">{restaurant.cuisine}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{restaurant.ownerName}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={restaurant.status} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{restaurant.createdAt}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {restaurant.status === 'pending' && <button onClick={() => handleChangeStatus(restaurant, 'approved')} className="text-green-600 hover:text-green-900 mr-4 font-semibold">Duyệt</button>}
                                    {restaurant.status === 'approved' && <button onClick={() => handleChangeStatus(restaurant, 'suspended')} className="text-red-600 hover:text-red-900 mr-4 font-semibold">Khóa</button>}
                                    {restaurant.status === 'suspended' && <button onClick={() => handleChangeStatus(restaurant, 'approved')} className="text-blue-600 hover:text-blue-900 mr-4 font-semibold">Mở khóa</button>}
                                    <button onClick={() => { setSelectedRestaurant(restaurant); setIsDetailModalOpen(true); }} className="text-orange-600 hover:text-orange-900 font-semibold">Xem chi tiết</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isDetailModalOpen && selectedRestaurant && (
                <RestaurantDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} restaurant={selectedRestaurant} onUpdate={handleUpdateRestaurant} />
            )}

            {confirmation?.isOpen && (
                <ConfirmationModal isOpen={confirmation.isOpen} onClose={() => setConfirmation(null)} onConfirm={confirmation.onConfirm} title={confirmation.title} message={confirmation.message} confirmButtonColor={confirmation.color} />
            )}
        </div>
    );
};

export default AdminRestaurantsPage;