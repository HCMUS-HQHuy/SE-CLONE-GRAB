
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MailIcon, LockIcon, GoogleIcon, FacebookIcon } from '../components/Icons';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import { apiService } from '../services/api';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // State riêng biệt cho từng form để không bị "copy" dữ liệu khi chuyển tab
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (apiService.getToken('user') && localStorage.getItem('user_status') === 'active') {
      navigate('/user/home', { replace: true });
    }
  }, [navigate]);

  // Hàm xóa dữ liệu khi chuyển tab
  const toggleTab = (loginTab: boolean) => {
    setIsLogin(loginTab);
    setError(null);
    setSuccessMsg(null);
    // Reset toàn bộ input
    setLoginEmail('');
    setLoginPassword('');
    setSignupEmail('');
    setSignupPassword('');
    setConfirmPassword('');
  };

  const validatePassword = (pw: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(pw);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await apiService.login({ email: loginEmail, password: loginPassword }, 'user');
      const userProfile = await apiService.getMe('user');
      
      if (userProfile.status === 'pending') {
        navigate('/user/profile');
      } else if (userProfile.status === 'inactive') {
        setError('Tài khoản đã bị vô hiệu hóa.');
        apiService.logout('user');
      } else {
        navigate('/user/home');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!validatePassword(signupPassword)) {
      setError('Mật khẩu cần ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt.');
      return;
    }

    if (signupPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsLoading(true);
    try {
      await apiService.register({ email: signupEmail, password: signupPassword, role: 'user' });
      setSuccessMsg('Đăng ký thành công! Hãy đăng nhập ngay.');
      toggleTab(true); // Chuyển về tab login và đã xóa sạch dữ liệu cũ
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 bg-cover bg-center" style={{backgroundImage: "url('https://picsum.photos/1920/1080?food,delivery')"}}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
        <div className="relative w-full max-w-md bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-2xl p-10 space-y-8 border border-white/20">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">Food<span className="text-orange-500">Delivery</span></h1>
            <p className="text-gray-400 text-sm mt-2 font-medium">{isLogin ? 'Chào mừng bạn quay trở lại!' : 'Bắt đầu hành trình ẩm thực của bạn'}</p>
          </div>

          <div className="flex bg-gray-100/50 p-1.5 rounded-2xl">
            <button onClick={() => toggleTab(true)} className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all ${isLogin ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>ĐĂNG NHẬP</button>
            <button onClick={() => toggleTab(false)} className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all ${!isLogin ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>ĐĂNG KÝ</button>
          </div>

          {error && <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-medium border border-red-100 animate-in fade-in zoom-in-95 duration-300">{error}</div>}
          {successMsg && <div className="bg-green-50 text-green-600 p-4 rounded-2xl text-xs font-medium border border-green-100 animate-in fade-in zoom-in-95 duration-300">{successMsg}</div>}

          {isLogin ? (
            <form className="space-y-5" onSubmit={handleLogin}>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400"><MailIcon className="h-4 w-4" /></span>
                <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} autoComplete="username" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-100 focus:bg-white outline-none transition-all text-sm font-medium" placeholder="Email" />
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400"><LockIcon className="h-4 w-4" /></span>
                <input type="password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} autoComplete="current-password" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-100 focus:bg-white outline-none transition-all text-sm font-medium" placeholder="Mật khẩu" />
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => setIsForgotPasswordOpen(true)} className="text-xs font-semibold text-orange-600 hover:text-orange-700">Quên mật khẩu?</button>
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-4 rounded-2xl text-white bg-orange-500 hover:bg-orange-600 font-semibold text-sm shadow-lg shadow-orange-100 transition-all active:scale-[0.98] disabled:opacity-50">
                {isLoading ? 'Đang xử lý...' : 'Đăng nhập ngay'}
              </button>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleSignup}>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400"><MailIcon className="h-4 w-4" /></span>
                <input type="email" required value={signupEmail} onChange={e => setSignupEmail(e.target.value)} autoComplete="off" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-100 focus:bg-white outline-none transition-all text-sm font-medium" placeholder="Email đăng ký" />
              </div>
              <div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400"><LockIcon className="h-4 w-4" /></span>
                  <input type="password" required value={signupPassword} onChange={e => setSignupPassword(e.target.value)} autoComplete="new-password" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-100 focus:bg-white outline-none transition-all text-sm font-medium" placeholder="Mật khẩu mới" />
                </div>
                <p className="text-[10px] text-gray-400 mt-2 ml-1 leading-relaxed">Ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số & ký tự đặc biệt.</p>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400"><LockIcon className="h-4 w-4" /></span>
                <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-100 focus:bg-white outline-none transition-all text-sm font-medium" placeholder="Xác nhận mật khẩu" />
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-4 rounded-2xl text-white bg-orange-500 hover:bg-orange-600 font-semibold text-sm shadow-lg shadow-orange-100 transition-all active:scale-[0.98] disabled:opacity-50">
                {isLoading ? 'Đang tạo tài khoản...' : 'Đăng ký thành viên'}
              </button>
            </form>
          )}

          <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
              <div className="relative flex justify-center text-[10px]"><span className="px-3 bg-white text-gray-400 font-bold uppercase tracking-widest">Hoặc tiếp tục với</span></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
              <button className="flex justify-center items-center py-3 border border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-white transition-all"><GoogleIcon className="w-5 h-5" /></button>
              <button className="flex justify-center items-center py-3 border border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-white transition-all"><FacebookIcon className="w-5 h-5" /></button>
          </div>
        </div>
      </div>
      <ForgotPasswordModal isOpen={isForgotPasswordOpen} onClose={() => setIsForgotPasswordOpen(false)} onSuccess={() => { setIsForgotPasswordOpen(false); setIsLogin(true); }} />
    </>
  );
};

export default AuthPage;
