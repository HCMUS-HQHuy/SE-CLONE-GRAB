
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
        active: 'bg-green-100 text-green-800',
        scheduled: 'bg-blue-100 text-blue-800',
        expired: 'bg-gray-100 text-gray-800',
    };
    const text: Record<string, string> = {
        active: 'Đang hoạt động',
        scheduled: 'Sắp diễn ra',
        expired: 'Đã kết thúc/Khóa',
    };
    return <span className={`px-2 inline-flex text-[10px] uppercase leading-5 font-bold rounded-full border ${styles[status]}`}>{text[status]}</span>;
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
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Quản lý Khuyến mãi</h1>
                    <p className="text-gray-500 mt-1">Tạo mã giảm giá để thu hút khách hàng cho nhà hàng của bạn.</p>
                </div>
                <button onClick={handleCreate} className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-black rounded-xl shadow-lg text-white bg-orange-500 hover:bg-orange-600 transition-all active:scale-95">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    TẠO KHUYẾN MÃI
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 flex items-center">
                    <ExclamationIcon className="h-5 w-5 mr-2"/> {error}
                </div>
            )}

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên chương trình</th>
                                <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Mã code</th>
                                <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Giá trị giảm</th>
                                <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Thời gian</th>
                                <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Lượt dùng</th>
                                <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái</th>
                                <th scope="col" className="relative px-6 py-4"><span className="sr-only">Hành động</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {promotions.length > 0 ? promotions.map(promo => (
                                <tr key={promo.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-gray-900">{promo.name}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Đơn tối thiểu: {formatCurrency(promo.min_order_value)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-3 py-1 text-xs font-black bg-orange-50 text-orange-600 rounded-lg border border-orange-100">{promo.code}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-black">
                                        {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : formatCurrency(promo.discount_value)}
                                        {promo.discount_type === 'percentage' && promo.max_discount_value > 0 && (
                                            <span className="block text-[10px] text-gray-400 font-normal italic">(Tối đa {formatCurrency(promo.max_discount_value)})</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-medium">
                                        {formatDate(promo.start_date)} - {formatDate(promo.end_date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                                        {promo.used_count} <span className="text-gray-300 font-normal">/ {promo.usage_limit || '∞'}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={getStatus(promo)} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button onClick={() => handleEdit(promo)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><PencilIcon className="h-5 w-5"/></button>
                                            <button onClick={() => handleDelete(promo.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><TrashIcon className="h-5 w-5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <TicketIcon className="h-12 w-12 text-gray-200 mb-2"/>
                                            <p className="text-gray-400 font-medium italic">Bạn chưa có chương trình khuyến mãi nào.</p>
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
