
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { apiService } from '../services/api';

const AdminAuthGuard: React.FC = () => {
  const isLoggedIn = !!apiService.getToken('admin') && localStorage.getItem('admin_logged_in') === 'true';

  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default AdminAuthGuard;
