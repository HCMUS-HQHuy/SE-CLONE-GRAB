
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockIcon, MailIcon } from '../components/Icons';
import { apiService } from '../services/api';

const ShipperAuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (apiService.getToken('shipper') && localStorage.getItem('shipper_status') === 'active') {
      navigate('/shipper/profile', { replace: true });
    }
  }, [navigate]);

  const toggleTab = (loginTab: boolean) => {
    setIsLogin(loginTab);
    setError(null);
    setSuccessMsg(null);
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
      await apiService.login({ email: loginEmail, password: loginPassword }, 'shipper');
      const profile = await apiService.getMe('shipper');
      
      if (profile.status === 'pending') {
        localStorage.setItem('shipper_profile_status', 'unsubmitted');
        navigate('/shipper/application');
      } else {
        localStorage.setItem('shipper_profile_status', 'approved');
        navigate('/shipper/profile');
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
      setError('Mật khẩu yếu: Yêu cầu 8+ ký tự, 1 hoa, 1 thường, 1 số và ký tự đặc biệt.');
      return;
    }

    if (signupPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsLoading(true);
    try {
      await apiService.register({ email: signupEmail, password: signupPassword, role: 'shipper' });
      setSuccessMsg('Đăng ký thành công! Hãy đăng nhập để hoàn tất hồ sơ.');
      toggleTab(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 bg-cover bg-center" style={{backgroundImage: "url('https://picsum.photos/1920/1080?motorcycle,delivery')"}}>
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
        <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 space-y-8">
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">Đối tác <span className="text-orange-500">Tài xế</span></h1>
              <p className="text-gray-400 text-sm mt-2 font-medium">{isLogin ? 'Đăng nhập để bắt đầu nhận đơn' : 'Gia nhập đội ngũ tài xế chuyên nghiệp'}</p>
            </div>
            
            <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                <button onClick={() => toggleTab(true)} className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all ${isLogin ? 'bg-white text-orange-600 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>ĐĂNG NHẬP</button>
                <button onClick={() => toggleTab(false)} className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all ${!isLogin ? 'bg-white text-orange-600 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>ĐĂNG KÝ</button>
            </div>

            {error && <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-medium border border-red-100">{error}</div>}
            {successMsg && <div className="bg-green-50 text-green-600 p-4 rounded-2xl text-xs font-medium border border-green-100">{successMsg}</div>}

            {isLogin ? (
                <form className="space-y-5" onSubmit={handleLogin}>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400"><MailIcon className="h-4 w-4" /></span>
                      <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} autoComplete="off" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-100 focus:bg-white outline-none transition-all text-sm font-medium" placeholder="Email tài xế"/>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400"><LockIcon className="h-4 w-4" /></span>
                      <input type="password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} autoComplete="off" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-100 focus:bg-white outline-none transition-all text-sm font-medium" placeholder="Mật khẩu" />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full py-3.5 rounded-2xl text-white bg-orange-500 hover:bg-orange-600 font-semibold text-sm shadow-lg shadow-orange-100 transition-all active:scale-[0.98] disabled:opacity-50">{isLoading ? 'Đang xử lý...' : 'Bắt đầu làm việc'}</button>
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
                            <input type="password" required value={signupPassword} onChange={e => setSignupPassword(e.target.value)} autoComplete="off" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-100 focus:bg-white outline-none transition-all text-sm font-medium" placeholder="Mật khẩu mới" />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 ml-1 leading-relaxed">Mật khẩu: Ít nhất 8 ký tự, 1 hoa, 1 thường, 1 số & 1 ký tự lạ.</p>
                    </div>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400"><LockIcon className="h-4 w-4" /></span>
                        <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="off" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-100 focus:bg-white outline-none transition-all text-sm font-medium" placeholder="Xác nhận mật khẩu" />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full py-3.5 rounded-2xl text-white bg-orange-500 hover:bg-orange-600 font-semibold text-sm shadow-lg shadow-orange-100 transition-all active:scale-[0.98] disabled:opacity-50">
                        {isLoading ? 'Đang đăng ký...' : 'Gia nhập đội ngũ'}
                    </button>
                </form>
            )}
        </div>
    </div>
  );
};

export default ShipperAuthPage;
