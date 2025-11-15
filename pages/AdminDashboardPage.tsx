import React, { useState, useEffect, useRef } from 'react';
import { ClipboardListIcon, ExclamationIcon, ChipIcon, DocumentReportIcon, ChevronDownIcon, BellIcon } from '../components/Icons';

// --- TYPES ---
type Alert = {
  id: number;
  severity: 'Critical' | 'Warning';
  message: string;
  timestamp: string;
};
type DashboardData = {
  totalOrders: number;
  errors: number;
  activeWorkers: number;
  alerts: Alert[];
  revenueData: { day: string; value: number }[];
  orderStatusData: { status: string; value: number }[];
  errorRateData: { type: string; value: number }[];
};

// --- MOCK INITIAL DATA ---
const initialData: DashboardData = {
  totalOrders: 1250,
  errors: 2,
  activeWorkers: 42,
  alerts: [
    { id: 1, severity: 'Warning', message: 'API response time is slow (avg > 500ms)', timestamp: '2 phút trước' },
  ],
  revenueData: [
    { day: 'T2', value: 1200000 }, { day: 'T3', value: 1800000 }, { day: 'T4', value: 1600000 },
    { day: 'T5', value: 2200000 }, { day: 'T6', value: 2500000 }, { day: 'T7', value: 3100000 }, { day: 'CN', value: 1560000 }
  ],
  orderStatusData: [
    { status: 'Mới', value: 5 }, { status: 'Xử lý', value: 12 }, { status: 'Hoàn thành', value: 150 }, { status: 'Đã hủy', value: 8 }
  ],
  errorRateData: [
    { type: 'API', value: 45 }, { type: 'Thanh toán', value: 30 }, { type: 'Hệ thống', value: 25 }
  ]
};

// --- HELPER FUNCTIONS ---
const formatNumber = (num: number) => new Intl.NumberFormat('vi-VN').format(num);

// --- DASHBOARD SUB-COMPONENTS ---

type SummaryCardProps = {
  icon: React.ReactNode;
  title: string;
  value: string;
  isAlert: boolean;
  tooltipText: string;
};

const SummaryCard: React.FC<SummaryCardProps> = ({ icon, title, value, isAlert, tooltipText }) => (
    <div className={`relative group bg-white p-6 rounded-lg shadow-md border flex items-start space-x-4 transition-all duration-300 ${isAlert ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${isAlert ? 'bg-red-100' : 'bg-gray-100'}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className={`text-2xl font-bold ${isAlert ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
        </div>
        {isAlert && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                {tooltipText}
            </div>
        )}
    </div>
);

const RevenueChart: React.FC<{ data: { day: string; value: number }[] }> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border h-full">
            <h3 className="font-bold text-gray-800 mb-4">Doanh thu 7 ngày qua</h3>
            <div className="h-64 w-full">
                <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none">
                    {data.map((item, index) => {
                        const barHeight = (item.value / maxValue) * 160;
                        return (
                            <g key={item.day}>
                                <rect x={35 + index * 65} y={180 - barHeight} width="40" height={barHeight} rx="4" className="fill-current text-orange-400 hover:text-orange-500 transition-colors"/>
                                <text x={55 + index * 65} y="195" textAnchor="middle" fontSize="12" fill="#6B7281">{item.day}</text>
                            </g>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
};

const OrderStatusChart: React.FC<{ data: { status: string; value: number }[] }> = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const colors: { [key: string]: string } = { 'Mới': 'text-blue-500', 'Xử lý': 'text-yellow-500', 'Hoàn thành': 'text-green-500', 'Đã hủy': 'text-red-500' };
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border h-full">
            <h3 className="font-bold text-gray-800 mb-4">Đơn hàng theo trạng thái</h3>
            {data.map(item => (
                <div key={item.status} className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{item.status}</span>
                        <span className="font-semibold">{item.value}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full bg-current ${colors[item.status]}`} style={{ width: `${(item.value / total) * 100}%` }}></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const PieChart: React.FC<{ data: { type: string; value: number }[] }> = ({ data }) => {
    const colors = ['#F97316', '#FBBF24', '#EF4444'];
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulative = 0;
    
    const getCoordinatesForPercent = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent) * 50 + 50;
        const y = Math.sin(2 * Math.PI * percent) * 50 + 50;
        return [x, y];
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border h-full flex flex-col">
            <h3 className="font-bold text-gray-800 mb-4">Tỷ lệ lỗi</h3>
            <div className="flex-grow flex items-center justify-around">
                <svg width="150" height="150" viewBox="0 0 100 100" className="-rotate-90">
                    {data.map((item, index) => {
                        const [startX, startY] = getCoordinatesForPercent(cumulative / total);
                        cumulative += item.value;
                        const [endX, endY] = getCoordinatesForPercent(cumulative / total);
                        const largeArcFlag = item.value / total > 0.5 ? 1 : 0;
                        const pathData = `M 50 50 L ${startX} ${startY} A 50 50 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
                        return <path key={item.type} d={pathData} fill={colors[index % colors.length]} />;
                    })}
                </svg>
                <div className="space-y-2">
                    {data.map((item, index) => (
                        <div key={item.type} className="flex items-center text-sm">
                            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors[index % colors.length] }}></span>
                            <span className="text-gray-600">{item.type}:</span>
                            <span className="font-semibold ml-auto">{item.value}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const AlertsTable: React.FC<{ alerts: Alert[] }> = ({ alerts }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Cảnh báo hệ thống</h3>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mức độ</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thông báo</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {alerts.map(alert => (
                        <tr key={alert.id} className={alert.severity === 'Critical' ? 'bg-red-50' : 'bg-yellow-50'}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                <span className={`px-2 py-1 rounded-full text-xs ${alert.severity === 'Critical' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>{alert.severity}</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">{alert.message}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{alert.timestamp}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

// --- MAIN DASHBOARD PAGE ---
const AdminDashboardPage: React.FC = () => {
    const [data, setData] = useState<DashboardData>(initialData);
    const [isExportOpen, setIsExportOpen] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setData(prev => {
                const newErrors = Math.max(0, prev.errors + Math.floor(Math.random() * 3) - 1);
                const newAlerts = [...prev.alerts];
                if (Math.random() > 0.95 && newAlerts.length < 5) {
                    newAlerts.unshift({ id: Date.now(), severity: 'Warning', message: 'New DB connection spike detected', timestamp: 'Vừa xong' });
                }

                return {
                    ...prev,
                    totalOrders: prev.totalOrders + Math.floor(Math.random() * 2),
                    errors: newErrors,
                    activeWorkers: Math.max(20, prev.activeWorkers + Math.floor(Math.random() * 3) - 1),
                    alerts: newAlerts,
                }
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
                setIsExportOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    

    const errorThreshold = 5;
    const isErrorAlert = data.errors > errorThreshold;

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển Giám sát</h1>
                <div className="relative" ref={exportRef}>
                    <button onClick={() => setIsExportOpen(!isExportOpen)} className="flex items-center text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 px-4 py-2.5 rounded-lg shadow-sm transition-colors">
                        <DocumentReportIcon className="h-5 w-5 mr-2" />
                        Xuất Báo Cáo
                        <ChevronDownIcon className="h-4 w-4 ml-2"/>
                    </button>
                    {isExportOpen && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
                            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Báo cáo doanh thu (CSV)</a>
                            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Báo cáo KPIs (XLSX)</a>
                            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Danh sách đơn (CSV)</a>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard icon={<ClipboardListIcon className="h-6 w-6 text-blue-600"/>} title="Tổng số đơn hàng" value={formatNumber(data.totalOrders)} isAlert={false} tooltipText=""/>
                <SummaryCard icon={<ExclamationIcon className={`h-6 w-6 ${isErrorAlert ? 'text-red-600' : 'text-red-600'}`}/>} title="Lỗi hệ thống" value={formatNumber(data.errors)} isAlert={isErrorAlert} tooltipText={`Số lỗi vượt ngưỡng cho phép (${errorThreshold})!`}/>
                <SummaryCard icon={<ChipIcon className="h-6 w-6 text-green-600"/>} title="Worker đang chạy" value={formatNumber(data.activeWorkers)} isAlert={false} tooltipText=""/>
                <SummaryCard icon={<BellIcon className={`h-6 w-6 ${data.alerts.length > 0 ? 'text-yellow-600' : 'text-yellow-600'}`}/>} title="Cảnh báo" value={formatNumber(data.alerts.length)} isAlert={data.alerts.length > 0} tooltipText={`${data.alerts.length} cảnh báo đang hoạt động.`}/>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2"><RevenueChart data={data.revenueData} /></div>
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <OrderStatusChart data={data.orderStatusData} />
                    <PieChart data={data.errorRateData} />
                </div>
            </div>

            <AlertsTable alerts={data.alerts} />
        </div>
    );
};

export default AdminDashboardPage;
