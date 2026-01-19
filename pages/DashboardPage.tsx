import React, { useState, useMemo } from 'react';
import { CashIcon, ClockIcon, ClipboardListIcon, DownloadIcon, StarIcon, ImageIcon } from '../components/Icons';
// FIX: Removed incorrect import of mockOrders as it is not exported from RestaurantOrdersPage.
// Defined mockOrders locally to support the dashboard statistics visualization.
import { foodCategories, FoodItem } from './HomePage';

// --- MOCK DATA & HELPERS ---

// FIX: Locally defined mockOrders since it's not provided by any external module and is used for visualization in this component.
const mockOrders = [
    { id: '1', status: 'Hoàn thành' },
    { id: '2', status: 'Hoàn thành' },
    { id: '3', status: 'Mới' },
    { id: '4', status: 'Đang chuẩn bị' },
    { id: '5', status: 'Sẵn sàng giao' },
    { id: '6', status: 'Đã hủy' },
    { id: '7', status: 'Hoàn thành' },
    { id: '8', status: 'Mới' },
    { id: '9', status: 'Đang chuẩn bị' },
    { id: '10', status: 'Hoàn thành' },
    { id: '11', status: 'Hoàn thành' },
    { id: '12', status: 'Sẵn sàng giao' },
];

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const summaryData = {
    revenue: 1560000,
    orders: 32,
    pending: 5,
    avgOrderValue: 48750
};

const topMenuItems: (FoodItem & { sales: number })[] = [
    { ...foodCategories[0].items[0], sales: 25 },
    { ...foodCategories[1].items[0], sales: 18 },
    { ...foodCategories[2].items[0], sales: 15 },
    { ...foodCategories[0].items[2], sales: 12 },
    { ...foodCategories[3].items[1], sales: 10 },
];

const weeklyRevenueData = [
  { day: 'T2', value: 120 }, { day: 'T3', value: 180 },
  { day: 'T4', value: 160 }, { day: 'T5', value: 220 },
  { day: 'T6', value: 250 }, { day: 'T7', value: 310 },
  { day: 'CN', value: 156 }
];

// --- DASHBOARD SUB-COMPONENTS ---

type SummaryCardProps = {
    icon: React.ReactNode;
    title: string;
    value: string;
    change?: string;
    color: string;
};

const SummaryCard: React.FC<SummaryCardProps> = ({ icon, title, value, change, color }) => (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex items-start space-x-4">
        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            {change && <p className="text-xs text-green-600">{change}</p>}
        </div>
    </div>
);

const RevenueChart: React.FC = () => {
    const [period, setPeriod] = useState('Tuần này');
    const maxValue = Math.max(...weeklyRevenueData.map(d => d.value));

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">Thống kê doanh thu</h3>
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-md text-sm">
                    {['Tuần này', 'Tháng này'].map(p => (
                        <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1 rounded ${period === p ? 'bg-white shadow-sm text-orange-600 font-semibold' : 'text-gray-500'}`}>
                            {p}
                        </button>
                    ))}
                </div>
            </div>
            <div className="h-64 w-full">
                <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none">
                    {/* Y-axis lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map(v => (
                        <line key={v} x1="30" y1={180 - v * 160} x2="490" y2={180 - v * 160} stroke="#E5E7EB" strokeWidth="1" />
                    ))}
                    {/* X-axis labels */}
                    {weeklyRevenueData.map((data, index) => (
                        <text key={index} x={55 + index * 60} y="195" textAnchor="middle" fontSize="10" fill="#6B7281">{data.day}</text>
                    ))}
                    {/* Y-axis labels */}
                    {[...Array(5)].map((_, i) => (
                         <text key={i} x="25" y={185 - i * 40} textAnchor="end" fontSize="10" fill="#6B7281">{Math.round(maxValue / 4 * i / 1000)}k</text>
                    ))}
                    {/* Data line */}
                    <polyline
                        fill="none"
                        stroke="#F97316"
                        strokeWidth="2"
                        points={weeklyRevenueData.map((data, index) =>
                            `${55 + index * 60},${180 - (data.value / maxValue) * 160}`
                        ).join(' ')}
                    />
                    {/* Data points */}
                    {weeklyRevenueData.map((data, index) => (
                        <circle key={index} cx={55 + index * 60} cy={180 - (data.value / maxValue) * 160} r="3" fill="#F97316" />
                    ))}
                </svg>
            </div>
        </div>
    );
};


const TopMenuList: React.FC = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-full">
        <h3 className="font-bold text-gray-800 mb-4">Món bán chạy nhất</h3>
        <ul className="space-y-4">
            {topMenuItems.map(item => (
                <li key={item.id} className="flex items-center space-x-3">
                    {item.image ?
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-md object-cover flex-shrink-0" />
                      : <div className="w-12 h-12 rounded-md bg-gray-200 flex items-center justify-center"><ImageIcon className="h-6 w-6 text-gray-400"/></div>
                    }
                    <div className="flex-grow min-w-0">
                        <p className="font-semibold text-sm text-gray-700 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.sales} lượt bán</p>
                    </div>
                    <p className="font-bold text-sm text-orange-500">{item.newPrice || item.price}</p>
                </li>
            ))}
        </ul>
    </div>
);

const OrderStatChart: React.FC = () => {
    const orderStats = useMemo(() => {
        return mockOrders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, []);

    const totalOrders = mockOrders.length;
    const stats = [
        { label: 'Hoàn thành', value: orderStats['Hoàn thành'] || 0, color: 'bg-green-500' },
        { label: 'Đang xử lý', value: (orderStats['Mới'] || 0) + (orderStats['Đang chuẩn bị'] || 0), color: 'bg-yellow-500' },
        { label: 'Sẵn sàng giao', value: orderStats['Sẵn sàng giao'] || 0, color: 'bg-blue-500' },
        { label: 'Đã hủy', value: orderStats['Đã hủy'] || 0, color: 'bg-red-500' },
    ];
    
    return (
         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-full">
            <h3 className="font-bold text-gray-800 mb-4">Thống kê đơn hàng</h3>
            <div className="w-full bg-gray-200 rounded-full h-4 flex overflow-hidden">
                {stats.map(stat => (
                    <div key={stat.label} className={stat.color} style={{ width: `${(stat.value / totalOrders) * 100}%` }} title={`${stat.label}: ${stat.value}`}></div>
                ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
                {stats.map(stat => (
                    <div key={stat.label} className="flex items-center text-sm">
                        <span className={`w-3 h-3 rounded-full mr-2 ${stat.color}`}></span>
                        <span className="text-gray-600">{stat.label}:</span>
                        <span className="font-semibold ml-auto">{stat.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- MAIN DASHBOARD PAGE COMPONENT ---

const RestaurantDashboardPage: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Tổng quan</h1>
                <button className="flex items-center text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg shadow-sm transition-colors">
                    <DownloadIcon className="h-5 w-5 mr-2" />
                    Xuất báo cáo
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard icon={<CashIcon className="h-6 w-6 text-green-700"/>} title="Doanh thu hôm nay" value={formatCurrency(summaryData.revenue)} change="+5.2% so với hôm qua" color="bg-green-100"/>
                <SummaryCard icon={<ClipboardListIcon className="h-6 w-6 text-blue-700"/>} title="Tổng đơn hàng" value={String(summaryData.orders)} change="+10 đơn so với hôm qua" color="bg-blue-100"/>
                <SummaryCard icon={<ClockIcon className="h-6 w-6 text-yellow-700"/>} title="Đơn đang xử lý" value={String(summaryData.pending)} color="bg-yellow-100"/>
                <SummaryCard icon={<StarIcon className="h-6 w-6 text-indigo-700"/>} title="Giá trị trung bình" value={formatCurrency(summaryData.avgOrderValue)} color="bg-indigo-100"/>
            </div>
            
            {/* Charts & Lists */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <RevenueChart />
                </div>
                <div>
                   <TopMenuList />
                </div>
            </div>
            
            {/* Additional Stats */}
             <div className="mt-8">
                <OrderStatChart />
             </div>
        </div>
    );
};

export default RestaurantDashboardPage;