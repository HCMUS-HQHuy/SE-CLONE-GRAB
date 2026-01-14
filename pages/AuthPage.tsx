
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MailIcon, LockIcon, UserIcon, GoogleIcon, FacebookIcon } from '../components/Icons';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import { apiService } from '../services/api';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // FIX: getToken requires a role argument. Passing 'user' as this is the main auth page for customers.
    if (apiService.getToken('user')) {
      navigate('/user/home', { replace: true });
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
      // Cập nhật: Truyền role 'user'
      await apiService.login({ email, password }, 'user');
      localStorage.setItem('user_logged_in', 'true');
      navigate('/user/home');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const LoginForm: React.FC = () => (
    <form className="space-y-6" onSubmit={handleLogin}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="email" className="text-sm font-medium text-gray-700 sr-only">Email</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <MailIcon className="h-5 w-5 text-gray-400" />
          </span>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
            placeholder="Địa chỉ email"
          />
        </div>
      </div>
      <div>
        <label htmlFor="password"  className="text-sm font-medium text-gray-700 sr-only">Mật khẩu</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <LockIcon className="h-5 w-5 text-gray-400" />
          </span>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
            placeholder="Mật khẩu"
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Ghi nhớ tôi</label>
        </div>
        <div className="text-sm">
          <button type="button" onClick={() => setIsForgotPasswordOpen(true)} className="font-medium text-orange-600 hover:text-orange-500">Quên mật khẩu?</button>
        </div>
      </div>
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed scale-100' : 'hover:scale-105'}`}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : 'Đăng nhập'}
        </button>
      </div>
    </form>
  );

  const SignupForm: React.FC = () => (
    <form className="space-y-4">
       <div>
        <label htmlFor="fullname"  className="text-sm font-medium text-gray-700 sr-only">Họ và tên</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <UserIcon className="h-5 w-5 text-gray-400" />
          </span>
          <input id="fullname" name="fullname" type="text" required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm" placeholder="Họ và tên" />
        </div>
      </div>
      <div>
        <label htmlFor="signup-email"  className="text-sm font-medium text-gray-700 sr-only">Email</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <MailIcon className="h-5 w-5 text-gray-400" />
          </span>
          <input id="signup-email" name="email" type="email" autoComplete="email" required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm" placeholder="Địa chỉ email" />
        </div>
      </div>
      <div>
        <label htmlFor="signup-password"  className="text-sm font-medium text-gray-700 sr-only">Mật khẩu</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <LockIcon className="h-5 w-5 text-gray-400" />
          </span>
          <input id="signup-password" name="password" type="password" autoComplete="new-password" required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm" placeholder="Mật khẩu" />
        </div>
      </div>
       <div>
        <label htmlFor="confirm-password"  className="text-sm font-medium text-gray-700 sr-only">Xác nhận mật khẩu</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <LockIcon className="h-5 w-5 text-gray-400" />
          </span>
          <input id="confirm-password" name="confirm-password" type="password" required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm" placeholder="Xác nhận mật khẩu" />
        </div>
      </div>
      <div>
        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-transform transform hover:scale-105 duration-300">
          Tạo tài khoản
        </button>
      </div>
    </form>
  );
  
  const SocialLogin: React.FC = () => (
    <div>
        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-50 text-gray-500">Hoặc tiếp tục với</span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <div>
              <a href="#" className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Đăng nhập với Google</span>
                  <GoogleIcon className="w-5 h-5" />
              </a>
            </div>

            <div>
              <a href="#" className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Đăng nhập với Facebook</span>
                  <FacebookIcon className="w-5 h-5" />
              </a>
            </div>
        </div>
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 bg-cover bg-center" style={{backgroundImage: "url('https://picsum.photos/1920/1080?food,delivery')"}}>
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative w-full max-w-md bg-slate-50 rounded-xl shadow-2xl p-8 space-y-8 transition-all duration-500">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Món Ngon Giao Tận Nơi</h1>
            <p className="text-gray-500 mt-2">{isLogin ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}</p>
          </div>
          <div className="flex rounded-md shadow-sm mb-6">
            <button onClick={() => setIsLogin(true)} className={`w-1/2 p-3 text-sm font-medium rounded-l-md transition-colors ${isLogin ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>Đăng nhập</button>
            <button onClick={() => setIsLogin(false)} className={`w-1/2 p-3 text-sm font-medium rounded-r-md transition-colors ${!isLogin ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>Đăng ký</button>
          </div>
          {isLogin ? <LoginForm /> : <SignupForm />}
          <SocialLogin />
        </div>
      </div>
      <ForgotPasswordModal 
        isOpen={isForgotPasswordOpen} 
        onClose={() => setIsForgotPasswordOpen(false)}
        onSuccess={() => { setIsForgotPasswordOpen(false); setIsLogin(true); }}
      />
    </>
  );
};

export default AuthPage;
