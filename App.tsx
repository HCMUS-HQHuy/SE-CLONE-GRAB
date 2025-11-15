import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import UserProfile from './pages/UserProfile';
import UserLayout from './layouts/UserLayout';
import HomePage from './pages/HomePage';
import RestaurantLayout from './layouts/RestaurantLayout';
import StorePage from './pages/RestaurantProfilePage';
import UserRestaurantProfilePage from './pages/UserRestaurantProfilePage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import RestaurantOrdersPage from './pages/RestaurantOrdersPage';
import RestaurantDashboardPage from './pages/DashboardPage';
import PromotionsPage from './pages/PromotionsPage';
import ShipperLayout from './layouts/ShipperLayout';
import ShipperProfilePage from './pages/ShipperProfilePage';
import ShipperOrdersPage from './pages/ShipperOrdersPage';
import ShipperNotificationsPage from './pages/ShipperNotificationsPage';
import ShipperHistoryPage from './pages/ShipperHistoryPage';
import SupportPage from './pages/SupportPage';
import BankTransferPage from './pages/BankTransferPage';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/user" element={<UserLayout />}>
        {/* Redirect /user to /user/home by default */}
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<HomePage />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="restaurant/:id" element={<UserRestaurantProfilePage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="order/:orderId" element={<OrderTrackingPage />} />
        <Route path="payment/:orderId" element={<BankTransferPage />} />
        {/* Add other user routes here, e.g., orders, settings */}
      </Route>
      <Route path="/restaurant" element={<RestaurantLayout />}>
        <Route index element={<Navigate to="store" replace />} />
        <Route path="dashboard" element={<RestaurantDashboardPage />} />
        <Route path="store" element={<StorePage />} />
        <Route path="orders" element={<RestaurantOrdersPage />} />
        <Route path="promotions" element={<PromotionsPage />} />
        {/* Add other restaurant routes here, e.g., menu, orders */}
      </Route>
       <Route path="/shipper" element={<ShipperLayout />}>
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<ShipperProfilePage />} />
        <Route path="orders" element={<ShipperOrdersPage />} />
        <Route path="history" element={<ShipperHistoryPage />} />
        <Route path="notifications" element={<ShipperNotificationsPage />} />
      </Route>
    </Routes>
  );
};

export default App;