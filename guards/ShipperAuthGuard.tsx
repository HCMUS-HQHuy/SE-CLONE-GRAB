
import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

const ShipperAuthGuard: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = apiService.getToken('shipper');
    const profileStatus = localStorage.getItem('shipper_profile_status');
    
    if (!token) {
        navigate('/shipper/auth', { replace: true });
        return;
    }

    if (profileStatus === 'approved') {
      // Approved
    } else if (profileStatus === 'pending') {
      navigate('/shipper/pending', { replace: true });
    } else if (profileStatus === 'unsubmitted') {
      navigate('/shipper/application', { replace: true });
    } else {
      navigate('/shipper/auth', { replace: true });
    }
  }, [navigate]);

  const token = apiService.getToken('shipper');
  const profileStatus = localStorage.getItem('shipper_profile_status');
  
  if (!token || profileStatus !== 'approved') {
    return null;
  }

  return <Outlet />;
};

export default ShipperAuthGuard;
