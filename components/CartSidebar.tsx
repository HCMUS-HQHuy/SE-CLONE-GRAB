import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { XIcon, TrashIcon, PlusIcon, MinusIcon, ShoppingCartIcon } from './Icons';

type CartSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
  const { items, restaurant, updateQuantity, removeItem, clearCart } = useCart();

  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat((item.newPrice || item.price || '0').replace(/\D/g, ''));
    return sum + price * item.quantity;
  }, 0);

  const deliveryFee = subtotal > 0 ? 15000 : 0;
  const total = subtotal + deliveryFee;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-heading"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 id="cart-heading" className="text-lg font-semibold text-gray-800">Giỏ hàng của bạn</h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600" aria-label="Đóng giỏ hàng">
              <XIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Cart Content */}
          {items.length === 0 ? (
             <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                <ShoppingCartIcon className="h-20 w-20 text-gray-300 mb-4"/>
                <h3 className="text-lg font-semibold text-gray-700">Giỏ hàng trống</h3>
                <p className="text-gray-500 mt-1">Hãy thêm món ăn yêu thích vào đây nhé!</p>
             </div>
          ) : (
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {/* Restaurant Info */}
              {restaurant && (
                <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-bold text-gray-800">{restaurant.name}</p>
                    <p className="text-sm text-gray-500">{restaurant.address}</p>
                </div>
              )}

              {/* Items List */}
              {items.map(item => (
                <div key={item.id} className="flex items-start space-x-4">
                  <img src={item.image} alt={item.name} className="h-20 w-20 rounded-md object-cover flex-shrink-0"/>
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-sm text-orange-500 font-bold mt-1">
                      {formatCurrency(parseFloat((item.newPrice || item.price || '0').replace(/\D/g, '')))}
                    </p>
                     <div className="flex items-center mt-2">
                        <div className="flex items-center border border-gray-200 rounded-md">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100">
                                <MinusIcon className="h-4 w-4"/>
                            </button>
                            <span className="px-3 py-1 font-semibold text-sm">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100">
                                <PlusIcon className="h-4 w-4"/>
                            </button>
                        </div>
                     </div>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="p-1 text-gray-400 hover:text-red-500" aria-label={`Xóa ${item.name}`}>
                    <TrashIcon className="h-5 w-5"/>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-4 border-t bg-gray-50">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-semibold text-gray-800">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí giao hàng</span>
                  <span className="font-semibold text-gray-800">{formatCurrency(deliveryFee)}</span>
                </div>
                 <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                  <span className="text-gray-800">Tổng cộng</span>
                  <span className="text-orange-600">{formatCurrency(total)}</span>
                </div>
              </div>
              <Link to="/user/checkout" onClick={onClose} className="mt-4 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                Thanh toán
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
