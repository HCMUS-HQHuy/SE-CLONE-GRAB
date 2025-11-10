import React, { useState, useEffect, useRef } from 'react';
import { XIcon, UploadIcon } from './Icons';
import { Restaurant } from '../pages/HomePage';

type EditRestaurantProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: Partial<Restaurant>) => void;
  restaurant: Restaurant;
};

const EditRestaurantProfileModal: React.FC<EditRestaurantProfileModalProps> = ({ isOpen, onClose, onSave, restaurant }) => {
  const [name, setName] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && restaurant) {
      setName(restaurant.name);
      setCuisine(restaurant.cuisine);
      setDescription(restaurant.description);
      setAddress(restaurant.address);
      setPhone(restaurant.phone);
      setOpeningHours(restaurant.openingHours);
      setLogoPreview(restaurant.logoUrl);
      setBannerPreview(restaurant.bannerUrl);
    }
  }, [isOpen, restaurant]);

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave({
      name,
      cuisine,
      description,
      address,
      phone,
      openingHours,
      logoUrl: logoPreview || restaurant.logoUrl,
      bannerUrl: bannerPreview || restaurant.bannerUrl,
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
    >
      <div 
        className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b pb-4 mb-6">
            <h2 id="edit-profile-title" className="text-xl font-bold text-gray-800">
              Chỉnh sửa hồ sơ nhà hàng
            </h2>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors duration-300"
              aria-label="Close"
            >
              <XIcon className="h-6 w-6" />
            </button>
        </div>
        
        <div className="space-y-6">
            {/* Image Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                    <div 
                        className="mt-1 flex items-center space-x-4 p-2 border-2 border-dashed rounded-md"
                        onClick={() => logoInputRef.current?.click()}
                    >
                        <img src={logoPreview || 'https://via.placeholder.com/150'} alt="Logo Preview" className="h-20 w-20 object-cover rounded-full"/>
                        <div className="text-sm text-gray-600 cursor-pointer">
                            <p className="font-semibold text-orange-600">Thay đổi logo</p>
                            <p className="text-xs">Nhấn để chọn ảnh mới</p>
                        </div>
                    </div>
                     <input ref={logoInputRef} type="file" className="sr-only" onChange={(e) => handleImageChange(e, setLogoPreview)} accept="image/*" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh bìa (Banner)</label>
                    <div 
                        className="mt-1 relative h-24 w-full bg-cover bg-center rounded-md border-2 border-dashed"
                        style={{backgroundImage: `url(${bannerPreview || 'https://via.placeholder.com/400x150'})`}}
                        onClick={() => bannerInputRef.current?.click()}
                    >
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center cursor-pointer rounded-md">
                           <div className="text-center text-white">
                                <UploadIcon className="h-6 w-6 mx-auto"/>
                                <p className="text-sm font-semibold">Thay đổi ảnh bìa</p>
                           </div>
                        </div>
                    </div>
                     <input ref={bannerInputRef} type="file" className="sr-only" onChange={(e) => handleImageChange(e, setBannerPreview)} accept="image/*" />
                </div>
            </div>
            
            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="res-name" className="block text-sm font-medium text-gray-700">Tên nhà hàng</label>
                    <input type="text" id="res-name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full input-field" />
                </div>
                <div>
                    <label htmlFor="res-cuisine" className="block text-sm font-medium text-gray-700">Loại hình ẩm thực</label>
                    <input type="text" id="res-cuisine" value={cuisine} onChange={e => setCuisine(e.target.value)} className="mt-1 block w-full input-field" />
                </div>
            </div>

             <div>
                <label htmlFor="res-description" className="block text-sm font-medium text-gray-700">Mô tả</label>
                <textarea id="res-description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="mt-1 block w-full input-field"></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="res-address" className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                    <input type="text" id="res-address" value={address} onChange={e => setAddress(e.target.value)} className="mt-1 block w-full input-field" />
                </div>
                <div>
                    <label htmlFor="res-phone" className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                    <input type="tel" id="res-phone" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 block w-full input-field" />
                </div>
            </div>
             <div>
                <label htmlFor="res-hours" className="block text-sm font-medium text-gray-700">Giờ mở cửa</label>
                <input type="text" id="res-hours" value={openingHours} onChange={e => setOpeningHours(e.target.value)} className="mt-1 block w-full input-field" />
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
                Lưu thay đổi
            </button>
        </div>
      </div>
       <style>{`
            .input-field {
                display: block;
                width: 100%;
                padding: 0.5rem 0.75rem;
                border: 1px solid #D1D5DB;
                border-radius: 0.375rem;
                box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            }
            .input-field:focus {
                outline: none;
                --tw-ring-color: #F97316;
                --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
                --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);
                box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
                border-color: #F97316;
            }
        `}</style>
    </div>
  );
};

export default EditRestaurantProfileModal;
