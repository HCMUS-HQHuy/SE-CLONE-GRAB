
import React, { useState, useRef } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Restaurant, FoodItem } from './HomePage';
import { UploadIcon, CheckCircleIcon, PaperClipIcon } from '../components/Icons';
import { useCart } from '../contexts/CartContext';

type CartItem = FoodItem & { quantity: number };

type OrderState = {
  restaurant: Restaurant;
  items: CartItem[];
  total: number;
};

const BankTransferPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { restaurant, items, total } = (location.state as OrderState) || {};
  
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bankInfo = {
    bankName: 'Ngân hàng TMCP Kỹ thương Việt Nam (Techcombank)',
    accountNumber: '1903xxxxxxxx88',
    accountName: 'CONG TY TNHH FOOD DELIVERY',
    branch: 'Chi nhánh Sài Gòn',
  };
  
  const transferContent = `FD${orderId}`;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validation
      const allowedTypes = ['image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setError('Loại tệp không hợp lệ. Vui lòng chọn ảnh JPG hoặc PNG.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Kích thước tệp quá lớn. Vui lòng chọn tệp nhỏ hơn 5MB.');
        return;
      }

      setError('');
      setReceipt(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmPayment = () => {
    if (!receipt) {
      setError('Vui lòng tải lên biên lai chuyển khoản để xác nhận.');
      return;
    }
    // Simulate submitting the receipt
    console.log('Submitting receipt for order:', orderId, receipt.name);
    
    // Use localStorage to signal that payment proof has been submitted
    localStorage.setItem(`payment_status_${orderId}`, 'submitted');
    
    // Manually trigger a storage event for the listeners
    window.dispatchEvent(new StorageEvent('storage', {
        key: `payment_status_${orderId}`,
        newValue: 'submitted'
    }));
    
    clearCart();
    // Điều hướng sang lịch sử đơn hàng và tự động mở modal của đơn này
    navigate(`/user/orders?newOrder=${orderId}`);
  };
  
  if (!restaurant || !items) {
    // Handle case where state is lost (e.g., page refresh)
    return <div className="text-center p-8">Đã xảy ra lỗi, không tìm thấy thông tin đơn hàng.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="text-center mb-6">
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-gray-900">Đơn hàng đã được tạo!</h1>
        <p className="text-gray-600 mt-2">Vui lòng hoàn tất chuyển khoản trong <span className="font-bold text-orange-600">24 giờ</span> để đơn hàng được xử lý.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Bank Info Section */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-3">Thông tin chuyển khoản</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Ngân hàng:</span>
              <span className="font-semibold text-gray-800 text-right">{bankInfo.bankName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Số tài khoản:</span>
              <span className="font-semibold text-gray-800">{bankInfo.accountNumber}</span>
            </div>
             <div className="flex justify-between">
              <span className="text-gray-500">Chủ tài khoản:</span>
              <span className="font-semibold text-gray-800 text-right">{bankInfo.accountName}</span>
            </div>
             <div className="flex justify-between">
              <span className="text-gray-500">Chi nhánh:</span>
              <span className="font-semibold text-gray-800">{bankInfo.branch}</span>
            </div>
             <div className="flex justify-between">
              <span className="text-gray-500">Số tiền:</span>
              <span className="font-bold text-lg text-orange-600">{formatCurrency(total)}</span>
            </div>
             <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center mt-4">
                <p className="text-gray-600 text-sm">Nội dung chuyển khoản (bắt buộc):</p>
                <p className="font-bold text-xl text-red-600 tracking-wider bg-white py-2 mt-1 rounded">{transferContent}</p>
             </div>
          </div>
        </div>

        {/* Upload Receipt Section */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
           <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-3">Xác nhận thanh toán</h2>
           <p className="text-sm text-gray-600 mb-4">Sau khi chuyển khoản thành công, vui lòng tải lên biên lai hoặc ảnh chụp màn hình giao dịch để chúng tôi xác nhận đơn hàng của bạn nhanh hơn.</p>
           
           <div 
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-orange-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="space-y-1 text-center">
                    {receiptPreview ? (
                        <img src={receiptPreview} alt="Biên lai" className="mx-auto max-h-40 rounded-md"/>
                    ) : (
                        <>
                            <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                                <p className="pl-1">Nhấn để tải lên biên lai</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG (tối đa 5MB)</p>
                        </>
                    )}
                </div>
            </div>
            <input ref={fileInputRef} type="file" className="sr-only" onChange={handleFileSelect} accept="image/png, image/jpeg" />

            {receipt && (
                <div className="mt-3 text-sm text-green-700 flex items-center bg-green-50 p-2 rounded-md">
                    <PaperClipIcon className="h-4 w-4 mr-2"/>
                    <span>Đã chọn tệp: {receipt.name}</span>
                </div>
            )}
            
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
           
           <button
             onClick={handleConfirmPayment}
             className="mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-gray-400"
            >
                Tôi đã thanh toán
           </button>
        </div>
      </div>
    </div>
  );
};

export default BankTransferPage;
