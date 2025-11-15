import React from 'react';
import { IdentificationIcon, ClockIcon } from '../components/Icons';

const ShipperPendingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4">
            <IdentificationIcon className="h-8 w-8"/>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">
          Hồ sơ đã được gửi!
        </h1>
        <p className="text-gray-600 mt-3">
          Cảm ơn bạn đã đăng ký. Hồ sơ của bạn đang được chúng tôi xem xét và định danh (KYC).
        </p>
        <div className="mt-6 bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-center justify-center space-x-3">
            <ClockIcon className="h-6 w-6 text-yellow-600"/>
            <p className="text-sm font-medium text-yellow-800">
                Quá trình xét duyệt có thể mất từ 24-48 giờ. Chúng tôi sẽ thông báo cho bạn khi hoàn tất.
            </p>
        </div>
        <p className="text-xs text-gray-400 mt-8">
            Nếu có bất kỳ câu hỏi nào, vui lòng liên hệ bộ phận hỗ trợ đối tác của chúng tôi.
        </p>
      </div>
    </div>
  );
};

export default ShipperPendingPage;