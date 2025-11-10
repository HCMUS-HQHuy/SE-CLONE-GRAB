import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import UserProfile from './pages/UserProfile';
import UserLayout from './layouts/UserLayout';
import HomePage from './pages/HomePage';
import RestaurantLayout from './layouts/RestaurantLayout';
import RestaurantProfilePage from './pages/RestaurantProfilePage';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/user" element={<UserLayout />}>
        {/* Redirect /user to /user/home by default */}
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<HomePage />} />
        <Route path="profile" element={<UserProfile />} />
        {/* Add other user routes here, e.g., orders, settings */}
      </Route>
      <Route path="/restaurant" element={<RestaurantLayout />}>
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<RestaurantProfilePage />} />
        {/* Add other restaurant routes here, e.g., menu, orders */}
      </Route>
       {/* You can add routes for /admin, /seller, /shipper later */}
    </Routes>
  );
};

export default App;