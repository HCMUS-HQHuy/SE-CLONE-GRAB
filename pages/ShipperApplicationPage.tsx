
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadIcon, PaperClipIcon, UserIcon, PhoneIcon, IdentificationIcon } from '../components/Icons';
import { apiService } from '../services/api';
import { shipperApiService } from '../services/shipperApi';

const FileUploadField: React.FC<{ label: string; file: File | null; onFileSelect: (file: File | null) => void; }> = ({ label, file, onFileSelect }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className="mt-1 flex justify-center px-4 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-orange-400 transition-colors" onClick={() => inputRef.current?.click()}>
                <div className="space-y-1 text-center">
                    {file ? (
                        <>
                            <PaperClipIcon className="mx-auto h-10 w-10 text-green-500"/>
                            <p className="text-sm text-gray-600 font-medium truncate max-w-[150px] mx-auto">{file.name}</p>
                            <button type="button" onClick={(e) => { e.stopPropagation(); onFileSelect(null); }} className="text-xs text-red-500 hover:underline">Xóa và chọn lại</button>
                        </>
                    ) : (
                        <>
                            <UploadIcon className="mx-auto h-10 w-10 text-gray-400"/>
                            <p className="text-sm text-gray-600">Chọn ảnh</p>
                            <p className="text-xs text-gray-500">PNG, JPG</p>
                        </>
                    )}
                </div>
            </div>
            <input ref={inputRef} type="file" className="sr-only" onChange={(e) => onFileSelect(e.target.files ? e.target.files[0] : null)} accept="image/*" />
        </div>
    );
};

const ShipperApplicationPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form fields state
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [driverId, setDriverId] = useState('');

    // Documents state
    const [idCard, setIdCard] = useState<File | null>(null);
    const [driverLicense, setDriverLicense] = useState<File | null>(null);
    const [vehicleReg, setVehicleReg] = useState<File | null>(null);

    // Fetch initial info from Auth service
    useEffect(() => {
        const fetchInitialInfo = async () => {
            try {
                const userMe = await apiService.getMe('shipper');
                setEmail(userMe.email);
                setDriverId(userMe.id.toString());
            } catch (err) {
                console.error("Failed to fetch user info", err);
                navigate('/shipper/auth');
            }
        };
        fetchInitialInfo();
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!fullName || !phoneNumber || !licenseNumber || !idCard || !driverLicense || !vehicleReg) {
            setError('Vui lòng điền đầy đủ thông tin và tải lên tất cả các giấy tờ được yêu cầu.');
            return;
        }

        setIsLoading(true);
        try {
            await shipperApiService.createDriverProfile({
                fullName,
                phoneNumber,
                email,
                licenseNumber,
                citizenIdImage: idCard,
                driverLicenseImage: driverLicense,
                driverRegistrationImage: vehicleReg,
                driverId
            });

            localStorage.setItem('shipper_profile_status', 'pending');
            navigate('/shipper/pending', { replace: true });
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi gửi hồ sơ. Vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
            <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Hoàn tất hồ sơ tài xế</h1>
                    <p className="text-gray-600 mt-2">Cung cấp thông tin định danh để chúng tôi xác thực tài khoản của bạn.</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Section 1: Basic Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-orange-600 border-b border-orange-100 pb-2 mb-4">
                            Thông tin cá nhân
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Họ và tên *</label>
                                <div className="mt-1 relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                        <UserIcon className="h-5 w-5" />
                                    </span>
                                    <input 
                                        type="text" 
                                        required 
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 outline-none" 
                                        placeholder="Nguyễn Văn A" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Số điện thoại *</label>
                                <div className="mt-1 relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                        <PhoneIcon className="h-5 w-5" />
                                    </span>
                                    <input 
                                        type="tel" 
                                        required 
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 outline-none" 
                                        placeholder="0912 xxx xxx" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email (Mặc định)</label>
                                <input 
                                    type="email" 
                                    value={email}
                                    readOnly
                                    className="mt-1 w-full border border-gray-200 bg-gray-50 p-2 rounded-md text-gray-500 cursor-not-allowed" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Số bằng lái xe (GPLX) *</label>
                                <div className="mt-1 relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                        <IdentificationIcon className="h-5 w-5" />
                                    </span>
                                    <input 
                                        type="text" 
                                        required 
                                        value={licenseNumber}
                                        onChange={(e) => setLicenseNumber(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 outline-none" 
                                        placeholder="VD: 790xxxxxxxxxx" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Documents */}
                    <div>
                        <h3 className="text-lg font-semibold text-orange-600 border-b border-orange-100 pb-2 mb-4">
                            Giấy tờ định danh
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                           <FileUploadField label="Ảnh CCCD/CMND*" file={idCard} onFileSelect={setIdCard} />
                           <FileUploadField label="Ảnh Bằng lái xe*" file={driverLicense} onFileSelect={setDriverLicense} />
                           <FileUploadField label="Ảnh Đăng ký xe*" file={vehicleReg} onFileSelect={setVehicleReg} />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full py-4 px-4 rounded-md text-white bg-orange-500 hover:bg-orange-600 font-bold text-lg shadow-md hover:shadow-lg transform active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                    Đang xử lý hồ sơ...
                                </div>
                            ) : 'Gửi hồ sơ đăng ký'}
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-4">
                            Thông tin của bạn sẽ được bảo mật và chỉ dùng cho mục đích định danh tài xế.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShipperApplicationPage;
