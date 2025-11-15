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
                            <p className="text-xs text-gray-500">PNG, JPG (tối đa 2MB)</p>
                        </>
                    )}
                </div>
            </div>
            <input ref={inputRef} type="file" className="sr-only" onChange={(e) => onFileSelect(e.target.files ? e.target.files[0] : null)} />
        </div>
    );
};

const ShipperApplicationPage: React.FC = () => {
    const navigate = useNavigate();
    const [idCard, setIdCard] = useState<File | null>(null);
    const [driverLicense, setDriverLicense] = useState<File | null>(null);
    const [vehicleReg, setVehicleReg] = useState<File | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!idCard || !driverLicense || !vehicleReg) {
            alert('Vui lòng tải lên đầy đủ các giấy tờ cần thiết.');
            return;
        }
        localStorage.setItem('shipper_profile_status', 'pending');
        navigate('/shipper/pending', { replace: true });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-2xl font-bold text-gray-800 text-center">Hoàn tất hồ sơ tài xế</h1>
                <p className="text-gray-600 mt-2 text-center mb-8">Cung cấp thông tin và giấy tờ để chúng tôi xác thực tài khoản của bạn.</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Thông tin phương tiện</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium text-gray-700">Loại xe</label><input type="text" required className="mt-1 w-full border border-gray-300 p-2 rounded-md" placeholder="VD: Honda Wave Alpha" /></div>
                            <div><label className="block text-sm font-medium text-gray-700">Biển số xe</label><input type="text" required className="mt-1 w-full border border-gray-300 p-2 rounded-md" placeholder="VD: 59-T1 123.45" /></div>
                        </div>
                    </div>
                     <div>
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Giấy tờ cá nhân</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                           <FileUploadField label="Ảnh CCCD/CMND*" file={idCard} onFileSelect={setIdCard} />
                           <FileUploadField label="Ảnh Bằng lái xe*" file={driverLicense} onFileSelect={setDriverLicense} />
                           <FileUploadField label="Ảnh Đăng ký xe*" file={vehicleReg} onFileSelect={setVehicleReg} />
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

export default ShipperApplicationPage;