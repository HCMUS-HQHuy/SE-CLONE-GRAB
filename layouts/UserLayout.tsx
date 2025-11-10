import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CartSidebar from '../components/CartSidebar';
import ConfirmationModal from '../components/ConfirmationModal';
import { useCart } from '../contexts/CartContext';

const UserLayout: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { clearCartAndAddItem, pendingItem } = useCart();
  
  const handleConfirmClearCart = () => {
    if (pendingItem) {
      clearCartAndAddItem(pendingItem.item, pendingItem.quantity);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onCartClick={() => setIsCartOpen(true)} />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <ConfirmationModal
        isOpen={!!pendingItem}
        onClose={() => clearCartAndAddItem(null)} // Clear pending item
        onConfirm={handleConfirmClearCart}
        title="Bắt đầu giỏ hàng mới?"
        message="Giỏ hàng của bạn đang có sản phẩm từ một nhà hàng khác. Bạn có muốn xóa đi và thêm sản phẩm này không?"
      />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;