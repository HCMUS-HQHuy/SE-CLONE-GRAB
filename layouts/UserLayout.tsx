import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const UserLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        {/* Child routes will be rendered here */}
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
