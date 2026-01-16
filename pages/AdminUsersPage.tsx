
import React, { useState, useMemo, useEffect } from 'react';
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon, UserIcon, TrashIcon, LockIcon as LockClosedIcon, LockOpenIcon } from '../components/Icons';
import { apiService, AdminUserListItem, UserStatus } from '../services/api';
import ConfirmationModal from '../components/ConfirmationModal';

// FIX: Export missing types required by UserDetailModal.tsx
export type UserSession = {
    id: string;
    device: 'desktop' | 'mobile';
    ip: string;
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
    status: 'active' | 'locked';
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

    const handleUpdateUserStatus = async (userId: number, newStatus: UserStatus) => {
        try {
            await apiService.adminUpdateUserStatus(userId, newStatus);
            fetchUsers();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleToggleLock = (user: AdminUserListItem) => {
        const isCurrentlyActive = user.status === 'active';
        const targetStatus: UserStatus = isCurrentlyActive ? 'inactive' : 'active';
        
        setConfirmation({
            isOpen: true,
            title: `${isCurrentlyActive ? 'Khóa' : 'Mở khóa'} tài khoản?`,
            message: `Bạn muốn ${isCurrentlyActive ? 'khóa' : 'mở khóa'} tài khoản ${user.email}?`,
            onConfirm: () => {
                handleUpdateUserStatus(user.id, targetStatus);
                setConfirmation(null);
            },
            color: isCurrentlyActive ? 'red' : 'orange'
        });
    };
    
    const handleDelete = (user: AdminUserListItem) => {
         setConfirmation({
            isOpen: true,
            title: 'Xóa vĩnh viễn?',
            message: `Hành động này không thể hoàn tác. Xóa tài khoản ${user.email}?`,
            onConfirm: async () => {
                try {
                    await apiService.adminDeleteUser(user.id);
                    fetchUsers();
                } catch (err: any) {
                    alert(err.message);
                }
                setConfirmation(null);
            },
            color: 'red'
        });
    };

    const getStatusStyle = (status: UserStatus, isDeleted: boolean) => {
        if (isDeleted) return 'bg-gray-100 text-gray-500';
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'banned': return 'bg-gray-800 text-white';
            default: return 'bg-gray-100 text-gray-800';
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
            <h1 className="text-3xl font-bold text-gray-900">Danh sách Người dùng</h1>
            
            <div className="bg-white p-4 rounded-lg shadow-md border flex flex-wrap items-center justify-between gap-4">
                <div className="relative flex-grow max-w-md">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </span>
                    <input 
                        type="text" 
                        placeholder="Tìm email..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>
                <div className="flex items-center gap-4">
                     <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="border p-2 rounded-lg text-sm">
                        <option value="All">Tất cả vai trò</option>
                        <option value="user">Khách hàng</option>
                        <option value="seller">Chủ quán</option>
                        <option value="shipper">Tài xế</option>
                        <option value="admin">Quản trị viên</option>
                    </select>
                    <button onClick={fetchUsers} className="text-sm text-orange-600 font-medium">Làm mới</button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedUsers.map(user => (
                            <tr key={user.id} className={user.is_deleted ? 'bg-gray-50' : ''}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold mr-3">
                                            {user.email.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">{user.email}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusStyle(user.status, user.is_deleted)}`}>
                                        {user.is_deleted ? 'Đã xóa' : (user.status === 'active' ? 'Hoạt động' : 'Đã khóa')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {!user.is_deleted && (
                                        <div className="flex justify-end space-x-3">
                                            <button 
                                                onClick={() => handleToggleLock(user)} 
                                                className={`p-2 rounded-full transition-colors ${user.status === 'active' ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                                                title={user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa'}
                                            >
                                                {user.status === 'active' ? <LockClosedIcon className="h-5 w-5" /> : <LockOpenIcon className="h-5 w-5" />}
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(user)} 
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                title="Xóa vĩnh viễn"
                                            >
                                                <TrashIcon className="h-5 w-5"/>
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {totalPages > 1 && (
                 <div className="flex justify-center items-center space-x-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"><ChevronLeftIcon className="h-5 w-5"/></button>
                    <span className="text-sm">{currentPage} / {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"><ChevronRightIcon className="h-5 w-5"/></button>
                </div>
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
