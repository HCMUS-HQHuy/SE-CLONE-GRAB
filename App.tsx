
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import UserProfile from './pages/UserProfile';
import UserLayout from './layouts/UserLayout';
import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage'; // Import trang mới
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
import AdminAuthPage from './pages/AdminAuthPage';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminRestaurantsPage from './pages/AdminRestaurantsPage';
import AdminShippersPage from './pages/AdminShippersPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import RestaurantAuthPage from './pages/RestaurantAuthPage';
import RestaurantPendingPage from './pages/RestaurantPendingPage';
import RestaurantAuthGuard from './guards/RestaurantAuthGuard';
import ShipperAuthPage from './pages/ShipperAuthPage';
import ShipperPendingPage from './pages/ShipperPendingPage';
import ShipperAuthGuard from './guards/ShipperAuthGuard';
import RestaurantApplicationPage from './pages/RestaurantApplicationPage';
import ShipperApplicationPage from './pages/ShipperApplicationPage';
import UserAuthGuard from './guards/UserAuthGuard';
import AdminAuthGuard from './guards/AdminAuthGuard';
import NotFoundPage from './pages/NotFoundPage';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route element={<UserAuthGuard />}>
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<HomePage />} />
          <Route path="search" element={<SearchResultsPage />} /> {/* Route mới */}
          <Route path="profile" element={<UserProfile />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="restaurant/:id" element={<UserRestaurantProfilePage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="order/:orderId" element={<OrderTrackingPage />} />
          <Route path="payment/:orderId" element={<BankTransferPage />} />
        </Route>
      </Route>

      <Route path="/restaurant/auth" element={<RestaurantAuthPage />} />
      <Route path="/restaurant/pending" element={<RestaurantPendingPage />} />
      <Route path="/restaurant/application" element={<RestaurantApplicationPage />} />
      <Route element={<RestaurantAuthGuard />}>
        <Route path="/restaurant" element={<RestaurantLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<RestaurantDashboardPage />} />
          <Route path="store" element={<StorePage />} />
          <Route path="orders" element={<RestaurantOrdersPage />} />
          <Route path="promotions" element={<PromotionsPage />} />
        </Route>
      </Route>

      <Route path="/shipper/auth" element={<ShipperAuthPage />} />
      <Route path="/shipper/pending" element={<ShipperPendingPage />} />
      <Route path="/shipper/application" element={<ShipperApplicationPage />} />
      <Route element={<ShipperAuthGuard />}>
        <Route path="/shipper" element={<ShipperLayout />}>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<ShipperProfilePage />} />
          <Route path="orders" element={<ShipperOrdersPage />} />
          <Route path="history" element={<ShipperHistoryPage />} />
          <Route path="notifications" element={<ShipperNotificationsPage />} />
        </Route>
      </Route>
      
      <Route path="/admin/login" element={<AdminAuthPage />} />
      <Route element={<AdminAuthGuard />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="restaurants" element={<AdminRestaurantsPage />} />
          <Route path="shippers" element={<AdminShippersPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
