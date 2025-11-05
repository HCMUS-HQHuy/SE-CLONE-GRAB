import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import UserProfile from './pages/UserProfile';
import UserLayout from './layouts/UserLayout';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/user" element={<UserLayout />}>
        {/* Redirect /user to /user/profile by default */}
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<UserProfile />} />
        {/* Add other user routes here, e.g., orders, settings */}
      </Route>
       {/* You can add routes for /admin, /seller, /shipper later */}
    </Routes>
  );
};

export default App;