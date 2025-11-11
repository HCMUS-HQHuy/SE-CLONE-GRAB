import React, { useState } from 'react';
import { UserIcon, PhoneIcon, PencilIcon, UploadIcon, StarIcon, ShieldCheckIcon, IdentificationIcon, CheckCircleIcon, XCircleIcon } from '../components/Icons';

// Mock data for the shipper
const mockShipper = {
    name: 'Trần Văn An',
    phone: '0912 345 678',
    avatarUrl: 'https://i.pravatar.cc/150?u=driver',
    licensePlate: '59-T1 123.45',
    vehicleImageUrl: 'https://s3.cloud.cmctelecom.vn/tinhte2/2019/07/4710186_cover_honda-wave-alpha-110cc-phien-ban-2019.jpg',
    reputationScore: 98,
    rating: 4.9,
    successfulDeliveries: 1250,
    cancellationRate: 2.5,
};

// Stat card component
const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; }> = ({ icon, title, value }) => (
    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
        <div className="flex-shrink-0 text-orange-500">
            {icon}
        </div>
        <div className="ml-3">
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-lg font-bold text-gray-900">{value}</p>
        </div>
    </div>
);


const ShipperProfilePage: React.FC = () => {
    const [shipper, setShipper] = useState(mockShipper);
    const [isEditing, setIsEditing] = useState(false);
    
    // In a real app, you'd handle form state changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setShipper(prev => ({...prev, [name]: value}));
    }

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Hồ sơ của tôi</h1>
                <p className="mt-1 text-sm text-gray-500">Quản lý thông tin cá nhân và xem hiệu suất của bạn.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left side - Forms */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Personal Info */}
                    <div className="bg-white p-6 rounded-lg shadow-md border">
                        <div className="flex justify-between items-center border-b pb-4 mb-6">
                            <h2 className="text-xl font-semibold text-gray-800">Thông tin cá nhân</h2>
                            <button 
                                onClick={() => setIsEditing(!isEditing)} 
                                className="text-sm font-medium text-orange-600 hover:text-orange-500"
                            >
                                {isEditing ? 'Hủy' : 'Chỉnh sửa'}
                            </button>
                        </div>
                        <form className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3"><UserIcon className="h-5 w-5 text-gray-400" /></span>
                                    <input type="text" id="name" name="name" value={shipper.name} onChange={handleInputChange} readOnly={!isEditing} className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`} />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3"><PhoneIcon className="h-5 w-5 text-gray-400" /></span>
                                    <input type="tel" id="phone" name="phone" value={shipper.phone} onChange={handleInputChange} readOnly={!isEditing} className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`} />
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Vehicle Info */}
                     <div className="bg-white p-6 rounded-lg shadow-md border">
                        <h2 className="text-xl font-semibold text-gray-800 border-b pb-4 mb-6">Thông tin phương tiện</h2>
                        <form className="space-y-4">
                           <div>
                                <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700 mb-1">Biển số xe</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3"><IdentificationIcon className="h-5 w-5 text-gray-400" /></span>
                                    <input type="text" id="licensePlate" name="licensePlate" value={shipper.licensePlate} onChange={handleInputChange} readOnly={!isEditing} className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh xe</label>
                                <div className="mt-1 flex items-center space-x-4 p-2 border-2 border-dashed rounded-md">
                                    <img src={shipper.vehicleImageUrl} alt="Vehicle" className="h-20 w-32 object-cover rounded-md"/>
                                    {isEditing && (
                                        <button type="button" className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                            <UploadIcon className="h-4 w-4 mr-2" /> Tải ảnh lên
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>

                    {isEditing && (
                        <div className="text-right">
                             <button onClick={() => setIsEditing(false)} type="submit" className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                                Lưu thay đổi
                            </button>
                        </div>
                    )}
                </div>

                {/* Right side - Avatar and Stats */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Avatar */}
                    <div className="bg-white p-6 rounded-lg shadow-md border flex flex-col items-center">
                        <div className="relative mb-4">
                            <img className="w-28 h-28 rounded-full object-cover ring-4 ring-orange-100" src={shipper.avatarUrl} alt="Avatar" />
                            {isEditing && (
                                <button className="absolute bottom-0 right-0 bg-orange-500 p-2 rounded-full text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500" aria-label="Change profile picture">
                                    <PencilIcon className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{shipper.name}</h3>
                        <p className="text-sm text-gray-500">Tài xế công nghệ</p>
                    </div>

                    {/* Stats */}
                    <div className="bg-white p-6 rounded-lg shadow-md border">
                        <h3 className="text-xl font-semibold text-gray-800 border-b pb-4 mb-6">Thống kê hiệu suất</h3>
                        <div className="space-y-4">
                            <StatCard icon={<ShieldCheckIcon className="h-6 w-6"/>} title="Điểm uy tín" value={shipper.reputationScore} />
                            <StatCard icon={<StarIcon className="h-6 w-6"/>} title="Đánh giá trung bình" value={`${shipper.rating}/5.0`} />
                            <StatCard icon={<CheckCircleIcon className="h-6 w-6"/>} title="Đơn thành công" value={shipper.successfulDeliveries.toLocaleString()} />
                            <StatCard icon={<XCircleIcon className="h-6 w-6"/>} title="Tỉ lệ hủy" value={`${shipper.cancellationRate}%`} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShipperProfilePage;