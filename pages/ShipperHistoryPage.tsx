import React, { useState, useMemo, useEffect } from 'react';
import { CashIcon, ClipboardListIcon, TrendingUpIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '../components/Icons';
import { shipperApiService, Transaction } from '../services/shipperApi';
import { apiService } from '../services/api';

// ADDED: Export DeliveryHistory type for use in HistoryDetailModal to fix the build error.
export type DeliveryHistory = {
  id: string;
  date: string;
  status: string;
  restaurantName: string;
  restaurantAddress: string;
  customerName: string;
  customerAddress: string;
  earnings: number;
  earningsDetail: {
    deliveryFee: number;
    bonus: number;
  };
  review?: {
    rating: number;
    comment: string;
  };
};

const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount).replace(/\s/g, '');

const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString('vi-VN');
};

const SummaryCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; }> = ({ icon, title, value }) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center bg-orange-50 text-orange-500">
            {icon}
        </div>
        <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{title}</p>
            <p className="text-2xl font-black text-gray-900 tracking-tight">{value}</p>
        </div>
    </div>
);

const ShipperHistoryPage: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [driverId, setDriverId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

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
            <div className="min-h-[70vh] flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-4"></div>
                <p className="text-gray-500 font-bold tracking-tight">ĐANG TẢI LỊCH SỬ...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-10">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Lịch sử hoạt động</h1>
                <p className="text-gray-500 mt-2 font-medium">Theo dõi thu nhập và các chuyến đi của bạn.</p>
            </div>

            <div className="mb-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <SummaryCard icon={<TrendingUpIcon className="h-7 w-7"/>} title="Tổng thu nhập" value={formatCurrency(summaryData.earnings)} />
                <SummaryCard icon={<ClipboardListIcon className="h-7 w-7"/>} title="Chuyến đi hoàn tất" value={summaryData.trips} />
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Thông tin giao dịch</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Thời gian</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Số tiền</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Số dư sau</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {transactions.length > 0 ? transactions.map(tx => (
                                <tr key={tx.id} className="hover:bg-gray-50/80 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center">
                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center mr-4 transition-transform group-hover:scale-110 ${tx.isCredit ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                {tx.isCredit ? <CashIcon className="h-5 w-5"/> : <XCircleIcon className="h-5 w-5"/>}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-gray-900 group-hover:text-orange-600 transition-colors">
                                                    {tx.orderId ? `Đơn hàng #${tx.orderId.substring(0, 8).toUpperCase()}` : tx.type}
                                                </div>
                                                <div className="text-[11px] text-gray-400 font-bold mt-0.5 line-clamp-1">{tx.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center text-xs font-bold text-gray-500">
                                            <ClockIcon className="h-3.5 w-3.5 mr-1.5 text-gray-300" />
                                            {formatDateTime(tx.createdAt)}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <span className={`text-sm font-black ${tx.isCredit ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-gray-400 tracking-tight">
                                        {formatCurrency(tx.balanceAfter)}
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-50 text-green-700 border border-green-100">
                                            <CheckCircleIcon className="h-3 w-3 mr-1.5"/>
                                            Thành công
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                <ClipboardListIcon className="h-8 w-8 text-gray-200" />
                                            </div>
                                            <p className="text-gray-400 font-bold tracking-tight italic">Chưa có giao dịch nào được ghi nhận.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {error && (
                <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm font-bold">
                    Lỗi: {error}
                </div>
            )}
        </div>
    );
};

export default ShipperHistoryPage;