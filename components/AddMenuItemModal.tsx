import React, { useState, useEffect, useRef } from 'react';
import { XIcon, UploadIcon, ImageIcon } from './Icons';
import { FoodItem } from '../pages/HomePage';

const BASE_IMG_URL = 'http://localhost:8004/';

type AddMenuItemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newItem: any) => void;
  itemToEdit?: (FoodItem & { category?: string; stock_quantity?: number; category_id?: number }) | null;
  categories: string[];
};

// Mapping tên category sang ID theo yêu cầu backend
const CATEGORY_MAP: Record<string, number> = {
    'Đại hạ giá': 1,
    'Ăn vặt': 2,
    'Ăn trưa': 3,
    'Đồ uống': 4
};

const AddMenuItemModal: React.FC<AddMenuItemModalProps> = ({ isOpen, onClose, onSave, itemToEdit, categories }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Đại hạ giá');
  const [stock, setStock] = useState('');
  const [isBestseller, setIsBestseller] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        const parsePrice = (priceStr?: string) => priceStr ? priceStr.replace(/\D/g, '') : '';
        
        setName(itemToEdit.name);
        setDescription(itemToEdit.description || '');
        
        if (itemToEdit.newPrice && itemToEdit.oldPrice) {
            setPrice(parsePrice(itemToEdit.oldPrice));
            setDiscountPrice(parsePrice(itemToEdit.newPrice));
        } else {
            setPrice(parsePrice(itemToEdit.price || itemToEdit.newPrice));
            setDiscountPrice('');
        }
        
        setCategory(itemToEdit.category || categories[0] || 'Đại hạ giá');
        setIsBestseller(itemToEdit.bestseller);
        setImagePreview(BASE_IMG_URL + itemToEdit.image || null);
        setImageFile(null);
        setStock(''); 
      } else {
        setName('');
        setDescription('');
        setPrice('');
        setDiscountPrice('');
        setCategory(categories[0] || 'Đại hạ giá');
        setStock('');
        setIsBestseller(false);
        setImagePreview(null);
        setImageFile(null);
      }
    }
  }, [isOpen, itemToEdit, categories]);

  if (!isOpen) return null;

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSave = () => {
      if (!name || !price || !category) {
          alert('Vui lòng điền các trường bắt buộc (*).');
          return;
      }
      onSave({ 
        id: itemToEdit?.id,
        name, 
        description, 
        price, 
        discountPrice, 
        category, 
        categoryId: CATEGORY_MAP[category] || 1,
        stock, 
        bestseller: isBestseller,
        imageFile: imageFile // File thực tế để upload
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
              {itemToEdit ? 'Cập nhật món ăn' : 'Thêm món ăn mới'}
            </h2>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
              aria-label="Close"
            >
              <XIcon className="h-6 w-6" />
            </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="md:col-span-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Hình ảnh</label>
                <div 
                    className="mt-1 aspect-square flex justify-center items-center border-2 border-gray-100 border-dashed rounded-3xl cursor-pointer hover:border-orange-200 hover:bg-orange-50/30 transition-all overflow-hidden relative group"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {imagePreview ? (
                        <>
                            <img src={imagePreview.startsWith('data:') || imagePreview.startsWith('http') ? imagePreview : `http://localhost:8004/${imagePreview}`} alt="Preview" className="h-full w-full object-cover"/>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <UploadIcon className="h-8 w-8 text-white" />
                            </div>
                        </>
                    ) : (
                        <div className="text-center p-4">
                            <ImageIcon className="mx-auto h-8 w-8 text-gray-300" />
                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-3">Tải ảnh</p>
                        </div>
                    )}
                </div>
                <input ref={fileInputRef} type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
            </div>

            <div className="md:col-span-2 space-y-6">
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Tên món *</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-100 focus:bg-white outline-none transition-all text-sm font-medium" placeholder="VD: Bún đậu mắm tôm" />
                </div>
                
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Mô tả</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-100 focus:bg-white outline-none transition-all text-sm font-medium" placeholder="Thành phần, hương vị..."></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Giá bán *</label>
                        <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-100 focus:bg-white outline-none transition-all text-sm font-medium" placeholder="VNĐ" />
                    </div>
                     <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Giảm còn</label>
                        <input type="number" value={discountPrice} onChange={e => setDiscountPrice(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-100 focus:bg-white outline-none transition-all text-sm font-medium" placeholder="VNĐ" />
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Danh mục *</label>
                        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-100 focus:bg-white outline-none transition-all text-sm font-medium">
                            {['Đại hạ giá', 'Ăn vặt', 'Ăn trưa', 'Đồ uống'].map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Số lượng kho</label>
                        <input type="number" value={stock} onChange={e => setStock(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-100 focus:bg-white outline-none transition-all text-sm font-medium" placeholder="Không giới hạn"/>
                    </div>
                </div>

                <div className="flex items-center pt-2">
                    <input id="bestseller" type="checkbox" checked={isBestseller} onChange={e => setIsBestseller(e.target.checked)} className="h-4 w-4 text-orange-500 focus:ring-orange-200 border-gray-200 rounded cursor-pointer" />
                    <label htmlFor="bestseller" className="ml-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer">Đánh dấu bán chạy</label>
                </div>
            </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-50 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest">Hủy bỏ</button>
            <button type="button" onClick={handleSave} className="px-10 py-2.5 bg-orange-500 text-white font-semibold text-xs rounded-full hover:bg-orange-600 shadow-lg shadow-orange-100 transition-all active:scale-[0.98] uppercase tracking-widest">
                {itemToEdit ? 'Cập nhật ngay' : 'Thêm vào menu'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AddMenuItemModal;
