
import React, { useState, useEffect } from 'react';
import { 
    UserIcon, PhoneIcon, PencilIcon, UploadIcon, StarIcon, 
    ShieldCheckIcon, IdentificationIcon, CheckCircleIcon, XCircleIcon, 
    LightningBoltIcon, CalendarIcon, ThumbUpIcon, DocumentTextIcon 
} from '../components/Icons';
import { apiService } from '../services/api';
import { shipperApiService, Driver } from '../services/shipperApi';

const SHIPPER_BASE_URL = 'http://localhost:8001';

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

const PerformanceAnalysisCard: React.FC<{ comments: typeof mockRecentComments }> = ({ comments }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border h-full">
        <div>
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

        <div className="border-t pt-6 mt-6">
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
        
        <div className="border-t pt-6 mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Khách hàng nói gì</h3>
            <div className="space-y-4">
                {comments.map((review, index) => (
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
    </div>
);

const ShipperProfilePage: React.FC = () => {
    const [shipper, setShipper] = useState<Driver | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [recentComments, setRecentComments] = useState(mockRecentComments);
    
    useEffect(() => {
        fetchProfile();
        
        const newReviewJSON = localStorage.getItem('newDriverReview');
        if (newReviewJSON) {
            const newReviewData = JSON.parse(newReviewJSON);
            let combinedComment = '';
            if (newReviewData.tags && newReviewData.tags.length > 0) {
                combinedComment = newReviewData.tags.join(', ') + '. ';
            }
            combinedComment += newReviewData.comment;

            const newComment = {
                author: newReviewData.author || 'Khách hàng',
                rating: newReviewData.rating,
                comment: combinedComment.trim()
            };
            setRecentComments(prev => [newComment, ...prev]);
            localStorage.removeItem('newDriverReview');
        }
    }, []);

    const fetchProfile = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const userMe = await apiService.getMe('shipper');
            const driverData = await shipperApiService.getDriverById(userMe.id.toString());
            setShipper(driverData);
        } catch (err: any) {
            setError(err.message || 'Không thể tải thông tin hồ sơ tài xế.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!shipper) return;
        const { name, value } = e.target;
        setShipper({ ...shipper, [name]: value });
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                <p className="text-gray-500 font-medium">Đang tải hồ sơ tài xế...</p>
            </div>
        );
    }

    if (error || !shipper) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <div className="bg-red-50 p-8 rounded-xl border border-red-200 text-center max-w-md">
                    <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-red-800">Lỗi tải dữ liệu</h2>
                    <p className="text-red-600 mt-2">{error || 'Không tìm thấy hồ sơ của bạn trong hệ thống.'}</p>
                    <button onClick={fetchProfile} className="mt-6 bg-red-600 text-white px-6 py-2 rounded-lg font-bold">Thử lại</button>
                </div>
            </div>
        );
    }

    const DocumentPreview: React.FC<{ label: string, path: string }> = ({ label, path }) => (
        <div className="space-y-2">
            <div className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                <DocumentTextIcon className="h-4 w-4 mr-1.5 text-orange-500" />
                {label}
            </div>
            <div className="border rounded-xl overflow-hidden bg-gray-50 aspect-video flex items-center justify-center group relative shadow-inner border-gray-200">
                {path ? (
                    <>
                        <img 
                            src={`${SHIPPER_BASE_URL}${path}`} 
                            alt={label} 
                            className="w-full h-full object-cover cursor-zoom-in group-hover:scale-105 transition-transform" 
                            onClick={() => window.open(`${SHIPPER_BASE_URL}${path}`, '_blank')}
                        />
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"></div>
                    </>
                ) : (
                    <span className="text-gray-400 italic text-xs">Chưa có ảnh</span>
                )}
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Hồ sơ tài xế</h1>
                <p className="mt-1 text-sm text-gray-500">Thông tin cá nhân và dữ liệu hiệu suất làm việc.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border mb-8">
                <div className="flex flex-col sm:flex-row items-center sm:space-x-8">
                    <div className="flex-shrink-0 flex flex-col items-center text-center mb-6 sm:mb-0">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center ring-4 ring-orange-100 overflow-hidden">
                                {shipper.profileImageUrl ? (
                                    <img src={`${SHIPPER_BASE_URL}${shipper.profileImageUrl}`} className="w-full h-full object-cover" alt="Avatar"/>
                                ) : (
                                    <UserIcon className="h-16 w-16 text-gray-400" />
                                )}
                            </div>
                            {isEditing && (
                                <button className="absolute bottom-0 right-0 bg-orange-500 p-2 rounded-full text-white hover:bg-orange-600 focus:outline-none focus:ring-2" aria-label="Change profile picture">
                                    <PencilIcon className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mt-3">{shipper.fullName}</h3>
                        <div className="flex items-center mt-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                shipper.verificationStatus === 'Approved' ? 'bg-green-100 text-green-700 border-green-200' :
                                shipper.verificationStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                'bg-red-100 text-red-700 border-red-200'
                            }`}>
                                {shipper.verificationStatus}
                            </span>
                        </div>
                    </div>

                    <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-4 w-full border-t sm:border-t-0 sm:border-l pt-6 sm:pt-0 sm:pl-8 border-gray-200">
                        <HeaderStat icon={<ShieldCheckIcon className="h-6 w-6"/>} title="Điểm uy tín" value={98} />
                        <HeaderStat icon={<StarIcon className="h-6 w-6"/>} title="Đánh giá" value={`4.9/5.0`} />
                        <HeaderStat icon={<CheckCircleIcon className="h-6 w-6"/>} title="Đơn thành công" value={"1,250"} />
                        <HeaderStat icon={<XCircleIcon className="h-6 w-6"/>} title="Tỉ lệ hủy" value={`2.5%`} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3"><UserIcon className="h-5 w-5 text-gray-400" /></span>
                                    <input type="text" name="fullName" value={shipper.fullName} onChange={handleInputChange} readOnly={!isEditing} className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3"><PhoneIcon className="h-5 w-5 text-gray-400" /></span>
                                        <input type="tel" name="phoneNumber" value={shipper.phoneNumber} onChange={handleInputChange} readOnly={!isEditing} className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số GPLX</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3"><IdentificationIcon className="h-5 w-5 text-gray-400" /></span>
                                        <input type="text" name="licenseNumber" value={shipper.licenseNumber || ''} onChange={handleInputChange} readOnly={!isEditing} className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`} />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md border">
                        <h2 className="text-xl font-semibold text-gray-800 border-b pb-4 mb-6">Hồ sơ định danh</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <DocumentPreview label="Ảnh CCCD / CMND" path={shipper.citizenIdImageUrl} />
                            <DocumentPreview label="Ảnh Bằng lái xe" path={shipper.driverLicenseImageUrl} />
                            <div className="sm:col-span-2">
                                <DocumentPreview label="Ảnh Đăng ký xe (Cà vẹt)" path={shipper.driverRegistrationImageUrl} />
                            </div>
                        </div>
                    </div>

                    {isEditing && (
                        <div className="text-right">
                             <button onClick={() => setIsEditing(false)} type="button" className="inline-flex justify-center py-2 px-8 border border-transparent shadow-sm text-sm font-bold rounded-md text-white bg-orange-500 hover:bg-orange-600 transition-all">
                                Lưu thông tin
                            </button>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1">
                    <PerformanceAnalysisCard comments={recentComments} />
                </div>
            </div>
        </div>
    );
};

export default ShipperProfilePage;
