import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadIcon, PaperClipIcon } from '../components/Icons';

const FileUploadField: React.FC<{ label: string; file: File | null; onFileSelect: (file: File | null) => void; }> = ({ label, file, onFileSelect }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer" onClick={() => inputRef.current?.click()}>
                <div className="space-y-1 text-center">
                    {file ? (
                        <>
                            <PaperClipIcon className="mx-auto h-10 w-10 text-green-500"/>
                            <p className="text-sm text-gray-600">{file.name}</p>
                            <button onClick={(e) => { e.stopPropagation(); onFileSelect(null); }} className="text-xs text-red-500 hover:underline">Xóa</button>
                        </>
                    ) : (
                        <>
                            <UploadIcon className="mx-auto h-10 w-10 text-gray-400"/>
                            <p className="text-sm text-gray-600">Nhấn để tải lên</p>
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
    const [businessLicense, setBusinessLicense] = useState<File | null>(null);
    const [foodSafetyCert, setFoodSafetyCert] = useState<File | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!businessLicense || !foodSafetyCert) {
            alert('Vui lòng tải lên đầy đủ các giấy tờ cần thiết.');
            return;
        }
        localStorage.setItem('restaurant_profile_status', 'pending');
        navigate('/restaurant/pending', { replace: true });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-2xl font-bold text-gray-800 text-center">Hoàn tất hồ sơ đối tác</h1>
                <p className="text-gray-600 mt-2 text-center mb-8">Cung cấp thông tin chi tiết về nhà hàng của bạn để chúng tôi có thể xét duyệt.</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Thông tin nhà hàng</h3>
                        <div className="space-y-4">
                            <div><label className="block text-sm font-medium text-gray-700">Tên nhà hàng</label><input type="text" required className="mt-1 w-full border border-gray-300 p-2 rounded-md" /></div>
                            <div><label className="block text-sm font-medium text-gray-700">Địa chỉ</label><input type="text" required className="mt-1 w-full border border-gray-300 p-2 rounded-md" /></div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Giấy tờ pháp lý</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                           <FileUploadField label="Giấy phép kinh doanh*" file={businessLicense} onFileSelect={setBusinessLicense} />
                           <FileUploadField label="VS an toàn thực phẩm*" file={foodSafetyCert} onFileSelect={setFoodSafetyCert} />
                        </div>
                    </div>
                    <div>
                        <button type="submit" className="w-full py-3 px-4 rounded-md text-white bg-orange-500 hover:bg-orange-600 font-medium">Gửi hồ sơ</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RestaurantApplicationPage;