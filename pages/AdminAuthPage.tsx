import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MailIcon, LockIcon } from '../components/Icons';

const AdminAuthPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would have authentication logic here.
    // For this prototype, we'll just navigate to the dashboard.
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center" style={{backgroundImage: "url('https://picsum.photos/1920/1080?abstract,dark')"}}>
      <div className="absolute inset-0 bg-black opacity-60"></div>
      <div className="relative w-full max-w-sm bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">
            Admin Portal
          </h1>
          <p className="text-gray-400 mt-2">
            Đăng nhập để tiếp tục
          </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <MailIcon className="h-5 w-5 text-gray-400" />
              </span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="admin@example.com"
              />
            </div>
          </div>
          <div>
            <label htmlFor="password"  className="sr-only">Mật khẩu</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <LockIcon className="h-5 w-5 text-gray-400" />
              </span>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-orange-500"
            >
              Đăng nhập
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAuthPage;