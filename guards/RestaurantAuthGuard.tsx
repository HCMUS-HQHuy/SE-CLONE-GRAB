
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

const RestaurantAuthGuard: React.FC = () => {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = apiService.getToken('seller');
      
      if (!token) {
          navigate('/restaurant/auth', { replace: true });
          return;
      }

      try {
        const profile = await apiService.getMe('seller');
        if (profile.status === 'active') {
          setIsVerifying(false);
        } else if (profile.status === 'pending') {
          const currentStatus = localStorage.getItem('restaurant_profile_status');
          if (currentStatus === 'pending') {
            navigate('/restaurant/pending', { replace: true });
          } else {
            navigate('/restaurant/application', { replace: true });
          }
        } else {
          // Inactive or Banned
          apiService.logout('seller');
          navigate('/restaurant/auth', { replace: true });
        }
      } catch (error) {
        navigate('/restaurant/auth', { replace: true });
      }
    };

    checkAuth();
  }, [navigate]);

  if (isVerifying) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
    );
  }

  return <Outlet />;
};

export default RestaurantAuthGuard;
