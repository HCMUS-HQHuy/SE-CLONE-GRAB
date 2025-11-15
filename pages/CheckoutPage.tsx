import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { HomeIcon, PencilIcon, CashIcon, CreditCardIcon } from '../components/Icons';

type PaymentMethod = 'cash' | 'bank_transfer';

const CheckoutPage: React.FC = () => {
  const { items, restaurant, clearCart } = useCart();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');

  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat((item.newPrice || item.price || '0').replace(/\D/g, ''));
    return sum + price * item.quantity;
  }, 0);

  const deliveryFee = subtotal > 0 ? 15000 : 0;
  const total = subtotal + deliveryFee;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };
  
  const handlePlaceOrder = () => {
    const orderId = `DH${Math.random().toString(36).substr(2, 7).toUpperCase()}`;
    const orderState = { restaurant, items, total, paymentMethod };

    if (paymentMethod === 'bank_transfer') {
      // Don't clear cart yet, user needs to complete payment
      navigate(`/user/payment/${orderId}`, { state: orderState });
    } else {
      // For cash, clear cart and go to tracking
      clearCart();
      navigate(`/user/order/${orderId}`, { state: orderState });
    }
  };


  if (items.length === 0) {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4 text-center">
            <h1 className="text-2xl font-bold text-gray-800">Giỏ hàng của bạn trống</h1>
            <button onClick={() => navigate('/user/home')} className="mt-4 text-orange-500 hover:underline">
                Tiếp tục mua sắm
            </button>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Thanh toán</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Địa chỉ giao hàng</h2>
              <button className="text-sm font-medium text-orange-600 hover:text-orange-500 flex items-center">
                <PencilIcon className="h-4 w-4 mr-1" /> Thay đổi
              </button>
            </div>
            <div className="p-4 border rounded-md flex items-start">
              <HomeIcon className="h-6 w-6 text-orange-500 mt-1 mr-4" />
              <div>
                <p className="font-semibold text-gray-900">Nhà riêng</p>
                <p className="text-gray-600">Nguyễn Văn A | 0987654321</p>
                <p className="text-gray-500">123 Đường ABC, Phường 1, Quận 2, Thành phố Hồ Chí Minh</p>
              </div>
            </div>
          </div>
          
           {/* Payment Method */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Phương thức thanh toán</h2>
            <div className="space-y-3">
              <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200'}`}>
                <input type="radio" name="paymentMethod" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"/>
                <span className="ml-3 flex items-center">
                  <CashIcon className="h-6 w-6 text-green-500 mr-3"/>
                  <span className="text-sm font-medium text-gray-800">Thanh toán khi nhận hàng (COD)</span>
                </span>
              </label>
               <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'bank_transfer' ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200'}`}>
                <input type="radio" name="paymentMethod" value="bank_transfer" checked={paymentMethod === 'bank_transfer'} onChange={() => setPaymentMethod('bank_transfer')} className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"/>
                <span className="ml-3 flex items-center">
                    <CreditCardIcon className="h-6 w-6 text-blue-500 mr-3"/>
                  <span className="text-sm font-medium text-gray-800">Chuyển khoản ngân hàng</span>
                </span>
              </label>
            </div>
          </div>


          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow-md">
             <h2 className="text-xl font-semibold text-gray-800 mb-4">Chi tiết đơn hàng</h2>
             {restaurant && (
                 <div className="mb-4 pb-4 border-b">
                    <p className="font-bold text-gray-800">{restaurant.name}</p>
                    <p className="text-sm text-gray-500">{restaurant.address}</p>
                 </div>
             )}
             <div className="space-y-3">
                {items.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                        <div className="flex items-center">
                            <span className="font-bold text-orange-500 mr-2">{item.quantity}x</span>
                            <span>{item.name}</span>
                        </div>
                        <span className="text-gray-700">{formatCurrency(parseFloat((item.newPrice || item.price || '0').replace(/\D/g, '')) * item.quantity)}</span>
                    </div>
                ))}
             </div>
          </div>
        </div>

        {/* Total & Payment */}
        <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
                 <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">Tổng cộng</h3>
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
                      <span className="text-gray-800">Thanh toán</span>
                      <span className="text-orange-600">{formatCurrency(total)}</span>
                    </div>
                </div>
                <button 
                  onClick={handlePlaceOrder}
                  className="mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                    Đặt hàng
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;