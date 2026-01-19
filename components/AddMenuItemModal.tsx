import React, { useState, useEffect, useRef } from 'react';
import { XIcon, UploadIcon, ImageIcon } from './Icons';
import { FoodItem } from '../pages/HomePage';

const BASE_IMG_URL = 'http://localhost:8004/';

type AddMenuItemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newItem: any) => void;
  itemToEdit?: (FoodItem & { category?: string }) | null;
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
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        const parsePrice = (priceStr?: string) => priceStr ? priceStr.replace(/\D/g, '') : '';
        
        setName(itemToEdit.name);
        setDescription(itemToEdit.description);
        
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
          alert('Vui lòng điền các trường bắt buộc: Tên món, Giá, và Phân loại.');
          return;
      }
      onSave({ 
        ...(itemToEdit || {}),
        name, 
        description, 
        price, 
        discountPrice, 
        category, 
        categoryId: CATEGORY_MAP[category] || 1,
        stock, 
        bestseller: isBestseller,
        image: imagePreview,
        imageFile: imageFile // Gửi kèm file thực tế để upload
      });
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-item-title"
    >
      <div 
        className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b pb-4 mb-6">
            <h2 id="add-item-title" className="text-xl font-bold text-gray-800">
              {itemToEdit ? 'Chỉnh sửa món ăn' : 'Thêm món ăn mới'}
            </h2>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors duration-300"
              aria-label="Close"
            >
              <XIcon className="h-6 w-6" />
            </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Image Uploader */}
            <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh món ăn</label>
                <div 
                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-orange-400 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="space-y-1 text-center">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="mx-auto h-32 w-32 object-cover rounded-md"/>
                        ) : (
                            <>
                                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                    <p className="pl-1">Nhấn để tải ảnh lên</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF</p>
                            </>
                        )}
                    </div>
                </div>
                <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
            </div>

            {/* Form Fields */}
            <div className="md:col-span-2 space-y-4">
                <div>
                    <label htmlFor="item-name" className="block text-sm font-medium text-gray-700">Tên món ăn <span className="text-red-500">*</span></label>
                    <input type="text" id="item-name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" placeholder="VD: Cơm tấm sườn bì chả" />
                </div>
                
                <div>
                    <label htmlFor="item-description" className="block text-sm font-medium text-gray-700">Mô tả</label>
                    <textarea id="item-description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" placeholder="Mô tả ngắn về món ăn..."></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="item-price" className="block text-sm font-medium text-gray-700">Giá (VNĐ) <span className="text-red-500">*</span></label>
                        <input type="number" id="item-price" value={price} onChange={e => setPrice(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" placeholder="VD: 55000" />
                    </div>
                     <div>
                        <label htmlFor="item-discount-price" className="block text-sm font-medium text-gray-700">Giá khuyến mãi (VNĐ)</label>
                        <input type="number" id="item-discount-price" value={discountPrice} onChange={e => setDiscountPrice(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" placeholder="Để trống nếu không có" />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="item-category" className="block text-sm font-medium text-gray-700">Phân loại <span className="text-red-500">*</span></label>
                        <select id="item-category" value={category} onChange={e => setCategory(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm">
                             {/* Luôn đảm bảo có các categories cơ bản từ backend */}
                            {['Đại hạ giá', 'Ăn vặt', 'Ăn trưa', 'Đồ uống'].map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="item-stock" className="block text-sm font-medium text-gray-700">Số lượng trong kho</label>
                        <input type="number" id="item-stock" value={stock} onChange={e => setStock(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" placeholder="Để trống nếu không giới hạn"/>
                    </div>
                </div>

                <div className="flex items-center pt-2">
                    <input id="bestseller" name="bestseller" type="checkbox" checked={isBestseller} onChange={e => setIsBestseller(e.target.checked)} className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" />
                    <label htmlFor="bestseller" className="ml-2 block text-sm text-gray-900">Đánh dấu là món bán chạy</label>
                </div>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-5 border-t flex justify-end space-x-3">
            <button 
                type="button" 
                onClick={onClose}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Hủy
            </button>
            <button 
                type="button" 
                onClick={handleSave}
                className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
                {itemToEdit ? 'Lưu thay đổi' : 'Lưu món ăn'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AddMenuItemModal;
