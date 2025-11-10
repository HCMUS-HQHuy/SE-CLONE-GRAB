import React from 'react';
import { Outlet } from 'react-router-dom';
import RestaurantNavbar from '../components/RestaurantNavbar';

const RestaurantLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <RestaurantNavbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default RestaurantLayout;
