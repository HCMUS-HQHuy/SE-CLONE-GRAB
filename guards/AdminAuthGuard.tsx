import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

const AdminAuthGuard: React.FC = () => {
  const isLoggedIn = localStorage.getItem('admin_logged_in') === 'true';

  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default AdminAuthGuard;
