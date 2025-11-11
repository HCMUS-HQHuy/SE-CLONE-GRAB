import React, { useState, useMemo } from 'react';
import { CashIcon, ClipboardListIcon, TrendingUpIcon, CheckCircleIcon, XCircleIcon } from '../components/Icons';
import HistoryDetailModal from '../components/HistoryDetailModal';

// Types
export type HistoryStatus = 'Hoàn thành' | 'Đã hủy';

export type DeliveryHistory = {
  id: string;
  customerName: string;
  restaurantName: string;
  restaurantAddress: string;
  customerAddress: string;
  date: string;
  earnings: number;
  status: HistoryStatus;
  review?: {
    rating: number;
    comment: string;
  };
  earningsDetail: {
    deliveryFee: number;
    bonus: number;
  };
};

// Mock data
const mockHistory: DeliveryHistory[] = [
    { id: '#12348', customerName: 'Phạm Thị D', restaurantName: 'Quán Ăn Gỗ', restaurantAddress: '123 Đường Lê Lợi, Quận 1, TP.HCM', customerAddress: '101 Đường OPQ, Bình Thạnh, TPHCM', date: '2024-07-30T09:30:00Z', earnings: 25000, status: 'Hoàn thành', review: { rating: 5, comment: 'Giao hàng nhanh, tài xế thân thiện!' }, earningsDetail: { deliveryFee: 20000, bonus: 5000 } },
    { id: '#12349', customerName: 'Võ Văn E', restaurantName: 'Quán Ăn Gỗ', restaurantAddress: '123 Đường Lê Lợi, Quận 1, TP.HCM', customerAddress: '222 Đường UVW, Q2, TPHCM', date: '2024-07-29T12:00:00Z', earnings: 0, status: 'Đã hủy', earningsDetail: { deliveryFee: 0, bonus: 0 } },
    { id: '#12341', customerName: 'Hoàng A', restaurantName: 'Bếp Việt', restaurantAddress: '45 Phạm Ngọc Thạch, Quận 3, TP.HCM', customerAddress: '333 Đinh Tiên Hoàng, Q1, TPHCM', date: '2024-07-28T18:45:00Z', earnings: 22000, status: 'Hoàn thành', earningsDetail: { deliveryFee: 22000, bonus: 0 } },
    { id: '#12335', customerName: 'Lê B', restaurantName: 'Phở Ngon 3 Miền', restaurantAddress: '212 Nguyễn Trãi, Quận 5, TP.HCM', customerAddress: '444 Nguyễn Huệ, Q1, TPHCM', date: '2024-07-25T11:20:00Z', earnings: 30000, status: 'Hoàn thành', review: { rating: 4, comment: 'Ok' }, earningsDetail: { deliveryFee: 20000, bonus: 10000 } },
    { id: '#12330', customerName: 'Trần C', restaurantName: 'Ốc Đảo', restaurantAddress: '88 Nguyễn Thị Thập, Quận 7, TP.HCM', customerAddress: '555 Trần Hưng Đạo, Q5, TPHCM', date: '2024-07-20T20:10:00Z', earnings: 28000, status: 'Hoàn thành', earningsDetail: { deliveryFee: 28000, bonus: 0 } },
];


const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('vi-VN');

const SummaryCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; }> = ({ icon, title, value }) => (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-orange-100 text-orange-600">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const StatusBadge: React.FC<{ status: HistoryStatus }> = ({ status }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        status === 'Hoàn thành' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
        {status === 'Hoàn thành' ? <CheckCircleIcon className="h-4 w-4 mr-1.5"/> : <XCircleIcon className="h-4 w-4 mr-1.5"/>}
        {status}
    </span>
);

const ShipperHistoryPage: React.FC = () => {
    const [filter, setFilter] = useState<'day' | 'week' | 'month'>('week');
    const [selectedOrder, setSelectedOrder] = useState<DeliveryHistory | null>(null);

    const summaryData = useMemo(() => {
        // This is a mock summary. A real app would filter mockHistory by date.
        const completedTrips = mockHistory.filter(h => h.status === 'Hoàn thành').length;
        const totalEarnings = mockHistory.reduce((sum, h) => sum + h.earnings, 0);
        return { trips: completedTrips, earnings: totalEarnings };
    }, [filter]);

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Lịch sử giao hàng</h1>

            {/* Filters and Summary */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <div className="flex space-x-1 bg-white p-1 rounded-lg border shadow-sm">
                        {(['Hôm nay', 'Tuần này', 'Tháng này'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f === 'Hôm nay' ? 'day' : f === 'Tuần này' ? 'week' : 'month')}
                                className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    (filter === 'day' && f === 'Hôm nay') || (filter === 'week' && f === 'Tuần này') || (filter === 'month' && f === 'Tháng này')
                                    ? 'bg-orange-500 text-white shadow'
                                    : 'text-gray-600 hover:bg-orange-50'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <SummaryCard icon={<TrendingUpIcon className="h-6 w-6"/>} title="Tổng thu nhập" value={formatCurrency(summaryData.earnings)} />
                    <SummaryCard icon={<ClipboardListIcon className="h-6 w-6"/>} title="Tổng chuyến đi" value={summaryData.trips} />
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white p-6 rounded-lg shadow-md border">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã đơn</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng / Nhà hàng</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thu nhập</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {mockHistory.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-orange-600">{order.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="font-medium text-gray-900">{order.customerName}</div>
                                        <div className="text-gray-500">{order.restaurantName}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.date)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{formatCurrency(order.earnings)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={order.status} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        <button onClick={() => setSelectedOrder(order)} className="font-medium text-orange-600 hover:text-orange-800">
                                            Xem chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedOrder && (
                <HistoryDetailModal
                    isOpen={!!selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    order={selectedOrder}
                />
            )}
        </div>
    );
};

export default ShipperHistoryPage;