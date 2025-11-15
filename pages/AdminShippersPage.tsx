import React, { useState, useMemo } from 'react';
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon, UserIcon, CheckBadgeIcon, LockIcon as LockClosedIcon } from '../components/Icons';
import ShipperDetailModal, { Shipper } from '../components/ShipperDetailModal';
import ConfirmationModal from '../components/ConfirmationModal';

// Mock Data
const mockShippers: Shipper[] = [
    { 
        id: 1, name: 'Trần Văn An', phone: '0912345678', avatar: '', status: 'active', kycStatus: 'approved', createdAt: '2023-06-10',
        vehicle: { licensePlate: '59-T1 123.45', model: 'Honda Wave Alpha' },
        documents: { idCardUrl: 'https://via.placeholder.com/150/f0f0f0/000000?text=CCCD', driverLicenseUrl: 'https://via.placeholder.com/150/f0f0f0/000000?text=GPLX' },
        orders: [{ id: '#12348', date: '2024-07-30', status: 'completed', earnings: 25000 }],
        currentLocation: { lat: 10.7769, lon: 106.7009 },
        tickets: [{ id: 'STICKET-01', subject: 'Khách hàng báo không nhận được hàng', status: 'open' }],
        security: { 
            devices: [{ id: 'dev1', model: 'iPhone 13', os: 'iOS 17.5', fingerprint: 'fp123', imei: 'imei123' }],
            sessions: [{ ip: '198.51.100.10', timestamp: '2024-07-30 08:00' }],
            fraudAlerts: ['Phát hiện nghi vấn giả mạo GPS ngày 25/07.']
        }
    },
    { 
        id: 2, name: 'Lê Thị B', phone: '0987654321', avatar: '', status: 'pending-KYC', kycStatus: 'pending', createdAt: '2024-07-28',
        vehicle: { licensePlate: '60-A1 543.21', model: 'Yamaha Sirius' },
        documents: { idCardUrl: 'https://via.placeholder.com/150', driverLicenseUrl: 'https://via.placeholder.com/150' },
        orders: [], tickets: [], security: { devices: [], sessions: [], fraudAlerts: [] }
    },
    { 
        id: 3, name: 'Phạm Văn C', phone: '0905123123', avatar: '', status: 'suspended', kycStatus: 'approved', createdAt: '2023-11-05',
        vehicle: { licensePlate: '29-H1 987.65', model: 'Honda Vision' },
        documents: { idCardUrl: 'https://via.placeholder.com/150', driverLicenseUrl: 'https://via.placeholder.com/150' },
        orders: [], tickets: [], security: { devices: [], sessions: [], fraudAlerts: ['Tài khoản đăng nhập trên nhiều thiết bị đáng ngờ.'] }
    },
];

const ITEMS_PER_PAGE = 10;

const StatusBadge: React.FC<{ status: Shipper['status'] }> = ({ status }) => {
    const styles = { active: 'bg-green-100 text-green-800', 'pending-KYC': 'bg-blue-100 text-blue-800', suspended: 'bg-yellow-100 text-yellow-800', blocked: 'bg-red-100 text-red-800', deleted: 'bg-gray-100 text-gray-800' };
    const text = { active: 'Đang hoạt động', 'pending-KYC': 'Chờ duyệt KYC', suspended: 'Bị khóa', blocked: 'Bị chặn', deleted: 'Đã xóa' };
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>{text[status]}</span>;
};

const KycBadge: React.FC<{ status: Shipper['kycStatus'] }> = ({ status }) => {
    const styles = { approved: 'text-green-600', pending: 'text-blue-600', rejected: 'text-red-600' };
    const text = { approved: 'Đã duyệt', pending: 'Đang chờ', rejected: 'Bị từ chối' };
    return <span className={`text-sm font-medium ${styles[status]}`}>{text[status]}</span>;
};


const AdminShippersPage: React.FC = () => {
    const [shippers, setShippers] = useState<Shipper[]>(mockShippers);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    
    const [selectedShipper, setSelectedShipper] = useState<Shipper | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    
    const [confirmation, setConfirmation] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; color?: 'orange' | 'red'; } | null>(null);

    const filteredShippers = useMemo(() => {
        return shippers
            .filter(s => statusFilter === 'All' || s.status === statusFilter)
            .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [shippers, searchTerm, statusFilter]);

    const paginatedShippers = filteredShippers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleUpdateShipper = (updatedShipper: Shipper) => {
        setShippers(prev => prev.map(s => s.id === updatedShipper.id ? updatedShipper : s));
        if (selectedShipper?.id === updatedShipper.id) {
            setSelectedShipper(updatedShipper);
        }
    };

    const handleApproveKyc = (shipper: Shipper) => {
        setConfirmation({
            isOpen: true,
            title: 'Duyệt hồ sơ KYC?',
            message: `Bạn có chắc muốn duyệt hồ sơ cho tài xế ${shipper.name}?`,
            onConfirm: () => {
                handleUpdateShipper({ ...shipper, kycStatus: 'approved', status: 'active' });
                setConfirmation(null);
            },
            color: 'orange'
        });
    };
    
    const handleToggleLock = (shipper: Shipper) => {
        const isLocking = shipper.status !== 'suspended';
        setConfirmation({
            isOpen: true,
            title: `${isLocking ? 'Khóa' : 'Mở khóa'} tài xế?`,
            message: `Bạn có chắc muốn ${isLocking ? 'khóa' : 'mở khóa'} tài khoản của ${shipper.name}?`,
            onConfirm: () => {
                handleUpdateShipper({ ...shipper, status: isLocking ? 'suspended' : 'active' });
                setConfirmation(null);
            },
            color: 'red'
        });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Tài xế</h1>
            
            <div className="bg-white p-4 rounded-lg shadow-md border flex flex-wrap items-center justify-between gap-4">
                <div className="relative flex-grow max-w-md">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3"><SearchIcon className="h-5 w-5 text-gray-400" /></span>
                    <input type="text" placeholder="Tìm kiếm tài xế..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div className="flex items-center gap-4">
                     <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <option value="All">Tất cả trạng thái</option>
                        <option value="active">Đang hoạt động</option>
                        <option value="pending-KYC">Chờ duyệt KYC</option>
                        <option value="suspended">Bị khóa</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md border overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tài xế</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái hoạt động</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái KYC</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tham gia</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedShippers.map(shipper => (
                            <tr key={shipper.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3"><UserIcon className="h-6 w-6 text-gray-500"/></div>
                                        <div>
                                            <div className="font-medium text-gray-900">{shipper.name}</div>
                                            <div className="text-sm text-gray-500">{shipper.phone}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={shipper.status} /></td>
                                <td className="px-6 py-4 whitespace-nowrap"><KycBadge status={shipper.kycStatus} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{shipper.createdAt}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {shipper.kycStatus === 'pending' && <button onClick={() => handleApproveKyc(shipper)} className="text-green-600 hover:text-green-900 mr-4 font-semibold inline-flex items-center"><CheckBadgeIcon className="h-4 w-4 mr-1"/>Duyệt</button>}
                                    <button onClick={() => handleToggleLock(shipper)} className={`mr-4 font-semibold inline-flex items-center ${shipper.status !== 'suspended' ? 'text-yellow-600 hover:text-yellow-900' : 'text-blue-600 hover:text-blue-900'}`}>
                                        <LockClosedIcon className="h-4 w-4 mr-1"/>{shipper.status !== 'suspended' ? 'Khóa' : 'Mở khóa'}
                                    </button>
                                    <button onClick={() => { setSelectedShipper(shipper); setIsDetailModalOpen(true); }} className="text-orange-600 hover:text-orange-900 font-semibold">Xem chi tiết</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isDetailModalOpen && selectedShipper && (
                <ShipperDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} shipper={selectedShipper} onUpdate={handleUpdateShipper} />
            )}
            
            {confirmation?.isOpen && (
                <ConfirmationModal isOpen={confirmation.isOpen} onClose={() => setConfirmation(null)} onConfirm={confirmation.onConfirm} title={confirmation.title} message={confirmation.message} confirmButtonColor={confirmation.color} />
            )}
        </div>
    );
};

export default AdminShippersPage;
