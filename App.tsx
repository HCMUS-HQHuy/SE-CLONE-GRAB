import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import UserProfile from './pages/UserProfile';
import UserLayout from './layouts/UserLayout';
import HomePage from './pages/HomePage';
import RestaurantLayout from './layouts/RestaurantLayout';
import RestaurantProfilePage from './pages/RestaurantProfilePage';
import UserRestaurantProfilePage from './pages/UserRestaurantProfilePage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import RestaurantOrdersPage from './pages/RestaurantOrdersPage';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/user" element={<UserLayout />}>
        {/* Redirect /user to /user/home by default */}
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<HomePage />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="restaurant/:id" element={<UserRestaurantProfilePage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="order/:orderId" element={<OrderTrackingPage />} />
        {/* Add other user routes here, e.g., orders, settings */}
      </Route>
      <Route path="/restaurant" element={<RestaurantLayout />}>
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<RestaurantProfilePage />} />
        <Route path="orders" element={<RestaurantOrdersPage />} />
        {/* Add other restaurant routes here, e.g., menu, orders */}
      </Route>
       {/* You can add routes for /admin, /seller, /shipper later */}
    </Routes>
  );
};

export default App;