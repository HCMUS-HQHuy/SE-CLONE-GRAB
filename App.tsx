import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import UserProfile from './pages/UserProfile';
import UserLayout from './layouts/UserLayout';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/user" element={<UserLayout />}>
        {/* Redirect /user to /user/home by default */}
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<HomePage />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="food/:id" element={<ProductDetailPage />} />
        {/* Add other user routes here, e.g., orders, settings */}
      </Route>
       {/* You can add routes for /admin, /seller, /shipper later */}
    </Routes>
  );
};

export default App;