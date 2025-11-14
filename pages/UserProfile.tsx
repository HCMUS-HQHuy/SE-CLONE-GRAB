import React from 'react';
import { Link } from 'react-router-dom';
import { UserIcon, MailIcon, PhoneIcon, HomeIcon, PencilIcon, TrashIcon, PlusIcon, ChatAltIcon } from '../components/Icons';

const UserProfile: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tài khoản của tôi</h1>
        <p className="mt-1 text-sm text-gray-500">Quản lý thông tin hồ sơ và địa chỉ của bạn.</p>
      </div>

      {/* Profile Info Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-800 border-b pb-4 mb-6">Thông tin cá nhân</h2>
        <div className="flex flex-col items-center">
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center ring-2 ring-gray-200">
                <UserIcon className="h-16 w-16 text-gray-400" />
            </div>
            <button className="absolute bottom-0 right-0 bg-orange-500 p-1.5 rounded-full text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500" aria-label="Edit profile picture">
              <PencilIcon className="h-4 w-4" />
            </button>
          </div>
          <form className="w-full space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3"><UserIcon className="h-5 w-5 text-gray-400" /></span>
                  <input type="text" id="fullname" defaultValue="Nguyễn Văn A" className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500" />
                </div>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3"><PhoneIcon className="h-5 w-5 text-gray-400" /></span>
                  <input type="tel" id="phone" defaultValue="0987654321" className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500" />
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3"><MailIcon className="h-5 w-5 text-gray-400" /></span>
                <input type="email" id="email" defaultValue="nguyenvana@email.com" readOnly className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed" />
              </div>
            </div>
            <div className="text-right pt-2">
              <button type="submit" className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Address Management Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Địa chỉ của tôi</h2>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
            <PlusIcon className="h-5 w-5 mr-2" />
            Thêm địa chỉ
          </button>
        </div>
        <div className="space-y-4">
          {/* Address Card */}
          <div className="p-4 border rounded-md flex justify-between items-start">
            <div className="flex items-start">
              <HomeIcon className="h-6 w-6 text-orange-500 mt-1 mr-4" />
              <div>
                <div className="flex items-center">
                  <p className="font-semibold text-gray-900">Nhà riêng</p>
                  <span className="ml-3 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Mặc định</span>
                </div>
                <p className="text-gray-600">Nguyễn Văn A</p>
                <p className="text-gray-600">0987654321</p>
                <p className="text-gray-500">123 Đường ABC, Phường 1, Quận 2, Thành phố Hồ Chí Minh</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="text-gray-400 hover:text-blue-600"><PencilIcon className="h-5 w-5" /></button>
              <button className="text-gray-400 hover:text-red-600"><TrashIcon className="h-5 w-5" /></button>
            </div>
          </div>
           {/* Another Address Card */}
           <div className="p-4 border rounded-md flex justify-between items-start">
            <div className="flex items-start">
              <HomeIcon className="h-6 w-6 text-gray-500 mt-1 mr-4" />
              <div>
                <p className="font-semibold text-gray-900">Công ty</p>
                <p className="text-gray-600">Nguyễn Văn A</p>
                <p className="text-gray-600">0987654321</p>
                <p className="text-gray-500">456 Đường XYZ, Phường 3, Quận 4, Thành phố Hồ Chí Minh</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="text-gray-400 hover:text-blue-600"><PencilIcon className="h-5 w-5" /></button>
              <button className="text-gray-400 hover:text-red-600"><TrashIcon className="h-5 w-5" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 border-b pb-4 mb-6">Trợ giúp</h2>
        <Link to="/user/support" className="flex items-center p-4 border rounded-md hover:bg-gray-50 transition-colors">
            <ChatAltIcon className="h-8 w-8 text-orange-500 mr-4"/>
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