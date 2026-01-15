
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadIcon, PaperClipIcon } from '../components/Icons';
import { restaurantApiService } from '../services/restaurantApi';
import { apiService } from '../services/api';

const FileUploadField: React.FC<{ label: string; file: File | null; onFileSelect: (file: File | null) => void; }> = ({ label, file, onFileSelect }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-orange-400 transition-colors" onClick={() => inputRef.current?.click()}>
                <div className="space-y-1 text-center">
                    {file ? (
                        <>
                            <PaperClipIcon className="mx-auto h-10 w-10 text-green-500"/>
                            <p className="text-sm text-gray-600 font-medium truncate max-w-xs mx-auto">{file.name}</p>
                            <button type="button" onClick={(e) => { e.stopPropagation(); onFileSelect(null); }} className="text-xs text-red-500 hover:underline">Xóa và chọn lại</button>
                        </>
                    ) : (
                        <>
                            <UploadIcon className="mx-auto h-10 w-10 text-gray-400"/>
                            <p className="text-sm text-gray-600">Nhấn để tải lên tài liệu</p>
                            <p className="text-xs text-gray-500">PNG, JPG, PDF (tối đa 5MB)</p>
                        </>
                    )}
                </div>
            </div>
            <input ref={inputRef} type="file" className="sr-only" onChange={(e) => onFileSelect(e.target.files ? e.target.files[0] : null)} />
        </div>
    );
};


const RestaurantApplicationPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Form fields state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState(''); // New field for API
    const [phone, setPhone] = useState('');
    const [openingHours, setOpeningHours] = useState('');
    
    // Documents state
    const [businessLicense, setBusinessLicense] = useState<File | null>(null);
    const [foodSafetyCert, setFoodSafetyCert] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        if (!name || !description || !address || !phone || !openingHours) {
            setError('Vui lòng điền đầy đủ thông tin nhà hàng.');
            return;
        }

        if (!businessLicense || !foodSafetyCert) {
            setError('Vui lòng tải lên đầy đủ các giấy tờ pháp lý (GPKD & ATVSTP).');
            return;
        }

        setIsLoading(true);
        try {
            // 1. Get owner_id from Auth service (port 8003)
            const userProfile = await apiService.getMe('seller');
            const owner_id = userProfile.id;

            // 2. Submit to Restaurant service (port 8004)
            await restaurantApiService.createRestaurant({
                owner_id,
                name,
                address,
                phone,
                description,
                opening_hours: openingHours,
                business_license_image: businessLicense,
                food_safety_certificate_image: foodSafetyCert
            });

            localStorage.setItem('restaurant_profile_status', 'pending');
            navigate('/restaurant/pending', { replace: true });
        } catch (err: any) {
            console.error('Submit error:', err);
            setError(err.message || 'Có lỗi xảy ra trong quá trình gửi hồ sơ. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-800">Hoàn tất hồ sơ đối tác</h1>
                    <p className="text-gray-600 mt-2">Cung cấp thông tin chi tiết về nhà hàng của bạn để Admin xét duyệt.</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Section 1: Store Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-orange-600 border-b border-orange-100 pb-2 mb-4">
                            Thông tin nhà hàng
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tên nhà hàng *</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1 w-full border border-gray-300 p-2.5 rounded-md focus:ring-orange-500 focus:border-orange-500 outline-none" 
                                    placeholder="Ví dụ: Quán Ăn Ngon Sài Gòn"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Địa chỉ cụ thể *</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="mt-1 w-full border border-gray-300 p-2.5 rounded-md focus:ring-orange-500 focus:border-orange-500 outline-none" 
                                    placeholder="Số nhà, tên đường, Phường/Xã, Quận/Huyện..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Mô tả ngắn *</label>
                                <textarea 
                                    required 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="mt-1 w-full border border-gray-300 p-2.5 rounded-md focus:ring-orange-500 focus:border-orange-500 outline-none" 
                                    placeholder="Giới thiệu đôi nét về các món ăn đặc trưng của quán..."
                                ></textarea>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Số điện thoại liên hệ *</label>
                                    <input 
                                        type="tel" 
                                        required 
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="mt-1 w-full border border-gray-300 p-2.5 rounded-md focus:ring-orange-500 focus:border-orange-500 outline-none" 
                                        placeholder="09xx xxx xxx"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Giờ mở cửa *</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={openingHours}
                                        onChange={(e) => setOpeningHours(e.target.value)}
                                        className="mt-1 w-full border border-gray-300 p-2.5 rounded-md focus:ring-orange-500 focus:border-orange-500 outline-none" 
                                        placeholder="Ví dụ: 08:00 - 22:00"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Legal Documents */}
                    <div>
                        <h3 className="text-lg font-semibold text-orange-600 border-b border-orange-100 pb-2 mb-4">
                            Giấy tờ pháp lý
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                           <FileUploadField 
                                label="Giấy phép kinh doanh *" 
                                file={businessLicense} 
                                onFileSelect={setBusinessLicense} 
                           />
                           <FileUploadField 
                                label="Giấy chứng nhận ATVSTP *" 
                                file={foodSafetyCert} 
                                onFileSelect={setFoodSafetyCert} 
                           />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full py-4 px-4 rounded-md text-white bg-orange-500 hover:bg-orange-600 font-bold text-lg shadow-md hover:shadow-lg transform active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                    Đang gửi hồ sơ...
                                </div>
                            ) : 'Gửi hồ sơ đăng ký'}
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-4">
                            Bằng cách nhấn gửi hồ sơ, bạn đồng ý với các Điều khoản & Chính sách của chúng tôi.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RestaurantApplicationPage;
