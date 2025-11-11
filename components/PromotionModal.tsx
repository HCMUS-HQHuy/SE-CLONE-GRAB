import React, { useState, useEffect } from 'react';
import { XIcon } from './Icons';
import type { Promotion, PromotionType } from '../pages/PromotionsPage';

type PromotionModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (promotion: any) => void;
    promotionToEdit: Promotion | null;
};

const PromotionModal: React.FC<PromotionModalProps> = ({ isOpen, onClose, onSave, promotionToEdit }) => {
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [type, setType] = useState<PromotionType>('percentage');
    const [value, setValue] = useState('');
    const [minOrderValue, setMinOrderValue] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (promotionToEdit) {
                setName(promotionToEdit.name);
                setCode(promotionToEdit.code);
                setType(promotionToEdit.type);
                setValue(String(promotionToEdit.value));
                setMinOrderValue(String(promotionToEdit.minOrderValue));
                setStartDate(promotionToEdit.startDate);
                setEndDate(promotionToEdit.endDate);
            } else {
                // Reset form for new promotion
                setName('');
                setCode('');
                setType('percentage');
                setValue('');
                setMinOrderValue('');
                const today = new Date().toISOString().split('T')[0];
                setStartDate(today);
                setEndDate('');
            }
        }
    }, [isOpen, promotionToEdit]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!name || !code || !value || !startDate || !endDate) {
            alert('Vui lòng điền đầy đủ các trường bắt buộc.');
            return;
        }
        onSave({
            id: promotionToEdit?.id,
            name,
            code,
            type,
            value: Number(value),
            minOrderValue: Number(minOrderValue) || 0,
            startDate,
            endDate,
        });
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="promotion-modal-title"
        >
            <div
                className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center border-b pb-4 mb-6">
                    <h2 id="promotion-modal-title" className="text-xl font-bold text-gray-800">
                        {promotionToEdit ? 'Chỉnh sửa khuyến mãi' : 'Tạo khuyến mãi mới'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label htmlFor="promo-name" className="block text-sm font-medium text-gray-700">Tên chương trình*</label>
                        <input type="text" id="promo-name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full input-field" placeholder="VD: Giảm giá cuối tuần" />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="promo-code" className="block text-sm font-medium text-gray-700">Mã giảm giá*</label>
                            <input type="text" id="promo-code" value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="mt-1 block w-full input-field" placeholder="VD: WEEKEND10" />
                        </div>
                        <div>
                            <label htmlFor="promo-type" className="block text-sm font-medium text-gray-700">Loại khuyến mãi*</label>
                            <select id="promo-type" value={type} onChange={e => setType(e.target.value as PromotionType)} className="mt-1 block w-full input-field">
                                <option value="percentage">Phần trăm (%)</option>
                                <option value="fixed">Số tiền cố định (VNĐ)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="promo-value" className="block text-sm font-medium text-gray-700">Giá trị*</label>
                            <input type="number" id="promo-value" value={value} onChange={e => setValue(e.target.value)} className="mt-1 block w-full input-field" placeholder={type === 'percentage' ? "VD: 10 cho 10%" : "VD: 20000 cho 20.000đ"} />
                        </div>
                        <div>
                            <label htmlFor="promo-min-order" className="block text-sm font-medium text-gray-700">Đơn hàng tối thiểu (VNĐ)</label>
                            <input type="number" id="promo-min-order" value={minOrderValue} onChange={e => setMinOrderValue(e.target.value)} className="mt-1 block w-full input-field" placeholder="Để trống nếu không có"/>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="promo-start-date" className="block text-sm font-medium text-gray-700">Ngày bắt đầu*</label>
                            <input type="date" id="promo-start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full input-field" />
                        </div>
                        <div>
                            <label htmlFor="promo-end-date" className="block text-sm font-medium text-gray-700">Ngày kết thúc*</label>
                            <input type="date" id="promo-end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full input-field" />
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-5 border-t flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">Hủy</button>
                    <button type="button" onClick={handleSave} className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none">Lưu</button>
                </div>
            </div>
             <style>{`.input-field { border: 1px solid #D1D5DB; border-radius: 0.375rem; padding: 0.5rem 0.75rem; } .input-field:focus { outline: none; border-color: #F97316; box-shadow: 0 0 0 1px #F97316; }`}</style>
        </div>
    );
};

export default PromotionModal;
