import React, { useState } from 'react';
import { ShieldCheckIcon, CogIcon, FlagIcon, BanIcon, BookOpenIcon, ServerIcon, TagIcon, PlusIcon, PencilIcon, TrashIcon } from '../components/Icons';
import RoleEditorModal from '../components/RoleEditorModal';
import PromotionEditorModal from '../components/PromotionEditorModal';

type ActiveTab = 'roles' | 'config' | 'security' | 'logs' | 'backup' | 'promotions';

const AdminSettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('roles');
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

    const NavItem: React.FC<{ tabId: ActiveTab, icon: React.ReactNode, text: string }> = ({ tabId, icon, text }) => (
        <button onClick={() => setActiveTab(tabId)} className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === tabId ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-50'}`}>
            {icon}
            <span className="ml-3">{text}</span>
        </button>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'roles': return <RolesPermissions />;
            case 'config': return <ConfigFeatureFlags />;
            case 'security': return <SecurityBlacklist />;
            case 'logs': return <AuditLogs />;
            case 'backup': return <BackupRestore />;
            case 'promotions': return <Promotions onOpenModal={() => setIsPromoModalOpen(true)} />;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <aside className="w-full md:w-64 flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Cài đặt Hệ thống</h1>
                <nav className="space-y-2">
                    <NavItem tabId="roles" icon={<ShieldCheckIcon className="h-5 w-5"/>} text="Phân quyền & Vai trò" />
                    <NavItem tabId="config" icon={<CogIcon className="h-5 w-5"/>} text="Cấu hình & Feature Flags" />
                    <NavItem tabId="security" icon={<BanIcon className="h-5 w-5"/>} text="Bảo mật & Blacklist" />
                    <NavItem tabId="logs" icon={<BookOpenIcon className="h-5 w-5"/>} text="Nhật ký Hệ thống" />
                    <NavItem tabId="backup" icon={<ServerIcon className="h-5 w-5"/>} text="Sao lưu & Phục hồi" />
                    <NavItem tabId="promotions" icon={<TagIcon className="h-5 w-5"/>} text="Quản lý Khuyến mãi" />
                </nav>
            </aside>
            <main className="flex-grow bg-white p-6 rounded-lg shadow-md border">
                {renderContent()}
            </main>
            <RoleEditorModal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} onSave={() => {}} roleToEdit={null} />
            <PromotionEditorModal isOpen={isPromoModalOpen} onClose={() => setIsPromoModalOpen(false)} onSave={() => {}} promotionToEdit={null} />
        </div>
    );
};

// --- SUB-COMPONENTS FOR EACH TAB ---

const RolesPermissions: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Quản lý Vai trò</h2>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary"><PlusIcon className="h-5 w-5 mr-2"/>Tạo vai trò mới</button>
            </div>
            <div className="space-y-3">
                {['Super Admin', 'Operations', 'Support'].map(role => (
                    <div key={role} className="p-3 border rounded-lg flex justify-between items-center">
                        <p className="font-semibold">{role}</p>
                        <button onClick={() => setIsModalOpen(true)} className="text-sm text-orange-600 hover:underline">Chỉnh sửa</button>
                    </div>
                ))}
            </div>
            <RoleEditorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={() => {}} roleToEdit={null} />
        </div>
    );
};

const ConfigFeatureFlags: React.FC = () => (
    <div className="space-y-6">
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Cấu hình Hệ thống</h2>
            <div className="grid grid-cols-2 gap-4">
                <div className="form-group"><label>Thời gian hủy đơn tự động (phút)</label><input type="number" defaultValue="15" className="input-field"/></div>
                <div className="form-group"><label>Phí nền tảng (%)</label><input type="number" defaultValue="5" className="input-field"/></div>
            </div>
        </div>
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Feature Flags</h2>
            <div className="space-y-2">
                <div className="flex justify-between items-center"><label>Bật tính năng A/B Test giao diện</label><ToggleSwitch /></div>
                <div className="flex justify-between items-center"><label>Kích hoạt chế độ bảo trì</label><ToggleSwitch /></div>
            </div>
        </div>
    </div>
);

const SecurityBlacklist: React.FC = () => (
    <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quản lý Blacklist</h2>
        <div className="grid grid-cols-2 gap-4">
            <div className="border p-3 rounded-lg"><h3 className="font-semibold">IP Blacklist</h3><p className="text-sm text-gray-600">123.45.67.89</p></div>
            <div className="border p-3 rounded-lg"><h3 className="font-semibold">Device Blacklist</h3><p className="text-sm text-gray-600">device-fingerprint-xyz</p></div>
        </div>
    </div>
);

const AuditLogs: React.FC = () => (
    <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Nhật ký Hệ thống</h2>
        <div className="text-sm border rounded-lg p-3">
            <p>[2024-08-01 10:00] Admin One đã thay đổi vai trò của 'user@example.com' thành 'Shipper'.</p>
            <p>[2024-08-01 09:30] Admin Two đã cập nhật Feature Flag 'MAINTENANCE_MODE' thành 'true'.</p>
        </div>
    </div>
);

const BackupRestore: React.FC = () => (
     <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Sao lưu & Phục hồi</h2>
        <button className="btn-primary mb-4">Sao lưu toàn bộ hệ thống ngay</button>
        <div className="border rounded-lg p-3">
            <h3 className="font-semibold mb-2">Lịch sử sao lưu</h3>
            <p className="text-sm">2024-08-01 02:00:00 - auto_backup_full.zip (512MB)</p>
        </div>
    </div>
);

const Promotions: React.FC<{ onOpenModal: () => void }> = ({ onOpenModal }) => (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Quản lý Khuyến mãi Toàn hệ thống</h2>
            <button onClick={onOpenModal} className="btn-primary"><PlusIcon className="h-5 w-5 mr-2"/>Tạo mã mới</button>
        </div>
        <div className="p-3 border rounded-lg flex justify-between items-center">
            <p><span className="font-semibold">HELLONEW</span> - 15% cho người dùng mới</p>
            <div className="flex space-x-2"><button><PencilIcon className="h-5 w-5 text-gray-500"/></button><button><TrashIcon className="h-5 w-5 text-gray-500"/></button></div>
        </div>
    </div>
);


const ToggleSwitch: React.FC = () => {
    const [checked, setChecked] = useState(false);
    return (
        <button onClick={() => setChecked(!checked)} role="switch" aria-checked={checked} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-orange-500' : 'bg-gray-200'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );
};


export default AdminSettingsPage;

// Add some basic styling for form elements within the page
const GlobalStyles = () => (
    <style>{`
        .btn-primary { display: inline-flex; align-items: center; padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; background-color: #ea580c; color: white; border-radius: 0.5rem; transition: background-color 0.2s; }
        .btn-primary:hover { background-color: #c2410c; }
        .form-group { display: flex; flex-direction: column; }
        .form-group label { margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #4b5563; }
        .input-field { border: 1px solid #D1D5DB; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; }
        .input-field:focus { outline: none; border-color: #F97316; box-shadow: 0 0 0 2px #FDBA74; }
    `}</style>
);

// We can inject styles by including the component, or define them in the main component. This is just for demonstration.
AdminSettingsPage.displayName = "AdminSettingsPage";
Object.assign(AdminSettingsPage, { GlobalStyles });
