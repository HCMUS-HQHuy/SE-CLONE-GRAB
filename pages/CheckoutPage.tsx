
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
// Added LocationMarkerIcon to the imports list
import { HomeIcon, PencilIcon, CashIcon, CreditCardIcon, UserIcon, PhoneIcon, CheckCircleIcon, TagIcon, XIcon, ChevronLeftIcon, LocationMarkerIcon } from '../components/Icons';
import { apiService } from '../services/api';
import { profileApiService } from '../services/profileApi';
import { orderApiService, CreateOrderRequest } from '../services/orderApi';
import { promotionApiService, Promotion } from '../services/promotionApi';

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
  const [deliveryNote, setDeliveryNote] = useState('');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Trạng thái khuyến mãi
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<Promotion | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat((item.newPrice || item.price || '0').replace(/\D/g, ''));
    return sum + price * item.quantity;
  }, 0);

  const deliveryFee = subtotal > 0 ? 15000 : 0;

  const calculateDiscount = () => {
    if (!appliedPromo) return 0;
    if (appliedPromo.discount_type === 'fixed_amount') {
      return appliedPromo.discount_value;
    } else {
      let discount = (subtotal * appliedPromo.discount_value) / 100;
      if (appliedPromo.max_discount_value > 0 && discount > appliedPromo.max_discount_value) {
        discount = appliedPromo.max_discount_value;
      }
      return discount;
    }
  };

  const discountAmount = calculateDiscount();
  const total = Math.max(0, subtotal + deliveryFee - discountAmount);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount).replace(/\s/g, '');
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

  const handleApplyPromo = async () => {
    if (!promoCode.trim() || !restaurant) return;
    setIsValidatingPromo(true);
    setPromoError(null);
    try {
        const promotions = await promotionApiService.getRestaurantPromotions(restaurant.id);
        const promo = promotions.find(p => p.code.toUpperCase() === promoCode.toUpperCase());
        
        if (!promo) {
            setPromoError('Mã giảm giá không tồn tại.');
        } else if (!promo.is_active) {
            setPromoError('Mã giảm giá này hiện không khả dụng.');
        } else if (subtotal < promo.min_order_value) {
            setPromoError(`Đơn hàng tối thiểu từ ${formatCurrency(promo.min_order_value)}.`);
        } else {
            const now = new Date();
            const start = new Date(promo.start_date);
            const end = new Date(promo.end_date);
            end.setHours(23, 59, 59, 999);
            
            if (now < start) {
                setPromoError('Chưa đến thời gian sử dụng.');
            } else if (now > end) {
                setPromoError('Mã giảm giá đã hết hạn.');
            } else if (promo.usage_limit !== undefined && promo.used_count >= promo.usage_limit) {
                setPromoError('Mã đã hết lượt sử dụng.');
            } else {
                setAppliedPromo(promo);
                setPromoCode('');
            }
        }
    } catch (err) {
        setPromoError('Lỗi khi kiểm tra mã.');
    } finally {
        setIsValidatingPromo(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!deliveryInfo.address || !deliveryInfo.phone) {
        alert("Vui lòng hoàn tất thông tin địa chỉ giao hàng.");
        return;
    }
    setIsPlacingOrder(true);
    try {
        const userMe = await apiService.getMe('user');
        const orderPayload: CreateOrderRequest = {
            user_id: userMe.id.toString(),
            restaurant_id: restaurant!.id,
            delivery_address: `${deliveryInfo.name} | ${deliveryInfo.phone} | ${deliveryInfo.address}`,
            discount: discountAmount,
            delivery_note: deliveryNote,
            payment_method: paymentMethod === 'cash' ? 'CASH' : 'BANK_TRANSFER',
            items: items.map(item => ({
                product_id: item.id.toString(),
                product_name: item.name,
                quantity: item.quantity,
                unit_price: parseFloat((item.newPrice || item.price || '0').replace(/\D/g, '')),
                note: "" 
            }))
        };

        const orderResponse = await orderApiService.createOrder(orderPayload);
        const orderId = orderResponse.id;

        if (appliedPromo) {
            try {
                await promotionApiService.updatePromotion(appliedPromo.id, { 
                    used_count: (appliedPromo.used_count || 0) + 1
                });
            } catch (e) { console.error(e); }
        }

        const orderState = { restaurant, items, total, paymentMethod, deliveryInfo };
        if (paymentMethod === 'bank_transfer') {
            navigate(`/user/payment/${orderId}`, { state: orderState });
        } else {
            clearCart();
            navigate(`/user/orders?newOrder=${orderId}`);
        }
    } catch (err: any) {
        alert(err.message || "Lỗi khi tạo đơn hàng.");
    } finally {
        setIsPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
        <div className="max-w-xl mx-auto py-32 px-4 text-center">
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
                <h1 className="text-xl font-semibold text-gray-800">Giỏ hàng trống</h1>
                <p className="text-gray-500 mt-2 text-sm">Vui lòng quay lại chọn món trước khi thanh toán.</p>
                <button onClick={() => navigate('/user/home')} className="mt-8 bg-orange-500 text-white font-medium py-2.5 px-8 rounded-full hover:bg-orange-600 transition-all">
                    Tiếp tục mua sắm
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 lg:px-12 bg-gray-50/50 min-h-screen">
      <div className="flex items-center space-x-3 mb-10">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full transition-all text-gray-400 hover:text-gray-600 border border-transparent hover:border-gray-100">
              <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">Thanh toán</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section: Delivery Address */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100/50">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <HomeIcon className="h-5 w-5 text-orange-400 mr-2.5" />
                  Địa chỉ giao hàng
              </h2>
              {!isEditingAddress && !isLoadingProfile && (
                <button 
                    onClick={() => setIsEditingAddress(true)}
                    className="text-xs font-semibold text-orange-600 hover:text-orange-700 bg-orange-50/50 px-4 py-1.5 rounded-full transition-colors"
                >
                    Thay đổi
                </button>
              )}
            </div>

            {isLoadingProfile ? (
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-50 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-50 rounded w-3/4"></div>
                </div>
            ) : isEditingAddress ? (
                <div className="space-y-5 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Người nhận</label>
                            <input 
                                type="text" 
                                value={deliveryInfo.name} 
                                onChange={e => setDeliveryInfo({...deliveryInfo, name: e.target.value})}
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-200 outline-none text-sm transition-all"
                                placeholder="Họ và tên"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Số điện thoại</label>
                            <input 
                                type="tel" 
                                value={deliveryInfo.phone} 
                                onChange={e => setDeliveryInfo({...deliveryInfo, phone: e.target.value})}
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-200 outline-none text-sm transition-all"
                                placeholder="Ví dụ: 09xx"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Địa chỉ chi tiết</label>
                        <textarea 
                            value={deliveryInfo.address} 
                            onChange={e => setDeliveryInfo({...deliveryInfo, address: e.target.value})}
                            className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-200 outline-none text-sm transition-all"
                            rows={2}
                            placeholder="Số nhà, tên đường, phường..."
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-2">
                        <button onClick={() => setIsEditingAddress(false)} className="px-4 py-2 text-xs font-medium text-gray-500">Hủy bỏ</button>
                        <button onClick={() => setIsEditingAddress(false)} className="px-6 py-2 bg-orange-500 text-white text-xs font-semibold rounded-full hover:bg-orange-600 transition-all">Lưu địa chỉ</button>
                    </div>
                </div>
            ) : (
                <div className="flex items-start space-x-4">
                  <div className="bg-orange-50 p-3 rounded-2xl text-orange-400">
                    {/* Fixed: LocationMarkerIcon is now correctly imported and used */}
                    <LocationMarkerIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-grow min-w-0 pt-0.5">
                    <div className="flex items-baseline space-x-2">
                        <p className="font-semibold text-gray-800 text-base">{deliveryInfo.name || 'Họ tên'}</p>
                        <span className="text-gray-300">•</span>
                        <p className="text-gray-600 text-sm">{deliveryInfo.phone || 'SĐT'}</p>
                    </div>
                    <p className="text-gray-500 mt-1 text-sm leading-relaxed truncate">
                        {deliveryInfo.address || 'Chưa cung cấp địa chỉ.'}
                    </p>
                  </div>
                </div>
            )}
            
            <div className="mt-6 pt-6 border-t border-gray-50">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 ml-1">Ghi chú giao hàng</label>
                <input 
                    type="text"
                    value={deliveryNote}
                    onChange={e => setDeliveryNote(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-gray-200 outline-none text-sm transition-all placeholder:text-gray-300"
                    placeholder="Ví dụ: Để ở lễ tân, gọi khi đến..."
                />
            </div>
          </section>

          {/* Section: Promotions */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100/50">
            <h2 className="text-lg font-semibold text-gray-800 mb-8 flex items-center">
                 <TagIcon className="h-5 w-5 text-orange-400 mr-2.5" />
                 Mã giảm giá
            </h2>
            
            {appliedPromo ? (
                <div className="bg-green-50/50 border border-green-100 p-4 rounded-2xl flex justify-between items-center group animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex items-center">
                        <div className="bg-green-500 text-white p-2 rounded-xl mr-4 shadow-sm">
                            <TagIcon className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-green-700 uppercase tracking-widest">{appliedPromo.code}</p>
                            <p className="text-sm text-green-600/80">Đã giảm {formatCurrency(discountAmount)}</p>
                        </div>
                    </div>
                    <button onClick={() => setAppliedPromo(null)} className="p-2 text-green-300 hover:text-green-500 transition-colors">
                        <XIcon className="h-5 w-5" />
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="flex space-x-3">
                        <input 
                            type="text" 
                            value={promoCode}
                            onChange={e => setPromoCode(e.target.value)}
                            placeholder="Nhập mã ưu đãi..."
                            className="flex-grow p-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-gray-200 outline-none uppercase font-semibold text-sm transition-all"
                        />
                        <button 
                            onClick={handleApplyPromo}
                            disabled={isValidatingPromo || !promoCode.trim()}
                            className="bg-orange-500 text-white px-8 rounded-2xl font-semibold text-sm hover:bg-orange-600 disabled:opacity-50 disabled:bg-gray-200 transition-all"
                        >
                            {isValidatingPromo ? '...' : 'Áp dụng'}
                        </button>
                    </div>
                    {promoError && (
                        <p className="text-xs font-medium text-red-500 flex items-center ml-2">
                           <XIcon className="h-3 w-3 mr-1" /> {promoError}
                        </p>
                    )}
                </div>
            )}
          </section>
          
           {/* Section: Payment Method */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100/50">
            <h2 className="text-lg font-semibold text-gray-800 mb-8 flex items-center">
                 <CreditCardIcon className="h-5 w-5 text-orange-400 mr-2.5" />
                 Phương thức thanh toán
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <label className={`relative flex items-center p-5 border rounded-2xl cursor-pointer transition-all duration-300 ${paymentMethod === 'cash' ? 'border-orange-200 bg-orange-50/20 ring-1 ring-orange-200' : 'border-gray-100 hover:border-gray-200 bg-gray-50/30'}`}>
                <input type="radio" name="paymentMethod" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} className="sr-only"/>
                <CashIcon className={`h-8 w-8 mr-4 transition-colors ${paymentMethod === 'cash' ? 'text-orange-500' : 'text-gray-300'}`} />
                <div className="text-left">
                    <p className={`text-sm font-semibold ${paymentMethod === 'cash' ? 'text-gray-800' : 'text-gray-500'}`}>Tiền mặt (COD)</p>
                    <p className="text-[10px] text-gray-400 font-medium">Thanh toán khi nhận món</p>
                </div>
                {paymentMethod === 'cash' && <div className="absolute top-2 right-2"><CheckCircleIcon className="h-4 w-4 text-orange-500"/></div>}
              </label>
               <label className={`relative flex items-center p-5 border rounded-2xl cursor-pointer transition-all duration-300 ${paymentMethod === 'bank_transfer' ? 'border-orange-200 bg-orange-50/20 ring-1 ring-orange-200' : 'border-gray-100 hover:border-gray-200 bg-gray-50/30'}`}>
                <input type="radio" name="paymentMethod" value="bank_transfer" checked={paymentMethod === 'bank_transfer'} onChange={() => setPaymentMethod('bank_transfer')} className="sr-only"/>
                <CreditCardIcon className={`h-8 w-8 mr-4 transition-colors ${paymentMethod === 'bank_transfer' ? 'text-orange-500' : 'text-gray-300'}`} />
                <div className="text-left">
                    <p className={`text-sm font-semibold ${paymentMethod === 'bank_transfer' ? 'text-gray-800' : 'text-gray-500'}`}>Chuyển khoản</p>
                    <p className="text-[10px] text-gray-400 font-medium">Qua app ngân hàng / QR</p>
                </div>
                {paymentMethod === 'bank_transfer' && <div className="absolute top-2 right-2"><CheckCircleIcon className="h-4 w-4 text-orange-500"/></div>}
              </label>
            </div>
          </section>

          {/* Section: Items Detail */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100/50">
             <div className="flex justify-between items-end mb-8">
                 <h2 className="text-lg font-semibold text-gray-800">Chi tiết thực đơn</h2>
                 {restaurant && (
                    <div className="text-right">
                        <p className="text-sm font-semibold text-gray-700">{restaurant.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium truncate max-w-[200px]">{restaurant.address}</p>
                    </div>
                 )}
             </div>
             <div className="space-y-6">
                {items.map(item => (
                    <div key={item.id} className="flex justify-between items-center group">
                        <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 rounded-2xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100">
                                {item.image ? <img src={item.image.startsWith('http') ? item.image : `http://localhost:8004/${item.image}`} className="w-full h-full object-cover" /> : null}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">{item.name}</p>
                                <p className="text-xs text-gray-400 font-medium mt-0.5">{item.quantity} phần × {formatCurrency(parseFloat((item.newPrice || item.price || '0').replace(/\D/g, '')))}</p>
                            </div>
                        </div>
                        <p className="text-sm font-bold text-gray-700">{formatCurrency(parseFloat((item.newPrice || item.price || '0').replace(/\D/g, '')) * item.quantity)}</p>
                    </div>
                ))}
             </div>
          </section>
        </div>

        {/* Sidebar: Summary & Checkout Button */}
        <aside className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[2rem] shadow-md border border-gray-100/50 sticky top-24">
                 <h3 className="text-lg font-semibold text-gray-800 mb-8 border-b border-gray-50 pb-4">Tóm tắt thanh toán</h3>
                 <div className="space-y-4 mb-10">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400 font-medium">Tạm tính ({items.length})</span>
                      <span className="font-semibold text-gray-700">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400 font-medium">Phí vận chuyển</span>
                      <span className="font-semibold text-gray-700">{formatCurrency(deliveryFee)}</span>
                    </div>
                    {discountAmount > 0 && (
                        <div className="flex justify-between text-sm items-center bg-green-50 px-3 py-2 rounded-xl">
                            <span className="text-green-600 text-xs font-bold uppercase tracking-tight">Giảm giá</span>
                            <span className="font-bold text-green-600">-{formatCurrency(discountAmount)}</span>
                        </div>
                    )}
                     <div className="flex justify-between items-baseline border-t border-gray-50 pt-6 mt-6">
                      <span className="text-gray-800 font-semibold">Tổng cộng</span>
                      <span className="text-2xl font-black text-orange-500 tracking-tighter">{formatCurrency(total)}</span>
                    </div>
                </div>
                
                <div className="bg-blue-50/50 p-4 rounded-2xl mb-8 flex items-start space-x-3">
                    <div className="mt-0.5"><CheckCircleIcon className="h-4 w-4 text-blue-400" /></div>
                    <p className="text-[11px] text-blue-600/80 leading-relaxed font-medium">
                        Bằng cách đặt hàng, bạn đã đồng ý với các <strong>Chính sách giao nhận</strong> của chúng tôi.
                    </p>
                </div>

                <button 
                  onClick={handlePlaceOrder}
                  disabled={isLoadingProfile || isEditingAddress || isPlacingOrder}
                  className="w-full flex justify-center items-center py-4 px-4 rounded-2xl font-bold text-base text-white bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-100 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
                >
                    {isPlacingOrder ? (
                        <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Đang xử lý...</span>
                        </div>
                    ) : 'Đặt đơn ngay'}
                </button>
                
                <p className="text-center text-[10px] text-gray-300 mt-5 font-medium italic">Vui lòng kiểm tra kỹ món ăn trước khi nhấn</p>
            </div>
        </aside>
      </div>
    </div>
  );
};

export default CheckoutPage;
