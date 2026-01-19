
import React, { useState, useMemo, useEffect } from 'react';
import { CashIcon, ClockIcon, ClipboardListIcon, DownloadIcon, StarIcon, ImageIcon } from '../components/Icons';
import { orderApiService, OrderResponseData } from '../services/orderApi';
import { restaurantApiService } from '../services/restaurantApi';
import { apiService } from '../services/api';

// --- HELPERS ---

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount).replace(/\s/g, '');
};

const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'delivered') return 'bg-green-500';
    if (['pending_restaurant', 'preparing', 'ready'].includes(s)) return 'bg-yellow-500';
    if (['finding_driver', 'driver_accepted', 'delivering'].includes(s)) return 'bg-blue-500';
    if (['cancelled', 'restaurant_rejected'].includes(s)) return 'bg-red-500';
    return 'bg-gray-400';
};

// --- SUB-COMPONENTS ---

type SummaryCardProps = {
    icon: React.ReactNode;
    title: string;
    value: string;
    change?: string;
    color: string;
};

const SummaryCard: React.FC<SummaryCardProps> = ({ icon, title, value, change, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-4 transition-all hover:shadow-md">
        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-semibold text-gray-800 mt-0.5">{value}</p>
            {change && <p className="text-xs text-green-600 mt-1 font-medium">{change}</p>}
        </div>
    </div>
);

const RestaurantDashboardPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [orders, setOrders] = useState<OrderResponseData[]>([]);
    const [restaurantId, setRestaurantId] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            try {
                const me = await apiService.getMe('seller');
                const res = await restaurantApiService.getRestaurantByOwner(me.id);
                setRestaurantId(res.id.toString());
            } catch (err) {
                console.error("Dashboard init error:", err);
                setIsLoading(false);
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (!restaurantId) return;

        const fetchData = async () => {
            try {
                const data = await orderApiService.getRestaurantOrders(restaurantId);
                setOrders(data.items);
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [restaurantId]);

    // --- COMPUTED DATA ---

    const stats = useMemo(() => {
        const now = new Date();
        const todayStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD

        let totalRevenue = 0;
        let todayRevenue = 0;
        let pendingCount = 0;
        let completedCount = 0;

        orders.forEach(order => {
            const amount = parseFloat(order.total_amount);
            const orderDate = new Date(order.created_at).toLocaleDateString('en-CA');
            const status = order.status.toLowerCase();

            if (status === 'delivered') {
                totalRevenue += amount;
                completedCount++;
                if (orderDate === todayStr) {
                    todayRevenue += amount;
                }
            }

            if (['pending_restaurant', 'preparing', 'ready'].includes(status)) {
                pendingCount++;
            }
        });

        const avgValue = completedCount > 0 ? totalRevenue / completedCount : 0;

        return {
            todayRevenue,
            totalOrders: orders.length,
            pendingCount,
            avgValue
        };
    }, [orders]);

    const topItems = useMemo(() => {
        const counts: Record<string, { name: string, count: number, revenue: number }> = {};
        
        orders.forEach(order => {
            if (order.status.toLowerCase() !== 'cancelled') {
                order.items.forEach((item: any) => {
                    const name = item.product_name;
                    if (!counts[name]) counts[name] = { name, count: 0, revenue: 0 };
                    counts[name].count += item.quantity;
                    counts[name].revenue += parseFloat(item.unit_price) * item.quantity;
                });
            }
        });

        return Object.values(counts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [orders]);

    const weeklyData = useMemo(() => {
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const result = days.map(day => ({ day, value: 0 }));
        
        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 6);

        orders.forEach(order => {
            if (order.status.toLowerCase() === 'delivered') {
                const d = new Date(order.created_at);
                if (d >= sevenDaysAgo) {
                    const dayIdx = d.getDay();
                    // Map JS day (0-6) to our labels
                    // result[dayIdx] matches but result is in order CN, T2...
                    result[dayIdx].value += parseFloat(order.total_amount);
                }
            }
        });
        
        // Reorder result to have "today" at the end for visual flow
        const todayIdx = now.getDay();
        const orderedResult = [];
        for (let i = 6; i >= 0; i--) {
            const idx = (todayIdx - i + 7) % 7;
            orderedResult.push(result[idx]);
        }

        return orderedResult;
    }, [orders]);

    const statusBreakdown = useMemo(() => {
        const groups = {
            'Hoàn thành': 0,
            'Đang xử lý': 0,
            'Đang giao': 0,
            'Đã hủy': 0
        };

        orders.forEach(o => {
            const s = o.status.toLowerCase();
            if (s === 'delivered') groups['Hoàn thành']++;
            else if (['pending_restaurant', 'preparing', 'ready'].includes(s)) groups['Đang xử lý']++;
            else if (['finding_driver', 'driver_accepted', 'delivering'].includes(s)) groups['Đang giao']++;
            else if (['cancelled', 'restaurant_rejected'].includes(s)) groups['Đã hủy']++;
        });

        return groups;
    }, [orders]);

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-4"></div>
                <p className="text-gray-400 font-medium text-sm">Đang tổng hợp dữ liệu...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-800 tracking-tight">Tổng quan</h1>
                    <p className="text-gray-400 text-sm mt-1 font-medium">Báo cáo hiệu suất kinh doanh của nhà hàng.</p>
                </div>
                <button className="flex items-center text-xs font-semibold text-white bg-gray-900 hover:bg-black px-5 py-2.5 rounded-xl shadow-lg transition-all active:scale-95 uppercase tracking-widest">
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Xuất báo cáo
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <SummaryCard icon={<CashIcon className="h-6 w-6 text-emerald-600"/>} title="Doanh thu hôm nay" value={formatCurrency(stats.todayRevenue)} change="+12% so với hôm qua" color="bg-emerald-50"/>
                <SummaryCard icon={<ClipboardListIcon className="h-6 w-6 text-indigo-600"/>} title="Tổng đơn hàng" value={String(stats.totalOrders)} color="bg-indigo-50"/>
                <SummaryCard icon={<ClockIcon className="h-6 w-6 text-amber-600"/>} title="Đang xử lý" value={String(stats.pendingCount)} color="bg-amber-50"/>
                <SummaryCard icon={<StarIcon className="h-6 w-6 text-rose-600"/>} title="Giá trị TB đơn" value={formatCurrency(stats.avgValue)} color="bg-rose-50"/>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Revenue Chart Placeholder */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-semibold text-gray-800 text-lg">Doanh thu 7 ngày qua</h3>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Đơn vị: VNĐ</span>
                    </div>
                    <div className="h-64 w-full flex items-end justify-between px-2">
                        {weeklyData.map((d, i) => {
                            const maxVal = Math.max(...weeklyData.map(w => w.value), 1);
                            const height = (d.value / maxVal) * 100;
                            return (
                                <div key={i} className="flex flex-col items-center flex-1 group">
                                    <div className="relative w-8 sm:w-12 bg-orange-50 rounded-t-lg transition-all duration-500 hover:bg-orange-100 flex items-end justify-center overflow-hidden" style={{ height: '200px' }}>
                                        <div 
                                            className="w-full bg-orange-500 rounded-t-lg transition-all duration-1000 ease-out" 
                                            style={{ height: `${height}%` }}
                                        ></div>
                                        <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-gray-800 text-white text-[10px] px-2 py-1 rounded">
                                            {formatCurrency(d.value)}
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 mt-4 uppercase">{d.day}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Menu Items */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-800 text-lg mb-8">Món bán chạy</h3>
                    <div className="space-y-6">
                        {topItems.length > 0 ? topItems.map((item, idx) => (
                            <div key={idx} className="flex items-center space-x-4 group">
                                <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 border border-gray-100 overflow-hidden">
                                    <ImageIcon className="h-6 w-6" />
                                </div>
                                <div className="flex-grow min-w-0">
                                    <p className="font-semibold text-sm text-gray-800 truncate group-hover:text-orange-500 transition-colors">{item.name}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{item.count} lượt bán</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-800 text-sm">{formatCurrency(item.revenue)}</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-gray-400 italic text-center py-10">Chưa có dữ liệu bán hàng.</p>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Status Statistics */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 text-lg mb-8">Tỉ lệ đơn hàng</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {Object.entries(statusBreakdown).map(([label, count]) => {
                        const total = stats.totalOrders || 1;
                        const percent = Math.round((count / total) * 100);
                        const barColor = getStatusColor(label === 'Đang xử lý' ? 'pending_restaurant' : (label === 'Hoàn thành' ? 'delivered' : (label === 'Đang giao' ? 'delivering' : 'cancelled')));
                        
                        return (
                            <div key={label} className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
                                    <span className="text-sm font-semibold text-gray-800">{count}</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full ${barColor} rounded-full transition-all duration-1000`} 
                                        style={{ width: `${percent}%` }}
                                    ></div>
                                </div>
                                <p className="text-[10px] text-gray-400 font-medium">{percent}% tổng đơn</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default RestaurantDashboardPage;
