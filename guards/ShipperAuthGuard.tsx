import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

const ShipperAuthGuard: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const authStatus = localStorage.getItem('shipper_authed');
    
    if (authStatus === 'approved') {
      // User is approved, do nothing, let them access the content.
    } else if (authStatus === 'pending') {
      // User has registered but is pending approval.
      navigate('/shipper/pending', { replace: true });
    } else {
      // No status or invalid status, redirect to auth page.
      navigate('/shipper/auth', { replace: true });
    }
  }, [navigate]);

  // A second check to prevent content flashing while useEffect runs.
  const authStatus = localStorage.getItem('shipper_authed');
  if (authStatus !== 'approved') {
    return null; // Or a loading spinner component.
  }

  return <Outlet />;
};

export default ShipperAuthGuard;