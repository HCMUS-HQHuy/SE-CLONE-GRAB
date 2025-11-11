import React, { useState } from 'react';
import { UserIcon, PhoneIcon, PencilIcon, UploadIcon, StarIcon, ShieldCheckIcon, IdentificationIcon, CheckCircleIcon, XCircleIcon, LightningBoltIcon, CalendarIcon, ThumbUpIcon } from '../components/Icons';

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

const ratingData = {
    average: 4.85,
    totalReviews: 102,
    breakdown: [
        { stars: 5, count: 76 },
        { stars: 4, count: 16 },
        { stars: 3, count: 2 },
        { stars: 2, count: 5 },
        { stars: 1, count: 3 },
    ],
};

const mockBadges = [
    { icon: <LightningBoltIcon className="h-6 w-6 text-yellow-500"/>, text: 'Giao hàng thần tốc' },
    { icon: <ThumbUpIcon className="h-6 w-6 text-blue-500"/>, text: 'Tài xế thân thiện' },
    { icon: <CalendarIcon className="h-6 w-6 text-green-500"/>, text: 'Đối tác 1 năm+' },
    { icon: <CheckCircleIcon className="h-6 w-6 text-purple-500"/>, text: 'Không hủy đơn' },
];

const mockRecentComments = [
    { author: 'Nguyễn V.', rating: 5, comment: 'Tài xế rất nhiệt tình và giao hàng nhanh chóng. 5 sao!' },
    { author: 'Trần T.', rating: 5, comment: 'Anh tài xế cẩn thận, đồ ăn của mình còn nóng hổi. Cảm ơn nhiều.' },
    { author: 'Lê P.', rating: 4, comment: 'Giao hàng đúng giờ, rất chuyên nghiệp.' },
];

const HeaderStat: React.FC<{ icon: React.ReactNode; title: string; value: string | number; }> = ({ icon, title, value }) => (
    <div className="text-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-orange-100 text-orange-600 mb-2">
            {icon}
        </div>
        <p className="text-xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 truncate">{title}</p>
    </div>
);


const RatingBreakdown: React.FC = () => (
    <div className="bg-white p-6 rounded-lg shadow-md border h-full">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Phân tích đánh giá</h3>
        <div className="flex justify-between items-baseline text-xs text-gray-500 mb-4">
            <p>Từ 100 chuyến xe gần nhất</p>
            <p>Cập nhật 6 giờ trước</p>
        </div>
        <div className="flex items-center">
            <div className="text-center pr-6 border-r mr-6">
                <p className="text-4xl font-bold text-gray-800">{ratingData.average.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Tỷ lệ</p>
            </div>
            <div className="flex-grow space-y-1">
                {ratingData.breakdown.map(({ stars, count }) => (
                    <div key={stars} className="flex items-center">
                        <span className="text-sm font-medium text-gray-600 w-3 text-center mr-2">{stars}</span>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                                className="bg-orange-400 h-1.5 rounded-full" 
                                style={{ width: `${(count / ratingData.totalReviews) * 100}%` }}
                            ></div>
                        </div>
                        <span className="text-sm text-gray-600 ml-2 w-6 text-right">{count}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const ShipperBadges: React.FC = () => (
    <div className="bg-white p-6 rounded-lg shadow-md border">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Huy hiệu & Thành tích</h3>
        <div className="grid grid-cols-2 gap-4">
            {mockBadges.map((badge, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg flex items-center space-x-3">
                    <div className="flex-shrink-0">{badge.icon}</div>
                    <p className="text-sm font-medium text-gray-700">{badge.text}</p>
                </div>
            ))}
        </div>
    </div>
);

const RecentComments: React.FC = () => (
    <div className="bg-white p-6 rounded-lg shadow-md border">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Khách hàng nói gì</h3>
        <div className="space-y-4">
            {mockRecentComments.map((review, index) => (
                <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-semibold text-gray-800">{review.author}</p>
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <StarIcon key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                            ))}
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 italic">"{review.comment}"</p>
                </div>
            ))}
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
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Hồ sơ tài xế</h1>
                <p className="mt-1 text-sm text-gray-500">Quản lý thông tin cá nhân và xem hiệu suất của bạn.</p>
            </div>
            
            {/* Summary Header Card */}
            <div className="bg-white p-6 rounded-lg shadow-md border mb-8">
                <div className="flex flex-col sm:flex-row items-center sm:space-x-8">
                    <div className="flex-shrink-0 flex flex-col items-center text-center mb-6 sm:mb-0">
                        <div className="relative">
                            <img className="w-24 h-24 rounded-full object-cover ring-4 ring-orange-100" src={shipper.avatarUrl} alt="Avatar" />
                            {isEditing && (
                                <button className="absolute bottom-0 right-0 bg-orange-500 p-2 rounded-full text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500" aria-label="Change profile picture">
                                    <PencilIcon className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mt-3">{shipper.name}</h3>
                        <p className="text-sm text-gray-500">Tài xế công nghệ</p>
                    </div>

                    <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-4 w-full border-t sm:border-t-0 sm:border-l pt-6 sm:pt-0 sm:pl-8 border-gray-200">
                        <HeaderStat icon={<ShieldCheckIcon className="h-6 w-6"/>} title="Điểm uy tín" value={shipper.reputationScore} />
                        <HeaderStat icon={<StarIcon className="h-6 w-6"/>} title="Đánh giá" value={`${shipper.rating}/5.0`} />
                        <HeaderStat icon={<CheckCircleIcon className="h-6 w-6"/>} title="Đơn thành công" value={shipper.successfulDeliveries.toLocaleString()} />
                        <HeaderStat icon={<XCircleIcon className="h-6 w-6"/>} title="Tỉ lệ hủy" value={`${shipper.cancellationRate}%`} />
                    </div>
                </div>
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
                                className="text-sm font-medium text-orange-600 hover:text-orange-500 flex items-center"
                            >
                                <PencilIcon className="h-4 w-4 mr-1.5" />
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

                {/* Right side - Stats & Info */}
                <div className="lg:col-span-1 space-y-8">
                    <RatingBreakdown />
                    <ShipperBadges />
                    <RecentComments />
                </div>
            </div>
        </div>
    );
};

export default ShipperProfilePage;