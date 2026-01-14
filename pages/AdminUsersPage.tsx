
import React, { useState, useMemo, useEffect } from 'react';
import { SearchIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon, UserIcon, TrashIcon, LockIcon as LockClosedIcon } from '../components/Icons';
import { apiService, AdminUserListItem, UserRole, UserStatus } from '../services/api';
import ConfirmationModal from '../components/ConfirmationModal';
// FIX: Import UserDetailModal to allow detailed user management
import UserDetailModal from '../components/UserDetailModal';

// FIX: Define and export types needed by UserDetailModal.tsx to fix member missing errors
export type UserSession = {
    id: string;
    ip: string;
    device: 'desktop' | 'mobile';
    location: string;
    lastSeen: string;
};

export type ActivityLog = {
    id: string;
    action: string;
    admin: string;
    timestamp: string;
};

export type User = {
    id: number;
    name: string;
    email: string;
    role: 'Admin' | 'Customer' | 'Shipper' | 'Merchant Owner';
    status: 'active' | 'inactive';
    createdAt: string;
    lastLogin: string;
    sessions: UserSession[];
    activityLog: ActivityLog[];
};

const ITEMS_PER_PAGE = 10;

const AdminUsersPage: React.FC = () => {
    const [users, setUsers] = useState<AdminUserListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    
    // FIX: Add state for the detailed user modal integration
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    
    const [confirmation, setConfirmation] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        color?: 'orange' | 'red';
    } | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await apiService.adminGetUsers();
            setUsers(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = useMemo(() => {
        return users
            .filter(user => roleFilter === 'All' || user.role === roleFilter)
            .filter(user => statusFilter === 'All' || user.status === statusFilter)
            .filter(user => 
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [users, searchTerm, roleFilter, statusFilter]);

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleToggleLock = (user: AdminUserListItem) => {
        const isCurrentlyActive = user.status === 'active';
        setConfirmation({
            isOpen: true,
            title: `${isCurrentlyActive ? 'Khóa' : 'Mở khóa'} người dùng?`,
            message: `Bạn có chắc chắn muốn ${isCurrentlyActive ? 'khóa' : 'mở khóa'} tài khoản ${user.email}?`,
            onConfirm: () => {
                // Trong thực tế sẽ gọi API PUT/PATCH /admin/users/:id
                const newStatus: UserStatus = isCurrentlyActive ? 'inactive' : 'active';
                setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
                setConfirmation(null);
            },
            color: 'red'
        });
    };
    
    const handleDelete = (user: AdminUserListItem) => {
         setConfirmation({
            isOpen: true,
            title: 'Xóa người dùng?',
            message: `Hành động này sẽ đánh dấu tài khoản ${user.email} là đã xóa. Tiếp tục?`,
            onConfirm: () => {
                // Trong thực tế sẽ gọi API DELETE /admin/users/:id
                setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_deleted: true } : u));
                setConfirmation(null);
            },
            color: 'red'
        });
    }

    // FIX: Add function to map list data to full user object and open detail modal
    const handleViewDetail = (adminUser: AdminUserListItem) => {
        const detailedUser: User = {
            id: adminUser.id,
            name: adminUser.email.split('@')[0],
            email: adminUser.email,
            role: adminUser.role === 'admin' ? 'Admin' : 
                  adminUser.role === 'shipper' ? 'Shipper' : 
                  adminUser.role === 'seller' ? 'Merchant Owner' : 'Customer',
            status: adminUser.status === 'active' ? 'active' : 'inactive',
            createdAt: new Date(adminUser.created_at).toLocaleDateString('vi-VN'),
            lastLogin: adminUser.updated_at,
            sessions: [
                { id: '1', ip: '192.168.1.1', device: 'desktop', location: 'TP. Hồ Chí Minh', lastSeen: '10 phút trước' }
            ],
            activityLog: [
                { id: '1', action: 'Truy cập tài khoản', admin: 'Hệ thống', timestamp: adminUser.updated_at }
            ]
        };
        setSelectedUser(detailedUser);
        setIsDetailModalOpen(true);
    };

    // FIX: Add function to update state when details are changed in the modal
    const handleUpdateUser = (updatedUser: User) => {
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? { 
            ...u, 
            email: updatedUser.email,
            status: updatedUser.status === 'active' ? 'active' : 'inactive' 
        } : u));
        setSelectedUser(updatedUser);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusStyle = (status: UserStatus, isDeleted: boolean) => {
        if (isDeleted) return 'bg-gray-100 text-gray-500';
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'inactive': return 'bg-orange-100 text-orange-800';
            case 'banned': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: UserStatus, isDeleted: boolean) => {
        if (isDeleted) return 'Đã xóa';
        switch (status) {
            case 'active': return 'Hoạt động';
            case 'pending': return 'Chờ duyệt';
            case 'inactive': return 'Vô hiệu';
            case 'banned': return 'Bị cấm';
            default: return status;
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                <p className="text-gray-500">Đang tải danh sách người dùng...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
                <button onClick={fetchUsers} className="text-sm text-orange-600 hover:underline font-medium">Làm mới dữ liệu</button>
            </div>
            
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
                    {error}
                </div>
            )}

            <div className="bg-white p-4 rounded-lg shadow-md border flex flex-wrap items-center justify-between gap-4">
                <div className="relative flex-grow max-w-md">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </span>
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm theo email..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>
                <div className="flex items-center gap-4">
                     <select 
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                     >
                        <option value="All">Tất cả vai trò</option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                        <option value="shipper">Shipper</option>
                        <option value="seller">Seller</option>
                    </select>
                    <select 
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                     >
                        <option value="All">Tất cả trạng thái</option>
                        <option value="active">Hoạt động</option>
                        <option value="pending">Chờ duyệt</option>
                        <option value="inactive">Vô hiệu hóa</option>
                        <option value="banned">Bị cấm</option>
                    </select>
                    <button className="flex items-center text-white bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg shadow-sm text-sm">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Thêm mới
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md border overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tham gia</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedUsers.length > 0 ? paginatedUsers.map(user => (
                            <tr key={user.id} className={user.is_deleted ? 'bg-gray-50 opacity-75' : ''}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">#{user.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                                            <UserIcon className="h-4 w-4 text-orange-600"/>
                                        </div>
                                        <div className="text-sm font-medium text-gray-900">{user.email}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 text-xs font-semibold capitalize bg-blue-50 text-blue-700 rounded-md">
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(user.status, user.is_deleted)}`}>
                                        {getStatusText(user.status, user.is_deleted)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(user.created_at)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {!user.is_deleted && (
                                        <div className="flex justify-end space-x-3 items-center">
                                            {/* FIX: Add button to open detailed view modal */}
                                            <button 
                                                onClick={() => handleViewDetail(user)} 
                                                className="text-orange-600 hover:text-orange-900 font-semibold mr-2"
                                            >
                                                Chi tiết
                                            </button>
                                            <button 
                                                onClick={() => handleToggleLock(user)} 
                                                className="text-orange-600 hover:text-orange-900" 
                                                title={user.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                                            >
                                                <LockClosedIcon className="h-5 w-5"/>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(user)} 
                                                className="text-red-600 hover:text-red-900" 
                                                title="Xóa"
                                            >
                                                <TrashIcon className="h-5 w-5"/>
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                    Không tìm thấy người dùng nào phù hợp.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
                 <div className="flex justify-between items-center bg-white px-4 py-3 border rounded-lg">
                    <p className="text-sm text-gray-700">Hiển thị {paginatedUsers.length} trên {filteredUsers.length} kết quả</p>
                    <div className="flex items-center space-x-1">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-md disabled:opacity-50 hover:bg-gray-100"><ChevronLeftIcon className="h-5 w-5" /></button>
                        <span className="text-sm px-2 font-medium">{currentPage} / {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-md disabled:opacity-50 hover:bg-gray-100"><ChevronRightIcon className="h-5 w-5" /></button>
                    </div>
                </div>
            )}
            
            {/* FIX: Render the UserDetailModal when isDetailModalOpen is true */}
            {isDetailModalOpen && selectedUser && (
                <UserDetailModal 
                    isOpen={isDetailModalOpen} 
                    onClose={() => setIsDetailModalOpen(false)} 
                    user={selectedUser} 
                    onUpdateUser={handleUpdateUser} 
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

export default AdminUsersPage;
