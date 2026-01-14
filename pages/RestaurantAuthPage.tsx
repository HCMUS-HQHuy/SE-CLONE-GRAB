
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MailIcon, LockIcon, UserIcon } from '../components/Icons';
import { apiService } from '../services/api';

const RestaurantAuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // FIX: getToken requires a role argument. Passing 'seller' for the Restaurant portal.
    if (apiService.getToken('seller') && localStorage.getItem('restaurant_profile_status') === 'approved') {
      navigate('/restaurant/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      // Cập nhật: Truyền role 'seller'
      await apiService.login({ email, password }, 'seller');
      // Giả định login thành công cho account đã duyệt
      localStorage.setItem('restaurant_profile_status', 'approved');
      navigate('/restaurant/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('restaurant_profile_status', 'unsubmitted');
    navigate('/restaurant/application');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 bg-cover bg-center" style={{backgroundImage: "url('https://picsum.photos/1920/1080?restaurant,interior')"}}>
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Cổng Đối tác Nhà hàng</h1>
              <p className="text-gray-500 mt-2">{isLogin ? 'Đăng nhập để quản lý' : 'Trở thành đối tác của chúng tôi'}</p>
            </div>
            <div className="flex rounded-md shadow-sm mb-6">
                <button onClick={() => setIsLogin(true)} className={`w-1/2 p-3 text-sm font-medium rounded-l-md transition-colors ${isLogin ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'}`}>Đăng nhập</button>
                <button onClick={() => setIsLogin(false)} className={`w-1/2 p-3 text-sm font-medium rounded-r-md transition-colors ${!isLogin ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'}`}>Đăng ký</button>
            </div>
            
            {isLogin ? (
                <form className="space-y-6" onSubmit={handleLogin}>
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">{error}</div>}
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3"><MailIcon className="h-5 w-5 text-gray-400" /></span>
                      <input name="email" type="email" required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500" placeholder="Email đăng nhập"/>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3"><LockIcon className="h-5 w-5 text-gray-400" /></span>
                      <input name="password" type="password" required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500" placeholder="Mật khẩu" />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full py-3 px-4 rounded-md text-white bg-orange-500 hover:bg-orange-600 font-medium disabled:opacity-50">{isLoading ? 'Đang xử lý...' : 'Đăng nhập'}</button>
                </form>
            ) : (
                <form className="space-y-4" onSubmit={handleRegister}>
                    <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><UserIcon className="h-5 w-5 text-gray-400" /></span><input type="text" required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md" placeholder="Họ và tên" /></div>
                    <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><MailIcon className="h-5 w-5 text-gray-400" /></span><input type="email" required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md" placeholder="Email" /></div>
                    <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><LockIcon className="h-5 w-5 text-gray-400" /></span><input type="password" required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md" placeholder="Mật khẩu" /></div>
                    <button type="submit" className="w-full py-3 px-4 rounded-md text-white bg-orange-500 hover:bg-orange-600 font-medium">Đăng ký</button>
                </form>
            )}
        </div>
    </div>
  );
};

export default RestaurantAuthPage;
