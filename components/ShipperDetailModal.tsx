import React, { useState, useEffect } from 'react';
import { 
    XIcon, UserIcon, PencilIcon, IdentificationIcon, CheckBadgeIcon, ClockIcon, TicketIcon, ShieldCheckIcon, 
    MapIcon, LockIcon as LockClosedIcon, ExclamationIcon
} from './Icons';

// Types
export type ShipperStatus = 'active' | 'pending-KYC' | 'suspended' | 'blocked' | 'deleted';
export type KycStatus = 'pending' | 'approved' | 'rejected';
type ShipperOrder = { id: string; date: string; status: 'completed' | 'cancelled'; earnings: number; };
type ShipperTicket = { id: string; subject: string; status: 'open' | 'resolved'; };
type ShipperDevice = { id: string; model: string; os: string; fingerprint: string; imei: string; };
type ShipperSession = { ip: string; timestamp: string; };

export type Shipper = {
    id: number;
    name: string;
    phone: string;
    avatar: string;
    status: ShipperStatus;
    kycStatus: KycStatus;
    createdAt: string;
    vehicle: { licensePlate: string; model: string; };
    documents: { idCardUrl: string; driverLicenseUrl: string; };
    orders: ShipperOrder[];
    currentLocation?: { lat: number; lon: number };
    tickets: ShipperTicket[];
    security: { devices: ShipperDevice[]; sessions: ShipperSession[]; fraudAlerts: string[]; };
};

type ShipperDetailModalProps = {
    isOpen: boolean;
    onClose: () => void;
    shipper: Shipper;
    onUpdate: (updatedShipper: Shipper) => void;
};

type ActiveTab = 'profile' | 'activity' | 'support' | 'security';

const ShipperDetailModal: React.FC<ShipperDetailModalProps> = ({ isOpen, onClose, shipper, onUpdate }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
    
    useEffect(() => { setActiveTab('profile'); }, [shipper]); // Reset to first tab when shipper changes
    if (!isOpen) return null;

    const TabButton: React.FC<{ tabId: ActiveTab; label: string; icon: React.ReactNode }> = ({ tabId, label, icon }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
                activeTab === tabId ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
            {icon}<span className="ml-2">{label}</span>
        </button>
    );

    const ProfileTab = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <h4 className="font-semibold text-gray-800">Thông tin cá nhân</h4>
                <p><span className="label">Tên:</span> <span className="value">{shipper.name}</span></p>
                <p><span className="label">SĐT:</span> <span className="value">{shipper.phone}</span></p>
                <p><span className="label">Ngày tham gia:</span> <span className="value">{shipper.createdAt}</span></p>
                <h4 className="font-semibold text-gray-800 pt-4">Thông tin phương tiện</h4>
                <p><span className="label">Biển số:</span> <span className="value">{shipper.vehicle.licensePlate}</span></p>
                <p><span className="label">Loại xe:</span> <span className="value">{shipper.vehicle.model}</span></p>
            </div>
            <div>
                 <h4 className="font-semibold text-gray-800">Hồ sơ định danh (KYC)</h4>
                 {shipper.kycStatus === 'pending' && <button onClick={() => onUpdate({...shipper, kycStatus: 'approved', status: 'active'})} className="my-2 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"><CheckBadgeIcon className="h-4 w-4 mr-2"/>Duyệt hồ sơ</button>}
                 <p><span className="label">Trạng thái:</span> <span className="value font-bold">{shipper.kycStatus === 'approved' ? 'Đã duyệt' : 'Đang chờ'}</span></p>
                 <div className="flex space-x-4 mt-2">
                    <div className="text-center"><img src={shipper.documents.idCardUrl} alt="CCCD" className="h-24 w-36 object-cover rounded border"/><p className="text-xs mt-1">CCCD</p></div>
                    <div className="text-center"><img src={shipper.documents.driverLicenseUrl} alt="GPLX" className="h-24 w-36 object-cover rounded border"/><p className="text-xs mt-1">Bằng lái</p></div>
                 </div>
            </div>
        </div>
    );
    
    const ActivityTab = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h4 className="font-semibold text-gray-800 mb-2">Vị trí & Hành trình</h4>
                <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 mb-4">Bản đồ (mô phỏng)</div>
                <p className="text-sm"><span className="label">Vị trí hiện tại:</span> 10.7769, 106.7009 (Cập nhật 2 phút trước)</p>
                <button className="text-sm text-orange-600 hover:underline mt-2">Phát lại hành trình đơn gần nhất</button>

                <h4 className="font-semibold text-gray-800 mt-4 mb-2">Cảnh báo bất thường</h4>
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md text-sm">
                    <p>⚠️ Dừng lại quá lâu (15 phút) tại đơn #12345</p>
                    <p>⚠️ Lệch khỏi tuyến đường đề xuất 1.2km</p>
                </div>
            </div>
             <div>
                <h4 className="font-semibold text-gray-800 mb-2">Đơn hàng gần đây</h4>
                <ul className="divide-y">
                    {shipper.orders.map(order => (
                        <li key={order.id} className="py-2">
                            <p className="font-medium">{order.id} - <span className="font-normal text-sm">{new Date(order.date).toLocaleDateString('vi-VN')}</span></p>
                            <p className="text-sm text-gray-600">Trạng thái: {order.status} | Thu nhập: {new Intl.NumberFormat('vi-VN').format(order.earnings)}đ</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );

    const SupportTab = () => (
         <div>
            <h4 className="font-semibold text-gray-800 mb-2">Ticket hỗ trợ liên quan</h4>
            {shipper.tickets.map(ticket => (
                <div key={ticket.id} className="p-3 border-b flex justify-between items-center">
                    <div>
                        <p className="font-medium">{ticket.id} - <span className="font-normal text-sm">{ticket.subject}</span></p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ticket.status === 'open' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{ticket.status}</span>
                </div>
            ))}
        </div>
    );

    const SecurityTab = () => (
        <div className="space-y-6">
            <div>
                <h4 className="font-semibold text-red-600 mb-2">Cảnh báo gian lận</h4>
                {shipper.security.fraudAlerts.map((alert, i) => <p key={i} className="text-sm text-red-700 flex items-center"><ExclamationIcon className="h-4 w-4 mr-2"/>{alert}</p>)}
            </div>
            <div>
                <h4 className="font-semibold text-gray-800 mb-2">Thiết bị đã đăng ký</h4>
                {shipper.security.devices.map(dev => <p key={dev.id} className="text-sm text-gray-600">{dev.model} ({dev.os}) - IMEI: {dev.imei}</p>)}
                <button className="btn-secondary mt-2"><LockClosedIcon className="h-4 w-4 mr-2"/>Khóa thiết bị</button>
            </div>
            <div>
                <h4 className="font-semibold text-gray-800 mb-2">IP đăng nhập gần đây</h4>
                {shipper.security.sessions.map((sess, i) => <p key={i} className="text-sm text-gray-600">{sess.ip} - {sess.timestamp}</p>)}
                <button className="btn-secondary mt-2"><LockClosedIcon className="h-4 w-4 mr-2"/>Khóa IP</button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><XIcon className="h-6 w-6" /></button>
                <div className="p-6 border-b"><h2 className="text-2xl font-bold text-gray-900">Chi tiết Tài xế: {shipper.name}</h2></div>
                <div className="p-6 flex-grow overflow-y-auto">
                    <div className="flex space-x-2 border-b mb-6 pb-2">
                        <TabButton tabId="profile" label="Hồ sơ & KYC" icon={<IdentificationIcon className="h-5 w-5"/>}/>
                        <TabButton tabId="activity" label="Hoạt động & GPS" icon={<MapIcon className="h-5 w-5"/>}/>
                        <TabButton tabId="support" label="Hỗ trợ" icon={<TicketIcon className="h-5 w-5"/>}/>
                        <TabButton tabId="security" label="Bảo mật" icon={<ShieldCheckIcon className="h-5 w-5"/>}/>
                    </div>
                    {activeTab === 'profile' && <ProfileTab />}
                    {activeTab === 'activity' && <ActivityTab />}
                    {activeTab === 'support' && <SupportTab />}
                    {activeTab === 'security' && <SecurityTab />}
                </div>
                <div className="p-4 border-t bg-gray-50 flex justify-end">
                    <button onClick={onClose} className="btn-primary">Đóng</button>
                </div>
            </div>
             <style>{`
                .label { font-weight: 500; color: #6B7281; margin-right: 8px; }
                .value { font-weight: 600; color: #1F2937; }
                .btn-secondary { display:inline-flex; align-items:center; padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; background-color: white; color: #374151; border: 1px solid #D1D5DB; border-radius: 0.375rem; }
                .btn-primary { padding: 0.5rem 1.5rem; font-size: 0.875rem; font-weight: 500; background-color: #4B5563; color: white; border-radius: 0.375rem; }
            `}</style>
        </div>
    );
};

export default ShipperDetailModal;
