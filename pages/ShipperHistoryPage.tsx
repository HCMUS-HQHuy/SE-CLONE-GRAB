
import React, { useState, useMemo, useEffect } from 'react';
import { CashIcon, ClipboardListIcon, TrendingUpIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '../components/Icons';
import { shipperApiService, Transaction } from '../services/shipperApi';
import { apiService } from '../services/api';
// FIX: Import HistoryDetailModal to show trip details
import HistoryDetailModal from '../components/HistoryDetailModal';

// FIX: Exported DeliveryHistory type to resolve build error in HistoryDetailModal.tsx
export type DeliveryHistory = {
    id: string;
    date: string;
    restaurantName: string;
    restaurantAddress: string;
    customerName: string;
    customerAddress: string;
    earnings: number;
    earningsDetail: {
        deliveryFee: number;
        bonus: number;
    };
    status: string;
    review?: {
        rating: number;
        comment: string;
    };
};

const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount).replace(/\s/g, '');

const formatDateOnly = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
};

const SummaryCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; }> = ({ icon, title, value }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-5 min-w-[280px]">
        <div className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center bg-orange-50 text-orange-500">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-400 font-medium">{title}</p>
            <p className="text-2xl font-semibold text-gray-800 tracking-tight">{value}</p>
        </div>
    </div>
);

const ShipperHistoryPage: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [driverId, setDriverId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month'>('week');
    // FIX: State to manage the selected history item for the detail modal
    const [selectedHistory, setSelectedHistory] = useState<DeliveryHistory | null>(null);

    useEffect(() => {
        const init = async () => {
            try {
                const me = await apiService.getMe('shipper');
                setDriverId(me.id.toString());
            } catch (err) {
                console.error("Lỗi xác thực:", err);
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (!driverId) return;

        const fetchHistory = async () => {
            setIsLoading(true);
            try {
                const data = await shipperApiService.getWalletTransactions(driverId);
                setTransactions(data);
            } catch (err: any) {
                setError(err.message || "Lỗi tải lịch sử.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [driverId]);

    const summaryData = useMemo(() => {
        const totalEarnings = transactions.reduce((sum, t) => t.isCredit ? sum + t.amount : sum, 0);
        const completedTrips = transactions.filter(t => t.type === 'OrderEarning').length;
        return { trips: completedTrips, earnings: totalEarnings };
    }, [transactions]);

    if (isLoading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-4"></div>
                <p className="text-gray-400 font-medium tracking-tight">Đang tải lịch sử...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 lg:p-10 bg-gray-50 min-h-screen">
            <div className="mb-10">
                <h1 className="text-3xl font-semibold text-gray-800 tracking-tight">Lịch sử giao hàng</h1>
            </div>

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                {/* Time Filters */}
                <div className="inline-flex p-1 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <button 
                        onClick={() => setTimeFilter('today')}
                        className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${timeFilter === 'today' ? 'bg-orange-500 text-white shadow-md shadow-orange-100' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Hôm nay
                    </button>
                    <button 
                        onClick={() => setTimeFilter('week')}
                        className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${timeFilter === 'week' ? 'bg-orange-500 text-white shadow-md shadow-orange-100' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Tuần này
                    </button>
                    <button 
                        onClick={() => setTimeFilter('month')}
                        className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${timeFilter === 'month' ? 'bg-orange-500 text-white shadow-md shadow-orange-100' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Tháng này
                    </button>
                </div>

                {/* Summary Section */}
                <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                    <SummaryCard icon={<TrendingUpIcon className="h-6 w-6"/>} title="Tổng thu nhập" value={formatCurrency(summaryData.earnings)} />
                    <SummaryCard icon={<ClipboardListIcon className="h-6 w-6"/>} title="Tổng chuyến đi" value={summaryData.trips} />
                </div>
            </div>

            {/* History Table Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-gray-50">
                                <th className="px-8 py-5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">MÃ ĐƠN</th>
                                <th className="px-8 py-5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">KHÁCH HÀNG / NHÀ HÀNG</th>
                                <th className="px-8 py-5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">NGÀY</th>
                                <th className="px-8 py-5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">THU NHẬP</th>
                                <th className="px-8 py-5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">TRẠNG THÁI</th>
                                <th className="px-8 py-5 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-widest">HÀNH ĐỘNG</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {transactions.length > 0 ? transactions.map(tx => (
                                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <span className="text-sm font-medium text-orange-500">
                                            #{tx.orderId ? tx.orderId.substring(0, 5).toUpperCase() : 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-sm font-semibold text-gray-800">
                                            {tx.description.split(':')[0]}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-0.5">
                                            {tx.orderId ? "Đối tác giao hàng" : "Hệ thống"}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-500 font-medium">
                                        {formatDateOnly(tx.createdAt)}
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-sm font-semibold text-gray-800">
                                        {formatCurrency(tx.amount)}
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        {tx.type === 'OrderEarning' ? (
                                            <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 text-green-600 border border-green-100">
                                                <CheckCircleIcon className="h-3.5 w-3.5 mr-1.5"/>
                                                Hoàn thành
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-100">
                                                <XCircleIcon className="h-3.5 w-3.5 mr-1.5"/>
                                                Đã hủy
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 text-right whitespace-nowrap">
                                        {/* FIX: Implemented onClick to show order details in modal */}
                                        <button 
                                            onClick={() => {
                                                setSelectedHistory({
                                                    id: tx.orderId || tx.id,
                                                    date: tx.createdAt,
                                                    restaurantName: tx.description.split(':')?.[1]?.trim() || "Nhà hàng đối tác",
                                                    restaurantAddress: "Địa chỉ nhà hàng",
                                                    customerName: tx.description.split(':')?.[0]?.trim() || "Khách hàng",
                                                    customerAddress: "Địa chỉ khách hàng",
                                                    earnings: tx.amount,
                                                    earningsDetail: {
                                                        deliveryFee: tx.amount * 0.8,
                                                        bonus: tx.amount * 0.2
                                                    },
                                                    status: tx.type === 'OrderEarning' ? 'Hoàn thành' : 'Đã hủy'
                                                });
                                            }}
                                            className="text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
                                        >
                                            Xem chi tiết
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                <ClipboardListIcon className="h-8 w-8 text-gray-200" />
                                            </div>
                                            <p className="text-gray-400 font-medium italic">Không tìm thấy dữ liệu chuyến đi nào.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {error && (
                <div className="mt-8 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium">
                    Lỗi: {error}
                </div>
            )}

            {/* FIX: Render the detail modal when a history item is selected */}
            {selectedHistory && (
                <HistoryDetailModal 
                    isOpen={!!selectedHistory} 
                    onClose={() => setSelectedHistory(null)} 
                    order={selectedHistory} 
                />
            )}
        </div>
    );
};

export default ShipperHistoryPage;
