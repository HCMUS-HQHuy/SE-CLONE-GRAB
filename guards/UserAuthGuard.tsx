
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { apiService } from '../services/api';

const UserAuthGuard: React.FC = () => {
  const isLoggedIn = !!apiService.getToken() && localStorage.getItem('user_logged_in') === 'true';

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default UserAuthGuard;
