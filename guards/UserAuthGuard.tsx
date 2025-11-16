import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

const UserAuthGuard: React.FC = () => {
  const isLoggedIn = localStorage.getItem('user_logged_in') === 'true';

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default UserAuthGuard;
