
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { HomeIcon, PencilIcon, CashIcon, CreditCardIcon, UserIcon, PhoneIcon, CheckCircleIcon } from '../components/Icons';
import { apiService } from '../services/api';
import { profileApiService, UserProfileData } from '../services/profileApi';

type PaymentMethod = 'cash' | 'bank_transfer';

const CheckoutPage: React.FC = () => {
  const { items, restaurant, clearCart } = useCart();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  
  // Trạng thái thông tin giao hàng
  const [deliveryInfo, setDeliveryInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat((item.newPrice || item.price || '0').replace(/\D/g, ''));
    return sum + price * item.quantity;
  }, 0);

  const deliveryFee = subtotal > 0 ? 15000 : 0;
  const total = subtotal + deliveryFee;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const userMe = await apiService.getMe('user');
      const profile = await profileApiService.getProfile(userMe.id);
      setDeliveryInfo({
        name: profile.name || '',
        phone: profile.phone || '',
        address: profile.address || ''
      });
    } catch (err) {
      console.error("Không thể tải thông tin hồ sơ:", err);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!deliveryInfo.name || !deliveryInfo.phone || !deliveryInfo.address) {
        alert("Vui lòng nhập đầy đủ thông tin giao hàng.");
        return;
    }

    setIsSavingProfile(true);
    try {
        const userMe = await apiService.getMe('user');
        // Cập nhật lại vào Profile Service để lưu làm mặc định cho lần sau
        await profileApiService.updateProfile(userMe.id, {
            name: deliveryInfo.name,
            phone: deliveryInfo.phone,
            address: deliveryInfo.address
        });
        setIsEditingAddress(false);
    } catch (err) {
        console.error("Lỗi khi lưu địa chỉ:", err);
        alert("Không thể lưu địa chỉ. Vui lòng thử lại.");
    } finally {
        setIsSavingProfile(false);
    }
  };
  
  const handlePlaceOrder = () => {
    if (!deliveryInfo.address || !deliveryInfo.phone) {
        alert("Vui lòng hoàn tất thông tin địa chỉ giao hàng trước khi đặt.");
        return;
    }

    const orderId = `DH${Math.random().toString(36).substr(2, 7).toUpperCase()}`;
    const orderState = { 
        restaurant, 
        items, 
        total, 
        paymentMethod,
        deliveryInfo // Truyền thông tin người nhận sang trang tracking
    };

    if (paymentMethod === 'bank_transfer') {
      navigate(`/user/payment/${orderId}`, { state: orderState });
    } else {
      clearCart();
      navigate(`/user/order/${orderId}`, { state: orderState });
    }
  };


  if (items.length === 0) {
    return (
        <div className="max-w-4xl mx-auto py-20 px-4 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-sm border inline-block">
                <h1 className="text-2xl font-bold text-gray-800">Giỏ hàng của bạn trống</h1>
                <p className="text-gray-500 mt-2">Vui lòng quay lại chọn món trước khi thanh toán.</p>
                <button onClick={() => navigate('/user/home')} className="mt-6 bg-orange-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-600 transition-colors">
                    Tiếp tục mua sắm
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center space-x-2 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900">Xác nhận đơn hàng</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Delivery Address Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <HomeIcon className="h-6 w-6 text-orange-500 mr-2" />
                  Địa chỉ giao hàng
              </h2>
              {!isEditingAddress && !isLoadingProfile && (
                <button 
                    onClick={() => setIsEditingAddress(true)}
                    className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center bg-orange-50 px-3 py-1.5 rounded-full transition-colors"
                >
                    <PencilIcon className="h-3.5 w-3.5 mr-1.5" /> Thay đổi
                </button>
              )}
            </div>

            {isLoadingProfile ? (
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                </div>
            ) : isEditingAddress ? (
                <div className="space-y-4 bg-orange-50/30 p-4 rounded-xl border border-orange-100">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Người nhận</label>
                        <input 
                            type="text" 
                            value={deliveryInfo.name} 
                            onChange={e => setDeliveryInfo({...deliveryInfo, name: e.target.value})}
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                            placeholder="Họ và tên"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Số điện thoại</label>
                        <input 
                            type="tel" 
                            value={deliveryInfo.phone} 
                            onChange={e => setDeliveryInfo({...deliveryInfo, phone: e.target.value})}
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                            placeholder="Số điện thoại nhận hàng"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Địa chỉ chi tiết</label>
                        <textarea 
                            value={deliveryInfo.address} 
                            onChange={e => setDeliveryInfo({...deliveryInfo, address: e.target.value})}
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                            rows={2}
                            placeholder="Số nhà, tên đường, Phường, Quận..."
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-2">
                        <button 
                            onClick={() => setIsEditingAddress(false)}
                            className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-800"
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            onClick={handleSaveAddress}
                            disabled={isSavingProfile}
                            className="px-6 py-2 bg-orange-500 text-white text-sm font-bold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                        >
                            {isSavingProfile ? 'Đang lưu...' : 'Lưu địa chỉ này'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-start group">
                  <div className="bg-orange-100 p-3 rounded-full mr-4 text-orange-600">
                    <CheckCircleIcon className="h-6 w-6" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center space-x-2">
                        <p className="font-bold text-gray-900 text-lg">{deliveryInfo.name || 'Chưa cập nhật tên'}</p>
                        <span className="text-gray-300">|</span>
                        <p className="text-gray-700 font-medium">{deliveryInfo.phone || 'Chưa cập nhật SĐT'}</p>
                    </div>
                    <p className="text-gray-500 mt-1 leading-relaxed">
                        {deliveryInfo.address || 'Vui lòng cung cấp địa chỉ giao hàng.'}
                    </p>
                  </div>
                </div>
            )}
          </div>
          
           {/* Payment Method Selection */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                 <CreditCardIcon className="h-6 w-6 text-orange-500 mr-2" />
                 Phương thức thanh toán
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-orange-500 bg-orange-50/50 shadow-md shadow-orange-100' : 'border-gray-100 hover:border-gray-200'}`}>
                <input type="radio" name="paymentMethod" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300"/>
                <span className="ml-4 flex items-center">
                  <CashIcon className="h-8 w-8 text-green-500 mr-3"/>
                  <div className="text-left">
                    <span className="block text-sm font-bold text-gray-900">Tiền mặt (COD)</span>
                    <span className="block text-xs text-gray-500">Trả khi nhận hàng</span>
                  </div>
                </span>
              </label>
               <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'bank_transfer' ? 'border-orange-500 bg-orange-50/50 shadow-md shadow-orange-100' : 'border-gray-100 hover:border-gray-200'}`}>
                <input type="radio" name="paymentMethod" value="bank_transfer" checked={paymentMethod === 'bank_transfer'} onChange={() => setPaymentMethod('bank_transfer')} className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300"/>
                <span className="ml-4 flex items-center">
                    <CreditCardIcon className="h-8 w-8 text-blue-500 mr-3"/>
                    <div className="text-left">
                        <span className="block text-sm font-bold text-gray-900">Chuyển khoản</span>
                        <span className="block text-xs text-gray-500">Techcombank / MOMO</span>
                    </div>
                </span>
              </label>
            </div>
          </div>


          {/* Detailed Order Summary */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h2 className="text-xl font-bold text-gray-800 mb-6">Chi tiết đơn hàng</h2>
             {restaurant && (
                 <div className="mb-6 flex items-center bg-gray-50 p-4 rounded-xl">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                        <span className="font-bold text-orange-600">{restaurant.name.charAt(0)}</span>
                    </div>
                    <div>
                        <p className="font-bold text-gray-800">{restaurant.name}</p>
                        <p className="text-xs text-gray-500">{restaurant.address}</p>
                    </div>
                 </div>
             )}
             <div className="space-y-4">
                {items.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-white p-2 border-b border-gray-50 last:border-0">
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-md bg-gray-100 mr-3 overflow-hidden">
                                {item.image ? <img src={item.image.startsWith('http') ? item.image : `http://localhost:8004/${item.image}`} className="w-full h-full object-cover" /> : null}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800">{item.name}</p>
                                <span className="text-xs text-orange-500 font-bold">{item.quantity} x {formatCurrency(parseFloat((item.newPrice || item.price || '0').replace(/\D/g, '')))}</span>
                            </div>
                        </div>
                        <span className="text-sm font-bold text-gray-700">{formatCurrency(parseFloat((item.newPrice || item.price || '0').replace(/\D/g, '')) * item.quantity)}</span>
                    </div>
                ))}
             </div>
          </div>
        </div>

        {/* Sidebar: Order Total & Confirmation */}
        <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
                 <h3 className="text-xl font-bold text-gray-800 border-b pb-4 mb-6">Tóm tắt thanh toán</h3>
                 <div className="space-y-3 mb-8">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tạm tính ({items.length} món)</span>
                      <span className="font-bold text-gray-800">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Phí giao hàng</span>
                      <span className="font-bold text-gray-800">{formatCurrency(deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Giảm giá</span>
                      <span className="font-bold text-green-600">- {formatCurrency(0)}</span>
                    </div>
                     <div className="flex justify-between text-2xl font-black border-t pt-4 mt-4">
                      <span className="text-gray-900">Tổng</span>
                      <span className="text-orange-500">{formatCurrency(total)}</span>
                    </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-xl mb-6 flex items-start space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                    <p className="text-[11px] text-blue-700 leading-tight">
                        Bằng cách đặt hàng, bạn đồng ý với các <strong>Điều khoản dịch vụ</strong> và <strong>Chính sách bảo mật</strong> của chúng tôi.
                    </p>
                </div>

                <button 
                  onClick={handlePlaceOrder}
                  disabled={isLoadingProfile || isEditingAddress}
                  className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl font-black text-xl text-white bg-orange-500 hover:bg-orange-600 shadow-xl shadow-orange-200 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                >
                    ĐẶT ĐƠN NGAY
                </button>
                
                <p className="text-center text-xs text-gray-400 mt-4 italic">Đảm bảo thông tin của bạn chính xác trước khi nhấn</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
