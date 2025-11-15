import React from 'react';
import { CashIcon, ClipboardListIcon, UsersIcon, MotorcycleIcon } from '../components/Icons';

// --- MOCK DATA & HELPERS ---
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const summaryData = {
    revenue: 125350000,
    orders: 1250,
    newUsers: 85,
    activeShippers: 42
};

const recentOrders = [
    { id: '#12345', customer: 'Nguyễn Văn A', total: 105000, status: 'Mới' },
    { id: '#12344', customer: 'Trần Thị B', total: 250000, status: 'Hoàn thành' },
    { id: '#12343', customer: 'Lê Văn C', total: 85000, status: 'Đang chuẩn bị' },
    { id: '#12342', customer: 'Phạm Thị D', total: 150000, status: 'Đã hủy' },
];

const newRestaurants = [
    { name: 'Phở Thìn', date: '30/07/2024' },
    { name: 'Pizza 4Ps', date: '29/07/2024' },
];

// --- DASHBOARD SUB-COMPONENTS ---
type SummaryCardProps = {
    icon: React.ReactNode;
    title: string;
    value: string;
    color: string;
};

const SummaryCard: React.FC<SummaryCardProps> = ({ icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border flex items-start space-x-4">
        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

const getStatusStyles = (status: string) => {
    switch (status) {
        case 'Mới': return 'bg-blue-100 text-blue-800';
        case 'Đang chuẩn bị': return 'bg-yellow-100 text-yellow-800';
        case 'Hoàn thành': return 'bg-green-100 text-green-800';
        case 'Đã hủy': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const RecentActivityTable: React.FC = () => (
    <div className="bg-white p-6 rounded-lg shadow-md border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Đơn hàng gần đây</h3>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã đơn</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {recentOrders.map(order => (
                        <tr key={order.id}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-orange-600">{order.id}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{order.customer}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{formatCurrency(order.total)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyles(order.status)}`}>
                                    {order.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const NewRegistrationsList: React.FC = () => (
    <div className="bg-white p-6 rounded-lg shadow-md border h-full">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Đăng ký mới</h3>
        <ul className="space-y-3">
            {newRestaurants.map(res => (
                <li key={res.name} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                    <div>
                        <p className="font-semibold text-sm text-gray-800">{res.name}</p>
                        <p className="text-xs text-gray-500">Nhà hàng</p>
                    </div>
                    <span className="text-xs text-gray-500">{res.date}</span>
                </li>
            ))}
        </ul>
    </div>
);


// --- MAIN DASHBOARD PAGE ---
const AdminDashboardPage: React.FC = () => {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển</h1>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard icon={<CashIcon className="h-6 w-6 text-green-700"/>} title="Tổng doanh thu" value={formatCurrency(summaryData.revenue)} color="bg-green-100"/>
                <SummaryCard icon={<ClipboardListIcon className="h-6 w-6 text-blue-700"/>} title="Tổng đơn hàng" value={summaryData.orders.toLocaleString()} color="bg-blue-100"/>
                <SummaryCard icon={<UsersIcon className="h-6 w-6 text-yellow-700"/>} title="Người dùng mới" value={summaryData.newUsers.toLocaleString()} color="bg-yellow-100"/>
                <SummaryCard icon={<MotorcycleIcon className="h-6 w-6 text-indigo-700"/>} title="Tài xế hoạt động" value={summaryData.activeShippers.toLocaleString()} color="bg-indigo-100"/>
            </div>
            
            {/* Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <RecentActivityTable />
                </div>
                <div className="lg:col-span-1">
                    <NewRegistrationsList />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;