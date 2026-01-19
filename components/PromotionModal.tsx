
import React, { useState, useEffect } from 'react';
import { XIcon } from './Icons';
import type { Promotion, DiscountType } from '../services/promotionApi';

type PromotionModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (promotion: any) => void;
    promotionToEdit: Promotion | null;
};

const PromotionModal: React.FC<PromotionModalProps> = ({ isOpen, onClose, onSave, promotionToEdit }) => {
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [type, setType] = useState<DiscountType>('percentage');
    const [value, setValue] = useState('');
    const [minOrderValue, setMinOrderValue] = useState('');
    const [maxDiscountValue, setMaxDiscountValue] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [usageLimit, setUsageLimit] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (promotionToEdit) {
                setName(promotionToEdit.name);
                setCode(promotionToEdit.code);
                setType(promotionToEdit.discount_type);
                setValue(String(promotionToEdit.discount_value));
                setMinOrderValue(String(promotionToEdit.min_order_value));
                setMaxDiscountValue(String(promotionToEdit.max_discount_value || '0'));
                setStartDate(promotionToEdit.start_date.split('T')[0]);
                setEndDate(promotionToEdit.end_date.split('T')[0]);
                setUsageLimit(String(promotionToEdit.usage_limit || ''));
                setDescription(promotionToEdit.description || '');
            } else {
                setName('');
                setCode('');
                setType('percentage');
                setValue('');
                setMinOrderValue('0');
                setMaxDiscountValue('0');
                setUsageLimit('');
                setDescription('');
                const today = new Date().toISOString().split('T')[0];
                setStartDate(today);
                setEndDate('');
            }
        }
    }, [isOpen, promotionToEdit]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!name || !code || !value || !startDate || !endDate) {
            alert('Vui lòng điền đầy đủ các trường bắt buộc (*).');
            return;
        }
        onSave({
            id: promotionToEdit?.id,
            name,
            code: code.toUpperCase(),
            description,
            discount_type: type,
            discount_value: Number(value),
            min_order_value: Number(minOrderValue) || 0,
            max_discount_value: Number(maxDiscountValue) || 0,
            start_date: startDate,
            end_date: endDate,
            usage_limit: usageLimit ? Number(usageLimit) : undefined,
        });
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 backdrop-blur-sm"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="relative bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto border border-gray-100"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 tracking-tight">
                        {promotionToEdit ? 'Chỉnh sửa ưu đãi' : 'Tạo ưu đãi mới'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400" aria-label="Close">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Tên chương trình *</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-100 focus:bg-white outline-none transition-all text-sm font-medium" placeholder="VD: Khuyến mãi mùa lễ hội" />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Mô tả ngắn</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-100 focus:bg-white outline-none transition-all text-sm font-medium" rows={2} placeholder="Nội dung sẽ hiển thị cho khách hàng..."></textarea>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Mã code *</label>
                            <input type="text" value={code} onChange={e => setCode(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl font-mono focus:ring-2 focus:ring-orange-100 focus:bg-white outline-none transition-all text-sm font-black uppercase" placeholder="VD: Giam20K" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Loại giảm giá *</label>
                            <select value={type} onChange={e => setType(e.target.value as DiscountType)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-100 focus:bg-white outline-none transition-all text-sm font-semibold">
                                <option value="percentage">Phần trăm (%)</option>
                                <option value="fixed_amount">Tiền mặt (VNĐ)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Giá trị *</label>
                            <input type="number" value={value} onChange={e => setValue(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-100 focus:bg-white outline-none transition-all text-sm font-black" placeholder={type === 'percentage' ? "20 (%)" : "20000"} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Đơn tối thiểu</label>
                            <input type="number" value={minOrderValue} onChange={e => setMinOrderValue(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-100 focus:bg-white outline-none transition-all text-sm font-black" placeholder="VNĐ"/>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Giảm tối đa</label>
                            <input type="number" value={maxDiscountValue} onChange={e => setMaxDiscountValue(e.target.value)} disabled={type === 'fixed_amount'} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-100 focus:bg-white outline-none transition-all text-sm font-black disabled:opacity-30" placeholder="VNĐ"/>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Bắt đầu *</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-100 focus:bg-white outline-none transition-all text-sm font-semibold" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Kết thúc *</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-100 focus:bg-white outline-none transition-all text-sm font-semibold" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Giới hạn sử dụng</label>
                        <input type="number" value={usageLimit} onChange={e => setUsageLimit(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-100 focus:bg-white outline-none transition-all text-sm font-black" placeholder="Để trống nếu không giới hạn" />
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-gray-50 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest">Hủy bỏ</button>
                    <button 
                        type="button" 
                        onClick={handleSave} 
                        className="px-10 py-2.5 bg-orange-500 text-white font-black text-xs rounded-full hover:bg-orange-600 shadow-lg shadow-orange-100 transition-all active:scale-[0.98] uppercase tracking-widest"
                    >
                        Lưu thông tin
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PromotionModal;
