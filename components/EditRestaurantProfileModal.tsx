
import React, { useState, useEffect, useRef } from 'react';
import { XIcon, UploadIcon, HomeIcon, PhoneIcon, ClockIcon, DocumentTextIcon } from './Icons';
import { Restaurant } from '../pages/HomePage';
import { UpdateRestaurantRequest } from '../services/restaurantApi';


type EditRestaurantProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: UpdateRestaurantRequest) => void;
  restaurant: Restaurant;
};

const EditRestaurantProfileModal: React.FC<EditRestaurantProfileModalProps> = ({ isOpen, onClose, onSave, restaurant }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [isOpenNow, setIsOpenNow] = useState(true);

  useEffect(() => {
    if (isOpen && restaurant) {
      setName(restaurant.name);
      setDescription(restaurant.description);
      setAddress(restaurant.address);
      setPhone(restaurant.phone);
      setOpeningHours(restaurant.openingHours);
    }
  }, [isOpen, restaurant]);

  const handleSave = () => {
    onSave({
      name,
      description,
      address,
      phone,
      opening_hours: openingHours,
      is_open: isOpenNow
    });
  };

  if (!isOpen) return null;

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
              Chỉnh sửa thông tin quán
            </h2>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
              aria-label="Close"
            >
              <XIcon className="h-6 w-6" />
            </button>
        </div>
        
        <div className="space-y-6">
            <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Tên nhà hàng</label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400"><HomeIcon className="h-4 w-4" /></span>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-100 focus:bg-white outline-none transition-all text-sm font-medium" placeholder="Tên quán của bạn" />
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Giới thiệu</label>
                <div className="relative">
                    <span className="absolute top-3 left-4 text-gray-400"><DocumentTextIcon className="h-4 w-4" /></span>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-100 focus:bg-white outline-none transition-all text-sm font-medium" placeholder="Mô tả về quán..."></textarea>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Số điện thoại</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400"><PhoneIcon className="h-4 w-4" /></span>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-100 focus:bg-white outline-none transition-all text-sm font-medium" placeholder="09xx..." />
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Giờ mở cửa</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400"><ClockIcon className="h-4 w-4" /></span>
                        <input type="text" value={openingHours} onChange={e => setOpeningHours(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-100 focus:bg-white outline-none transition-all text-sm font-medium" placeholder="VD: 08:00 - 22:00" />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Địa chỉ</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-100 focus:bg-white outline-none transition-all text-sm font-medium" placeholder="Địa chỉ chi tiết" />
            </div>

            <div className="flex items-center space-x-3 pt-2">
                <button 
                    type="button"
                    onClick={() => setIsOpenNow(!isOpenNow)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isOpenNow ? 'bg-green-500' : 'bg-gray-200'}`}
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isOpenNow ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái mở cửa</span>
            </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-50 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest">Hủy</button>
            <button type="button" onClick={handleSave} className="px-10 py-2.5 bg-orange-500 text-white font-semibold text-xs rounded-full hover:bg-orange-600 shadow-lg shadow-orange-100 transition-all active:scale-[0.98] uppercase tracking-widest">
                Lưu hồ sơ
            </button>
        </div>
      </div>
    </div>
  );
};

export default EditRestaurantProfileModal;
