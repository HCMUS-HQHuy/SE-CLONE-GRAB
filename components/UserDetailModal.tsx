import React, { useState, useEffect } from 'react';
import { User, UserSession, ActivityLog } from '../pages/AdminUsersPage';
import { 
    XIcon, UserIcon, PencilIcon, LoginIcon, KeyIcon, ShieldExclamationIcon, 
    DesktopComputerIcon, DeviceMobileIcon, TrashIcon 
} from './Icons';

type UserDetailModalProps = {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onUpdateUser: (user: User) => void;
};

type ActiveTab = 'profile' | 'security' | 'activity';

const UserDetailModal: React.FC<UserDetailModalProps> = ({ isOpen, onClose, user, onUpdateUser }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState<User>(user);

    useEffect(() => {
        setEditedUser(user);
        setIsEditing(false); // Reset editing state when user changes
    }, [user]);

    if (!isOpen) return null;

    const handleSave = () => {
        onUpdateUser(editedUser);
        setIsEditing(false);
    };

    const handleImpersonate = () => {
        alert(`Đang đăng nhập với tư cách ${user.name}... (Tính năng mô phỏng)`);
        onClose();
    };

    const handleResetPassword = () => {
        alert(`Đã gửi email đặt lại mật khẩu cho ${user.name}. (Tính năng mô phỏng)`);
    };

    const TabButton: React.FC<{ tabId: ActiveTab; label: string; }> = ({ tabId, label }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === tabId ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
        >{label}</button>
    );

    const ProfileTab = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-500">Họ và tên</label>
                    {isEditing ? (
                        <input type="text" value={editedUser.name} onChange={e => setEditedUser({...editedUser, name: e.target.value})} className="mt-1 w-full input-field"/>
                    ) : (
                        <p className="font-semibold text-gray-800">{user.name}</p>
                    )}
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    {isEditing ? (
                        <input type="email" value={editedUser.email} onChange={e => setEditedUser({...editedUser, email: e.target.value})} className="mt-1 w-full input-field"/>
                    ) : (
                        <p className="font-semibold text-gray-800">{user.email}</p>
                    )}
                </div>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-500">Vai trò</label>
                    {isEditing ? (
                        <select value={editedUser.role} onChange={e => setEditedUser({...editedUser, role: e.target.value as User['role']})} className="mt-1 w-full input-field">
                            <option>Admin</option>
                            <option>Customer</option>
                            <option>Shipper</option>
                            <option>Merchant Owner</option>
                        </select>
                    ) : (
                        <p className="font-semibold text-gray-800">{user.role}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-500">Trạng thái</label>
                     <p className="font-semibold text-gray-800 flex items-center">
                        <span className={`h-2 w-2 rounded-full mr-2 ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {user.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                    </p>
                </div>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-500">Ngày tạo</label>
                    <p className="font-semibold text-gray-800">{user.createdAt}</p>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-500">Đăng nhập lần cuối</label>
                    <p className="font-semibold text-gray-800">{new Date(user.lastLogin).toLocaleString('vi-VN')}</p>
                </div>
            </div>
        </div>
    );

    const SecurityTab = () => (
        <div>
            <h4 className="font-semibold text-gray-800 mb-3">Phiên đăng nhập đang hoạt động</h4>
            <ul className="divide-y divide-gray-200">
                {user.sessions.map(session => (
                    <li key={session.id} className="py-3 flex items-center justify-between">
                        <div className="flex items-center">
                            {session.device === 'desktop' ? <DesktopComputerIcon className="h-8 w-8 text-gray-500 mr-3"/> : <DeviceMobileIcon className="h-8 w-8 text-gray-500 mr-3"/>}
                            <div>
                                <p className="font-medium text-gray-800">{session.ip} <span className="text-gray-500">({session.location})</span></p>
                                <p className="text-sm text-gray-500">Hoạt động lần cuối: {session.lastSeen}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                             <button className="text-sm text-red-600 hover:underline">Xóa phiên</button>
                             <button className="text-sm text-red-600 hover:underline">Chặn IP</button>
                        </div>
                    </li>
                ))}
                 {user.sessions.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Không có phiên nào đang hoạt động.</p>}
            </ul>
        </div>
    );
    
    const ActivityLogTab = () => (
         <div>
            <h4 className="font-semibold text-gray-800 mb-3">Nhật ký hoạt động của quản trị viên</h4>
             <ul className="divide-y divide-gray-200">
                {user.activityLog.map(log => (
                    <li key={log.id} className="py-3">
                        <p className="font-medium text-gray-800">{log.action}</p>
                        <p className="text-sm text-gray-500">Thực hiện bởi <span className="font-semibold">{log.admin}</span> lúc {new Date(log.timestamp).toLocaleString('vi-VN')}</p>
                    </li>
                ))}
                 {user.activityLog.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Chưa có hoạt động nào.</p>}
            </ul>
        </div>
    );


    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><XIcon className="h-6 w-6" /></button>
                
                {/* Header */}
                <div className="p-6 border-b flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mr-4"><UserIcon className="h-10 w-10 text-gray-500"/></div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                            <p className="text-gray-500">{user.email}</p>
                        </div>
                    </div>
                    <button onClick={handleImpersonate} className="flex items-center text-sm font-medium bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg">
                        <LoginIcon className="h-5 w-5 mr-2"/>
                        Đăng nhập với tư cách người dùng này
                    </button>
                </div>
                
                {/* Tabs & Content */}
                <div className="p-6 flex-grow overflow-y-auto">
                    <div className="flex space-x-2 border-b mb-6 pb-2">
                        <TabButton tabId="profile" label="Hồ sơ" />
                        <TabButton tabId="security" label="Bảo mật" />
                        <TabButton tabId="activity" label="Nhật ký hoạt động" />
                    </div>
                    <div>
                        {activeTab === 'profile' && <ProfileTab />}
                        {activeTab === 'security' && <SecurityTab />}
                        {activeTab === 'activity' && <ActivityLogTab />}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
                    <button onClick={handleResetPassword} className="flex items-center text-sm font-medium text-yellow-600 hover:underline">
                        <KeyIcon className="h-5 w-5 mr-2"/>
                        Reset Mật khẩu
                    </button>
                    <div className="flex space-x-3">
                        {isEditing ? (
                            <>
                                <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md">Hủy</button>
                                <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md">Lưu</button>
                            </>
                        ) : (
                             <button onClick={() => setIsEditing(true)} className="flex items-center px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md">
                                <PencilIcon className="h-4 w-4 mr-2"/>
                                Chỉnh sửa
                            </button>
                        )}
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-md">Đóng</button>
                    </div>
                </div>
                 <style>{`.input-field { border: 1px solid #D1D5DB; border-radius: 0.375rem; padding: 0.5rem 0.75rem; } .input-field:focus { outline: none; border-color: #F97316; box-shadow: 0 0 0 1px #F97316; }`}</style>
            </div>
        </div>
    );
};

export default UserDetailModal;
