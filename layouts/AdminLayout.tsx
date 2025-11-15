import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';

const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminNavbar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 md:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;