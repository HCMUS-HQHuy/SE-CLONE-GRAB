
import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

const RestaurantAuthGuard: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = apiService.getToken('seller');
    const profileStatus = localStorage.getItem('restaurant_profile_status');
    
    if (!token) {
        navigate('/restaurant/auth', { replace: true });
        return;
    }

    if (profileStatus === 'approved') {
      // Approved, okay
    } else if (profileStatus === 'pending') {
      navigate('/restaurant/pending', { replace: true });
    } else if (profileStatus === 'unsubmitted') {
      navigate('/restaurant/application', { replace: true });
    } else {
      navigate('/restaurant/auth', { replace: true });
    }
  }, [navigate]);

  const token = apiService.getToken('seller');
  const profileStatus = localStorage.getItem('restaurant_profile_status');
  
  if (!token || profileStatus !== 'approved') {
    return null;
  }

  return <Outlet />;
};

export default RestaurantAuthGuard;
