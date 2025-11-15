import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

const RestaurantAuthGuard: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const profileStatus = localStorage.getItem('restaurant_profile_status');
    
    if (profileStatus === 'approved') {
      // User is approved, do nothing, let them access the content.
    } else if (profileStatus === 'pending') {
      navigate('/restaurant/pending', { replace: true });
    } else if (profileStatus === 'unsubmitted') {
      navigate('/restaurant/application', { replace: true });
    } else {
      // No status or invalid status, redirect to auth page.
      navigate('/restaurant/auth', { replace: true });
    }
  }, [navigate]);

  // A second check to prevent content flashing while useEffect runs.
  const profileStatus = localStorage.getItem('restaurant_profile_status');
  if (profileStatus !== 'approved') {
    return null; // Or a loading spinner component.
  }

  return <Outlet />;
};

export default RestaurantAuthGuard;