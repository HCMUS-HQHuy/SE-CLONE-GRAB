
import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, TicketIcon, ExclamationIcon } from '../components/Icons';
import PromotionModal from '../components/PromotionModal';
import { promotionApiService, Promotion } from '../services/promotionApi';
import { restaurantApiService } from '../services/restaurantApi';
import { apiService } from '../services/api';

const getStatus = (promo: Promotion) => {
    if (!promo.is_active) return 'expired';
    const now = new Date();
    const start = new Date(promo.start_date);
    const end = new Date(promo.end_date);
    end.setHours(23, 59, 59, 999);

    if (now < start) return 'scheduled';
    if (now > end) return 'expired';
    return 'active';
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const styles: Record<string, string> = {
        active: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        scheduled: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        expired: 'bg-rose-50 text-rose-600 border-rose-100',
    };
    const text: Record<string, string> = {
        active: 'Đang chạy',
        scheduled: 'Sắp diễn ra',
        expired: 'Kết thúc/Khóa',
    };
    return <span className={`px-3 py-1 inline-flex text-[10px] uppercase leading-none font-black rounded-full border ${styles[status]}`}>{text[status]}</span>;
};

const PromotionsPage: React.FC = () => {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [restaurantId, setRestaurantId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [promotionToEdit, setPromotionToEdit] = useState<Promotion | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            try {
                const me = await apiService.getMe('seller');
                const res = await restaurantApiService.getRestaurantByOwner(me.id);
                setRestaurantId(res.id);
                fetchPromotions(res.id);
            } catch (err: any) {
                setError(err.message);
                setIsLoading(false);
            }
        };
        init();
    }, []);

    const fetchPromotions = async (id: number) => {
        setIsLoading(true);
        try {
            const data = await promotionApiService.getRestaurantPromotions(id);
            setPromotions(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        setPromotionToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (promo: Promotion) => {
        setPromotionToEdit(promo);
        setIsModalOpen(true);
    };
    
    const handleDelete = async (promoId: number) => {
        if(window.confirm('Bạn có chắc muốn xóa chương trình khuyến mãi này không?')) {
            try {
                await promotionApiService.deletePromotion(promoId);
                setPromotions(prev => prev.filter(p => p.id !== promoId));
            } catch (err: any) {
                alert(err.message);
            }
        }
    };

    const handleSave = async (promoData: any) => {
        if (!restaurantId) return;
        
        try {
            if (promoData.id) {
                const updated = await promotionApiService.updatePromotion(promoData.id, promoData);
                setPromotions(prev => prev.map(p => p.id === updated.id ? updated : p));
            } else {
                const created = await promotionApiService.createPromotion(restaurantId, promoData);
                setPromotions(prev => [created, ...prev]);
            }
            setIsModalOpen(false);
        } catch (err: any) {
            alert(err.message);
        }
    };
    
    const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('vi-VN');

    if (isLoading && promotions.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50/30">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-4"></div>
                <p className="text-gray-400 font-medium text-sm">Đang tải danh sách ưu đãi...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-800 tracking-tight">Chiến dịch Ưu đãi</h1>
                    <p className="text-gray-400 text-sm mt-1 font-medium">Tạo và quản lý các mã giảm giá cho khách hàng của bạn.</p>
                </div>
                <button 
                    onClick={handleCreate} 
                    className="inline-flex items-center px-6 py-3 border border-transparent text-xs font-black rounded-xl shadow-lg text-white bg-orange-500 hover:bg-orange-600 transition-all active:scale-95 uppercase tracking-widest"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Tạo khuyến mãi
                </button>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl mb-6 flex items-center text-sm font-medium">
                    <ExclamationIcon className="h-5 w-5 mr-2"/> {error}
                </div>
            )}

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-50">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th scope="col" className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Chương trình</th>
                                <th scope="col" className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Mã code</th>
                                <th scope="col" className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Giá trị</th>
                                <th scope="col" className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Thời hạn</th>
                                <th scope="col" className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Lượt dùng</th>
                                <th scope="col" className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Trạng thái</th>
                                <th scope="col" className="relative px-8 py-5"><span className="sr-only">Hành động</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {promotions.length > 0 ? promotions.map(promo => (
                                <tr key={promo.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">{promo.name}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-tight">Đơn tối thiểu: {formatCurrency(promo.min_order_value)}</div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <span className="px-3 py-1.5 text-xs font-black bg-gray-50 text-gray-700 rounded-lg border border-gray-100 font-mono tracking-wider">{promo.code}</span>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-800 font-black">
                                        {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : formatCurrency(promo.discount_value)}
                                        {promo.discount_type === 'percentage' && promo.max_discount_value > 0 && (
                                            <span className="block text-[10px] text-emerald-600 font-bold uppercase mt-0.5 tracking-tighter">(Tối đa {formatCurrency(promo.max_discount_value)})</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-[11px] text-gray-500 font-bold uppercase tracking-tight">
                                        {formatDate(promo.start_date)} - {formatDate(promo.end_date)}
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-900 font-black">
                                        {promo.used_count} <span className="text-gray-300 font-normal">/ {promo.usage_limit || '∞'}</span>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap"><StatusBadge status={getStatus(promo)} /></td>
                                    <td className="px-8 py-6 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button onClick={() => handleEdit(promo)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Chỉnh sửa"><PencilIcon className="h-5 w-5"/></button>
                                            <button onClick={() => handleDelete(promo.id)} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="Xóa bỏ"><TrashIcon className="h-5 w-5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="h-16 w-16 bg-gray-50 rounded-3xl flex items-center justify-center mb-4">
                                                <TicketIcon className="h-8 w-8 text-gray-200"/>
                                            </div>
                                            <p className="text-gray-400 font-semibold italic text-sm">Chưa có mã giảm giá nào được tạo.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <PromotionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                promotionToEdit={promotionToEdit}
            />
        </div>
    );
};

export default PromotionsPage;
