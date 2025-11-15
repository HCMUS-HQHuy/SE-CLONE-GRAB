import React, { useState, useMemo, useEffect } from 'react';
import { SearchIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon, UserIcon, TrashIcon, PencilIcon, LockIcon as LockClosedIcon } from '../components/Icons';
import UserDetailModal from '../components/UserDetailModal';
import ConfirmationModal from '../components/ConfirmationModal';

type UserRole = 'Admin' | 'Customer' | 'Shipper' | 'Merchant Owner';
type UserStatus = 'active' | 'locked';

export type UserSession = {
    id: string;
    device: 'desktop' | 'mobile';
    ip: string;
    location: string;
    lastSeen: string;
};

export type ActivityLog = {
    id: number;
    admin: string;
    action: string;
    timestamp: string;
};

export type User = {
    id: number;
    name: string;
    email: string;
    avatar: string;
    role: UserRole;
    status: UserStatus;
    createdAt: string;
    lastLogin: string;
    sessions: UserSession[];
    activityLog: ActivityLog[];
};

// Mock Data
const mockUsers: User[] = [
    { id: 1, name: 'Admin One', email: 'admin@example.com', avatar: '', role: 'Admin', status: 'active', createdAt: '2023-01-15', lastLogin: '2024-07-30T10:00:00Z', sessions: [
        { id: 'sess1', device: 'desktop', ip: '192.168.1.1', location: 'HCMC, Vietnam', lastSeen: '2 giờ trước' }
    ], activityLog: [] },
    { id: 2, name: 'Nguyễn Văn A', email: 'nguyenvana@email.com', avatar: '', role: 'Customer', status: 'active', createdAt: '2023-05-20', lastLogin: '2024-07-29T14:30:00Z', sessions: [
        { id: 'sess2', device: 'mobile', ip: '203.0.113.25', location: 'Hanoi, Vietnam', lastSeen: '1 ngày trước' }
    ], activityLog: [{ id: 1, admin: 'Admin One', action: 'Đặt lại mật khẩu', timestamp: '2024-07-15T09:00:00Z' }] },
    { id: 3, name: 'Trần Văn An', email: 'tranvanan@shipper.com', avatar: '', role: 'Shipper', status: 'active', createdAt: '2023-06-10', lastLogin: '2024-07-30T08:00:00Z', sessions: [
        { id: 'sess3', device: 'mobile', ip: '198.51.100.10', location: 'Danang, Vietnam', lastSeen: '3 giờ trước' }
    ], activityLog: [] },
    { id: 4, name: 'Quán Ăn Gỗ Owner', email: 'owner@quanango.com', avatar: '', role: 'Merchant Owner', status: 'locked', createdAt: '2023-02-01', lastLogin: '2024-06-10T11:00:00Z', sessions: [], activityLog: [
        { id: 2, admin: 'Admin One', action: 'Khóa tài khoản', timestamp: '2024-07-20T15:00:00Z' }
    ] },
     ...Array.from({ length: 15 }, (_, i) => ({
        id: i + 5,
        name: `Customer User ${i + 1}`,
        email: `customer${i + 1}@example.com`,
        avatar: '',
        role: 'Customer' as UserRole,
        status: i % 3 === 0 ? 'locked' : 'active' as UserStatus,
        createdAt: `2024-0${Math.floor(i/5) + 1}-0${i%9 + 1}`,
        lastLogin: `2024-07-${10+i}T12:00:00Z`,
        sessions: [],
        activityLog: []
    }))
];

const ITEMS_PER_PAGE = 10;

const AdminUsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>(mockUsers);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    
    const [confirmation, setConfirmation] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        color?: 'orange' | 'red';
    } | null>(null);

    const filteredUsers = useMemo(() => {
        return users
            .filter(user => roleFilter === 'All' || user.role === roleFilter)
            .filter(user => 
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [users, searchTerm, roleFilter]);

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleViewDetails = (user: User) => {
        setSelectedUser(user);
        setIsDetailModalOpen(true);
    };

    const handleUpdateUser = (updatedUser: User) => {
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    };

    const handleToggleLock = (user: User) => {
        setConfirmation({
            isOpen: true,
            title: `${user.status === 'active' ? 'Khóa' : 'Mở khóa'} người dùng?`,
            message: `Bạn có chắc chắn muốn ${user.status === 'active' ? 'khóa' : 'mở khóa'} tài khoản ${user.name}?`,
            onConfirm: () => {
                const newStatus = user.status === 'active' ? 'locked' : 'active';
                handleUpdateUser({ ...user, status: newStatus });
                setConfirmation(null);
            },
            color: 'red'
        });
    };
    
    const handleDelete = (user: User) => {
         setConfirmation({
            isOpen: true,
            title: 'Xóa người dùng?',
            message: `Hành động này không thể hoàn tác. Bạn có chắc muốn xóa vĩnh viễn tài khoản ${user.name}?`,
            onConfirm: () => {
                setUsers(prev => prev.filter(u => u.id !== user.id));
                setConfirmation(null);
            },
            color: 'red'
        });
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
            
            <div className="bg-white p-4 rounded-lg shadow-md border flex flex-wrap items-center justify-between gap-4">
                <div className="relative flex-grow max-w-md">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </span>
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm theo tên hoặc email..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>
                <div className="flex items-center gap-4">
                     <select 
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                     >
                        <option value="All">Tất cả vai trò</option>
                        <option value="Admin">Admin</option>
                        <option value="Customer">Customer</option>
                        <option value="Shipper">Shipper</option>
                        <option value="Merchant Owner">Merchant Owner</option>
                    </select>
                    <button className="flex items-center text-white bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg shadow-sm">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Thêm người dùng
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md border overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người dùng</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedUsers.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                            <UserIcon className="h-6 w-6 text-gray-500"/>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{user.name}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {user.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.createdAt}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="relative inline-block text-left">
                                        <button onClick={() => handleViewDetails(user)} className="text-orange-600 hover:text-orange-900 font-semibold mr-4">Xem chi tiết</button>
                                        <button onClick={() => handleToggleLock(user)} className="text-yellow-600 hover:text-yellow-900 mr-4" title={user.status === 'active' ? 'Khóa' : 'Mở khóa'}>
                                            <LockClosedIcon className="h-5 w-5"/>
                                        </button>
                                        <button onClick={() => handleDelete(user)} className="text-red-600 hover:text-red-900" title="Xóa">
                                            <TrashIcon className="h-5 w-5"/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
                 <div className="flex justify-between items-center bg-white px-4 py-3 border-t rounded-b-lg">
                    <p className="text-sm text-gray-700">Hiển thị {paginatedUsers.length} trên {filteredUsers.length} kết quả</p>
                    <div className="flex items-center space-x-1">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-md disabled:opacity-50 hover:bg-gray-100"><ChevronLeftIcon className="h-5 w-5" /></button>
                        <span className="text-sm">{currentPage} / {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-md disabled:opacity-50 hover:bg-gray-100"><ChevronRightIcon className="h-5 w-5" /></button>
                    </div>
                </div>
            )}

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