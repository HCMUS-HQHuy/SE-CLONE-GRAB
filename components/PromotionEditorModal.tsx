import React, { useState, useEffect } from 'react';
import { XIcon } from './Icons';

type PromotionType = 'percentage' | 'fixed' | 'free_ship';
type Promotion = {
    id: string | null;
    name: string;
    code: string;
    type: PromotionType;
    value: number;
    minOrderValue: number;
    startDate: string;
    endDate: string;
};

type PromotionEditorModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (promotion: any) => void;
    promotionToEdit: Promotion | null;
};

const PromotionEditorModal: React.FC<PromotionEditorModalProps> = ({ isOpen, onClose, onSave, promotionToEdit }) => {
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
                // Reset form
                setName('');
                setCode('');
                setType('percentage');
                setValue('');
                setMinOrderValue('');
                setStartDate(new Date().toISOString().split('T')[0]);
                setEndDate('');
            }
        }
    }, [isOpen, promotionToEdit]);

    if (!isOpen) return null;

    const handleSave = () => {
        // Validation could be added here
        onSave({
            id: promotionToEdit?.id,
            name, code, type, value: Number(value), minOrderValue: Number(minOrderValue), startDate, endDate
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-gray-800 mb-4">{promotionToEdit ? 'Chỉnh sửa Khuyến mãi' : 'Tạo Khuyến mãi Mới'}</h2>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><XIcon className="h-6 w-6" /></button>
                
                <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                    <div className="form-group"><label>Tên khuyến mãi</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field"/></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group"><label>Mã code</label><input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="input-field"/></div>
                        <div className="form-group"><label>Loại</label><select value={type} onChange={e => setType(e.target.value as PromotionType)} className="input-field"><option value="percentage">%</option><option value="fixed">VNĐ</option><option value="free_ship">Miễn phí vận chuyển</option></select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group"><label>Giá trị</label><input type="number" value={value} onChange={e => setValue(e.target.value)} className="input-field"/></div>
                        <div className="form-group"><label>Đơn tối thiểu</label><input type="number" value={minOrderValue} onChange={e => setMinOrderValue(e.target.value)} className="input-field"/></div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="form-group"><label>Ngày bắt đầu</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-field"/></div>
                        <div className="form-group"><label>Ngày kết thúc</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input-field"/></div>
                    </div>
                </div>

                <div className="pt-4 mt-4 border-t flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md">Hủy</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md">Lưu</button>
                </div>
                 <style>{`
                    .form-group { display: flex; flex-direction: column; }
                    .form-group label { margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #4b5563; }
                    .input-field { border: 1px solid #D1D5DB; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; }
                    .input-field:focus { outline: none; border-color: #F97316; box-shadow: 0 0 0 2px #FDBA74; }
                `}</style>
            </div>
        </div>
    );
};

export default PromotionEditorModal;