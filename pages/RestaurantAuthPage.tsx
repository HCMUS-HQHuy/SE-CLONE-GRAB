import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MailIcon, LockIcon, UserIcon, OfficeBuildingIcon, HomeIcon } from '../components/Icons';

const RestaurantAuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would call an API to submit registration data.
    // For this prototype, we'll simulate the registration and pending state.
    localStorage.setItem('restaurant_authed', 'pending');
    navigate('/restaurant/pending');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate a successful login for an already approved user.
    localStorage.setItem('restaurant_authed', 'approved');
    navigate('/restaurant/dashboard');
  };

  const AuthFormHeader = () => (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-gray-800">
        Cổng Đối tác Nhà hàng
      </h1>
      <p className="text-gray-500 mt-2">
        {isLogin ? 'Đăng nhập để quản lý' : 'Trở thành đối tác của chúng tôi'}
      </p>
    </div>
  );

  const AuthFormToggle = () => (
     <div className="flex rounded-md shadow-sm mb-6">
        <button onClick={() => setIsLogin(true)} className={`w-1/2 p-3 text-sm font-medium rounded-l-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 ${isLogin ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
          Đăng nhập
        </button>
        <button onClick={() => setIsLogin(false)} className={`w-1/2 p-3 text-sm font-medium rounded-r-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 ${!isLogin ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
          Đăng ký
        </button>
      </div>
  );

  const LoginForm: React.FC = () => (
    <form className="space-y-6" onSubmit={handleLogin}>
      <div>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3"><MailIcon className="h-5 w-5 text-gray-400" /></span>
          <input type="email" required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500" placeholder="Email đăng nhập"/>
        </div>
      </div>
      <div>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3"><LockIcon className="h-5 w-5 text-gray-400" /></span>
          <input type="password" required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500" placeholder="Mật khẩu" />
        </div>
      </div>
      <div>
        <button type="submit" className="w-full py-3 px-4 rounded-md text-white bg-orange-500 hover:bg-orange-600 font-medium">Đăng nhập</button>
      </div>
    </form>
  );

  const SignupForm: React.FC = () => (
    <form className="space-y-4" onSubmit={handleRegister}>
       <div>
        <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><UserIcon className="h-5 w-5 text-gray-400" /></span><input type="text" required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md" placeholder="Tên chủ sở hữu" /></div>
      </div>
       <div>
        <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><OfficeBuildingIcon className="h-5 w-5 text-gray-400" /></span><input type="text" required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md" placeholder="Tên nhà hàng" /></div>
      </div>
      <div>
        <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><HomeIcon className="h-5 w-5 text-gray-400" /></span><input type="text" required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md" placeholder="Địa chỉ kinh doanh" /></div>
      </div>
      <div>
        <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><MailIcon className="h-5 w-5 text-gray-400" /></span><input type="email" required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md" placeholder="Email" /></div>
      </div>
      <div>
        <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><LockIcon className="h-5 w-5 text-gray-400" /></span><input type="password" required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md" placeholder="Mật khẩu" /></div>
      </div>
      <div>
        <button type="submit" className="w-full py-3 px-4 rounded-md text-white bg-orange-500 hover:bg-orange-600 font-medium">Đăng ký ngay</button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-8">
        <AuthFormHeader />
        <AuthFormToggle />
        {isLogin ? <LoginForm /> : <SignupForm />}
      </div>
    </div>
  );
};

export default RestaurantAuthPage;
