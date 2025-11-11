import React, { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '../components/Icons';
import PromotionModal from '../components/PromotionModal';

export type PromotionStatus = 'active' | 'scheduled' | 'expired';
export type PromotionType = 'percentage' | 'fixed';

export type Promotion = {
    id: string;
    name: string;
    code: string;
    type: PromotionType;
    value: number;
    minOrderValue: number;
    startDate: string;
    endDate: string;
    status: PromotionStatus;
    usageCount: number;
};

const getStatus = (startDate: string, endDate: string): PromotionStatus => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Consider end of day

    if (now < start) return 'scheduled';
    if (now > end) return 'expired';
    return 'active';
};


const mockPromotions: Promotion[] = [
    { id: 'PROMO001', name: 'Giảm giá cuối tuần', code: 'WEEKEND10', type: 'percentage', value: 10, minOrderValue: 200000, startDate: '2024-07-26', endDate: '2024-07-28', status: 'expired', usageCount: 150 },
    { id: 'PROMO002', name: 'Chào bạn mới', code: 'NEWUSER20K', type: 'fixed', value: 20000, minOrderValue: 50000, startDate: '2024-07-01', endDate: '2024-08-31', status: 'active', usageCount: 88 },
    { id: 'PROMO003', name: 'Freeship đơn từ 100k', code: 'FREESHIP100', type: 'fixed', value: 15000, minOrderValue: 100000, startDate: '2024-07-15', endDate: '2024-08-15', status: 'active', usageCount: 210 },
    { id: 'PROMO004', name: 'Flash Sale 8/8', code: 'SALE88', type: 'percentage', value: 30, minOrderValue: 150000, startDate: '2024-08-08', endDate: '2024-08-08', status: 'scheduled', usageCount: 0 },
];

const StatusBadge: React.FC<{ status: PromotionStatus }> = ({ status }) => {
    const styles = {
        active: 'bg-green-100 text-green-800',
        scheduled: 'bg-blue-100 text-blue-800',
        expired: 'bg-gray-100 text-gray-800',
    };
    const text = {
        active: 'Đang hoạt động',
        scheduled: 'Sắp diễn ra',
        expired: 'Đã kết thúc',
    };
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>{text[status]}</span>;
};

const PromotionsPage: React.FC = () => {
    const [promotions, setPromotions] = useState<Promotion[]>(mockPromotions.map(p => ({...p, status: getStatus(p.startDate, p.endDate)})));
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [promotionToEdit, setPromotionToEdit] = useState<Promotion | null>(null);

    const handleCreate = () => {
        setPromotionToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (promo: Promotion) => {
        setPromotionToEdit(promo);
        setIsModalOpen(true);
    };
    
    const handleDelete = (promoId: string) => {
        if(window.confirm('Bạn có chắc muốn xóa chương trình khuyến mãi này không?')) {
            setPromotions(prev => prev.filter(p => p.id !== promoId));
        }
    };

    const handleSave = (promoData: any) => {
        if (promoData.id) { // Editing
            setPromotions(prev => prev.map(p => p.id === promoData.id ? { ...p, ...promoData, status: getStatus(promoData.startDate, promoData.endDate) } : p));
        } else { // Creating
            const newPromo: Promotion = {
                ...promoData,
                id: `PROMO${String(Date.now()).slice(-4)}`,
                status: getStatus(promoData.startDate, promoData.endDate),
                usageCount: 0,
            };
            setPromotions(prev => [newPromo, ...prev]);
        }
        setIsModalOpen(false);
    };
    
    const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('vi-VN');

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Quản lý khuyến mãi</h1>
                <button onClick={handleCreate} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Tạo khuyến mãi
                </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên chương trình</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá trị</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lượt dùng</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Hành động</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {promotions.map(promo => (
                                <tr key={promo.id}>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{promo.name}</div><div className="text-xs text-gray-500">Đơn tối thiểu: {formatCurrency(promo.minOrderValue)}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 py-1 text-xs font-mono bg-gray-100 rounded">{promo.code}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-semibold">{promo.type === 'percentage' ? `${promo.value}%` : formatCurrency(promo.value)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(promo.startDate)} - {formatDate(promo.endDate)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{promo.usageCount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={promo.status} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleEdit(promo)} className="text-indigo-600 hover:text-indigo-900 mr-3"><PencilIcon className="h-5 w-5"/></button>
                                        <button onClick={() => handleDelete(promo.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5" /></button>
                                    </td>
                                </tr>
                            ))}
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
