import React from 'react';
import { Outlet } from 'react-router-dom';
import ShipperNavbar from '../components/ShipperNavbar';

const ShipperLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <ShipperNavbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default ShipperLayout;