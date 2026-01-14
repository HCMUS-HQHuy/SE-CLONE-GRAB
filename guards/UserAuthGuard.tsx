
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

const UserAuthGuard: React.FC = () => {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = apiService.getToken('user');
      const isLoggedIn = token && localStorage.getItem('user_logged_in') === 'true';

      if (!isLoggedIn) {
        navigate('/', { replace: true });
        return;
      }

      try {
        const profile = await apiService.getMe('user');
        if (profile.is_active === false) {
            navigate('/user/profile', { replace: true });
        } else {
            setIsVerifying(false);
        }
      } catch (error) {
        navigate('/', { replace: true });
      }
    };

    checkAuth();
  }, [navigate]);

  if (isVerifying) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
    );
  }

  return <Outlet />;
};

export default UserAuthGuard;
