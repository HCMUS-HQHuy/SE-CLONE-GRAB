
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserIcon, MailIcon, PhoneIcon, HomeIcon, PencilIcon, TrashIcon, PlusIcon, ChatAltIcon } from '../components/Icons';
import { apiService } from '../services/api';
import { profileApiService, UserProfileData } from '../services/profileApi';

const UserProfile: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [profile, setProfile] = useState<UserProfileData | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Lấy thông tin User Me để có ID
      const userMe = await apiService.getMe('user');
      
      try {
        // 2. Thử lấy profile từ service Profile (port 8002)
        const profileData = await profileApiService.getProfile(userMe.id);
        setProfile(profileData);
      } catch (err: any) {
        // 3. Nếu không tìm thấy (404), tự động khởi tạo profile mới
        if (err.message === 'PROFILE_NOT_FOUND') {
          const newProfile = await profileApiService.createProfile({
            user_id: userMe.id.toString(),
            name: userMe.email.split('@')[0], // Mặc định lấy prefix email làm tên
            email: userMe.email,
            phone: '',
            avatar: '',
            address: ''
          });
          setProfile(newProfile);
        } else {
          throw err;
        }
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tải thông tin hồ sơ.');
    } finally {
      setIsLoading(true);
      // Giả lập chút delay cho mượt
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const updated = await profileApiService.updateProfile(profile.user_id, {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        avatar: profile.avatar,
        role: 'user'
      });
      setProfile(updated);
      setSuccessMsg('Cập nhật hồ sơ thành công!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-gray-500">Đang tải hồ sơ của bạn...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tài khoản của tôi</h1>
        <p className="mt-1 text-sm text-gray-500">Quản lý thông tin hồ sơ và địa chỉ của bạn.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
          {successMsg}
        </div>
      )}

      {/* Profile Info Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 border-b pb-4 mb-6">Thông tin cá nhân</h2>
        <div className="flex flex-col items-center">
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center ring-2 ring-gray-200 overflow-hidden">
                {profile?.avatar ? (
                    <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    <UserIcon className="h-16 w-16 text-gray-400" />
                )}
            </div>
            <button className="absolute bottom-0 right-0 bg-orange-500 p-1.5 rounded-full text-white hover:bg-orange-600 focus:outline-none transition-transform active:scale-90" aria-label="Edit profile picture">
              <PencilIcon className="h-4 w-4" />
            </button>
          </div>
          
          <form className="w-full space-y-4" onSubmit={handleUpdateProfile}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3"><UserIcon className="h-5 w-5 text-gray-400" /></span>
                  <input 
                    type="text" 
                    id="fullname" 
                    value={profile?.name || ''} 
                    onChange={(e) => setProfile(prev => prev ? {...prev, name: e.target.value} : null)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" 
                    placeholder="Nhập họ tên của bạn"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3"><PhoneIcon className="h-5 w-5 text-gray-400" /></span>
                  <input 
                    type="tel" 
                    id="phone" 
                    value={profile?.phone || ''} 
                    onChange={(e) => setProfile(prev => prev ? {...prev, phone: e.target.value} : null)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" 
                    placeholder="09xx xxx xxx"
                  />
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3"><MailIcon className="h-5 w-5 text-gray-400" /></span>
                <input 
                    type="email" 
                    id="email" 
                    value={profile?.email || ''} 
                    readOnly 
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed" 
                />
              </div>
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ mặc định</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3"><HomeIcon className="h-5 w-5 text-gray-400" /></span>
                <input 
                    type="text" 
                    id="address" 
                    value={profile?.address || ''} 
                    onChange={(e) => setProfile(prev => prev ? {...prev, address: e.target.value} : null)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" 
                    placeholder="Nhập địa chỉ nhận hàng của bạn"
                />
              </div>
            </div>

            <div className="text-right pt-4">
              <button 
                type="submit" 
                disabled={isSaving}
                className="inline-flex justify-center items-center py-2 px-8 border border-transparent shadow-sm text-sm font-bold rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Đang lưu...
                    </>
                ) : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Address Management Section - Mock for now but using profile address as primary */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Địa chỉ của tôi</h2>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none transition-colors">
            <PlusIcon className="h-5 w-5 mr-2" />
            Thêm địa chỉ
          </button>
        </div>
        <div className="space-y-4">
          {/* Address Card from Profile */}
          {profile?.address && (
              <div className="p-4 border border-orange-200 bg-orange-50 rounded-md flex justify-between items-start">
                <div className="flex items-start">
                  <HomeIcon className="h-6 w-6 text-orange-500 mt-1 mr-4" />
                  <div>
                    <div className="flex items-center">
                      <p className="font-semibold text-gray-900">Địa chỉ chính</p>
                      <span className="ml-3 bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full border border-orange-200">Mặc định</span>
                    </div>
                    <p className="text-gray-600">{profile.name}</p>
                    <p className="text-gray-600">{profile.phone || 'Chưa cập nhật SĐT'}</p>
                    <p className="text-gray-500 text-sm">{profile.address}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="text-gray-400 hover:text-blue-600 transition-colors"><PencilIcon className="h-5 w-5" /></button>
                </div>
              </div>
          )}

          {!profile?.address && (
              <div className="text-center py-6 bg-gray-50 rounded-md border border-dashed border-gray-300">
                  <p className="text-gray-500 italic text-sm">Bạn chưa cập nhật địa chỉ nào.</p>
              </div>
          )}
        </div>
      </div>

      {/* Support Section */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 border-b pb-4 mb-6">Trợ giúp</h2>
        <Link to="/user/support" className="flex items-center p-4 border rounded-md hover:bg-orange-50 hover:border-orange-200 transition-all group">
            <ChatAltIcon className="h-8 w-8 text-orange-500 mr-4 group-hover:scale-110 transition-transform"/>
            <div>
                <p className="font-semibold text-gray-900">Hỗ trợ & Phản hồi</p>
                <p className="text-sm text-gray-600">Gửi yêu cầu, khiếu nại hoặc góp ý cho chúng tôi.</p>
            </div>
        </Link>
      </div>
    </div>
  );
};

export default UserProfile;
