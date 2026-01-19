
import React, { useState, useMemo, useEffect } from 'react';
import { CashIcon, ClockIcon, ClipboardListIcon, DownloadIcon, StarIcon, ImageIcon, TrendingUpIcon } from '../components/Icons';
import { orderApiService, OrderResponseData } from '../services/orderApi';
import { restaurantApiService, DishResponse } from '../services/restaurantApi';
import { apiService } from '../services/api';

const BASE_IMG_URL = 'http://localhost:8004/';

// --- HELPERS ---
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount).replace(/\s/g, '');
};

const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'delivered') return 'bg-emerald-500';
    if (['pending_restaurant', 'preparing', 'ready', 'restaurant_accepted'].includes(s)) return 'bg-amber-500';
    if (['finding_driver', 'driver_accepted', 'delivering'].includes(s)) return 'bg-indigo-500';
    if (['cancelled', 'restaurant_rejected'].includes(s)) return 'bg-rose-500';
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
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
            <p className="text-2xl font-semibold text-gray-800 mt-1">{value}</p>
            {change && <p className="text-xs text-emerald-600 mt-1.5 font-medium flex items-center">
                <TrendingUpIcon className="w-3 h-3 mr-1"/> {change}
            </p>}
        </div>
    </div>
);

const RevenueLineChart: React.FC<{ data: { day: string; value: number }[] }> = ({ data }) => {
    const width = 600;
    const height = 200;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxVal = Math.max(...data.map(d => d.value), 100000);
    
    // Tạo chuỗi điểm cho polyline
    const points = data.map((d, i) => {
        const x = padding + (i * (chartWidth / (data.length - 1)));
        const y = height - padding - (d.value / maxVal) * chartHeight;
        return `${x},${y}`;
    }).join(' ');

    // Chuỗi điểm cho vùng gradient (khép kín về phía dưới)
    const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

    return (
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 h-full">
            <div className="flex justify-between items-center mb-8">
                <h3 className="font-semibold text-gray-800 text-lg">Doanh thu 7 ngày qua</h3>
                <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Đơn vị: VNĐ</span>
                </div>
            </div>
            <div className="relative w-full h-64">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#F97316" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    
                    {/* Đường kẻ ngang */}
                    {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
                        <line key={i} x1={padding} y1={padding + v * chartHeight} x2={width - padding} y2={padding + v * chartHeight} stroke="#F3F4F6" strokeWidth="1" />
                    ))}

                    {/* Vùng màu phía dưới */}
                    <polygon points={areaPoints} fill="url(#chartGradient)" />

                    {/* Đường chính */}
                    <polyline fill="none" stroke="#F97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points} className="drop-shadow-lg" />

                    {/* Các điểm nút */}
                    {data.map((d, i) => {
                        const x = padding + (i * (chartWidth / (data.length - 1)));
                        const y = height - padding - (d.value / maxVal) * chartHeight;
                        return (
                            <g key={i} className="group cursor-pointer">
                                <circle cx={x} cy={y} r="5" fill="#F97316" className="transition-all group-hover:r-7" />
                                <circle cx={x} cy={y} r="10" fill="#F97316" fillOpacity="0.1" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                <text x={x} y={height - 15} textAnchor="middle" className="text-[10px] fill-gray-400 font-bold uppercase">{d.day}</text>
                                {/* Tooltip giả lập bằng SVG */}
                                <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <rect x={x - 40} y={y - 35} width="80" height="25" rx="4" fill="#1F2937" />
                                    <text x={x} y={y - 18} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">{formatCurrency(d.value)}</text>
                                </g>
                            </g>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
};

const RestaurantDashboardPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [orders, setOrders] = useState<OrderResponseData[]>([]);
    const [dishes, setDishes] = useState<DishResponse[]>([]);
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
                const [orderData, dishData] = await Promise.all([
                    orderApiService.getRestaurantOrders(restaurantId),
                    restaurantApiService.getDishes(parseInt(restaurantId, 10))
                ]);
                setOrders(orderData.items);
                setDishes(dishData);
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
        const todayStr = now.toLocaleDateString('en-CA');

        let totalRevenue = 0;
        let todayRevenue = 0;
        let yesterdayRevenue = 0;
        let pendingCount = 0;
        let deliveredCount = 0;

        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        const yesterdayStr = yesterday.toLocaleDateString('en-CA');

        orders.forEach(order => {
            const amount = parseFloat(order.total_amount);
            const orderDate = new Date(order.created_at).toLocaleDateString('en-CA');
            const status = order.status.toLowerCase();

            if (status === 'delivered') {
                totalRevenue += amount;
                deliveredCount++;
                if (orderDate === todayStr) todayRevenue += amount;
                if (orderDate === yesterdayStr) yesterdayRevenue += amount;
            }

            if (['pending_restaurant', 'preparing', 'ready', 'restaurant_accepted'].includes(status)) {
                pendingCount++;
            }
        });

        const avgValue = deliveredCount > 0 ? totalRevenue / deliveredCount : 0;
        const growth = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1) : '0';

        return {
            todayRevenue,
            totalOrders: orders.length,
            pendingCount,
            avgValue,
            growth: parseFloat(growth) >= 0 ? `+${growth}%` : `${growth}%`
        };
    }, [orders]);

    const topItems = useMemo(() => {
        const salesMap: Record<string, { count: number, revenue: number }> = {};
        
        orders.forEach(order => {
            if (order.status.toLowerCase() !== 'cancelled' && order.status.toLowerCase() !== 'restaurant_rejected') {
                order.items.forEach((item: any) => {
                    const id = item.product_id;
                    if (!salesMap[id]) salesMap[id] = { count: 0, revenue: 0 };
                    salesMap[id].count += item.quantity;
                    salesMap[id].revenue += parseFloat(item.unit_price) * item.quantity;
                });
            }
        });

        return Object.entries(salesMap)
            .map(([id, data]) => {
                const dish = dishes.find(d => d.id.toString() === id);
                return {
                    name: dish?.name || 'Món ăn đã xóa',
                    image: dish?.image_url,
                    count: data.count,
                    revenue: data.revenue
                };
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [orders, dishes]);

    const weeklyData = useMemo(() => {
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const now = new Date();
        const result = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            const dStr = d.toLocaleDateString('en-CA');
            
            const dayRevenue = orders
                .filter(o => o.status.toLowerCase() === 'delivered' && new Date(o.created_at).toLocaleDateString('en-CA') === dStr)
                .reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
            
            result.push({
                day: days[d.getDay()],
                value: dayRevenue
            });
        }
        return result;
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
            else if (['pending_restaurant', 'preparing', 'ready', 'restaurant_accepted'].includes(s)) groups['Đang xử lý']++;
            else if (['finding_driver', 'driver_accepted', 'delivering'].includes(s)) groups['Đang giao']++;
            else if (['cancelled', 'restaurant_rejected'].includes(s)) groups['Đã hủy']++;
        });

        return groups;
    }, [orders]);

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-4"></div>
                <p className="text-gray-400 font-medium text-sm">Đang tổng hợp dữ liệu từ hệ thống...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-10 bg-gray-50/30">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-800 tracking-tight">Chào buổi sáng!</h1>
                    <p className="text-gray-400 text-sm mt-1 font-medium">Dưới đây là tóm tắt hoạt động của nhà hàng hôm nay.</p>
                </div>
                <button className="flex items-center text-xs font-semibold text-white bg-gray-900 hover:bg-black px-6 py-3 rounded-xl shadow-lg transition-all active:scale-95 uppercase tracking-widest">
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Tải báo cáo
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <SummaryCard icon={<CashIcon className="h-6 w-6 text-emerald-600"/>} title="Doanh thu hôm nay" value={formatCurrency(stats.todayRevenue)} change={`${stats.growth} so với hôm qua`} color="bg-emerald-50"/>
                <SummaryCard icon={<ClipboardListIcon className="h-6 w-6 text-indigo-600"/>} title="Tổng đơn hàng" value={String(stats.totalOrders)} color="bg-indigo-50"/>
                <SummaryCard icon={<ClockIcon className="h-6 w-6 text-amber-600"/>} title="Đang xử lý" value={String(stats.pendingCount)} color="bg-amber-50"/>
                <SummaryCard icon={<StarIcon className="h-6 w-6 text-rose-600"/>} title="Giá trị TB đơn" value={formatCurrency(stats.avgValue)} color="bg-rose-50"/>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Line Chart */}
                <div className="lg:col-span-2">
                    <RevenueLineChart data={weeklyData} />
                </div>

                {/* Top Menu Items */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <h3 className="font-semibold text-gray-800 text-lg mb-8">Món bán chạy nhất</h3>
                    <div className="space-y-6 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                        {topItems.length > 0 ? topItems.map((item, idx) => (
                            <div key={idx} className="flex items-center space-x-4 group p-2 rounded-2xl hover:bg-gray-50 transition-colors">
                                <div className="h-14 w-14 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300 border border-gray-100 overflow-hidden flex-shrink-0 shadow-inner">
                                    {item.image ? (
                                        <img src={`${BASE_IMG_URL}${item.image}`} className="w-full h-full object-cover" alt={item.name} />
                                    ) : (
                                        <ImageIcon className="h-6 w-6" />
                                    )}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <p className="font-semibold text-sm text-gray-800 truncate group-hover:text-orange-500 transition-colors">{item.name}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-wider">{item.count} lượt bán</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="font-bold text-gray-800 text-sm tracking-tight">{formatCurrency(item.revenue)}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center h-full text-center py-20">
                                <StarIcon className="h-10 w-10 text-gray-100 mb-4" />
                                <p className="text-sm text-gray-400 italic">Chưa có món ăn nào được bán.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Status Statistics */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-semibold text-gray-800 text-lg">Tỉ lệ hoàn thành đơn hàng</h3>
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">Dữ liệu tổng quát</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                    {Object.entries(statusBreakdown).map(([label, count]) => {
                        const total = stats.totalOrders || 1;
                        const percent = Math.round((count / total) * 100);
                        const barColor = getStatusColor(label === 'Đang xử lý' ? 'pending_restaurant' : (label === 'Hoàn thành' ? 'delivered' : (label === 'Đang giao' ? 'delivering' : 'cancelled')));
                        
                        return (
                            <div key={label} className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
                                    <span className="text-base font-semibold text-gray-800">{count}</span>
                                </div>
                                <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                                    <div 
                                        className={`h-full ${barColor} rounded-full transition-all duration-1000 ease-out`} 
                                        style={{ width: `${percent}%` }}
                                    ></div>
                                </div>
                                <p className="text-[10px] text-gray-400 font-medium tracking-tight">{percent}% tổng lượng đơn</p>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #F3F4F6; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #E5E7EB; }
            `}</style>
        </div>
    );
};

export default RestaurantDashboardPage;
