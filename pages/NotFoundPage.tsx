import React from 'react';
import { Link } from 'react-router-dom';
import { ExclamationIcon } from '../components/Icons';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-full max-w-md">
        <ExclamationIcon className="h-24 w-24 text-orange-400 mx-auto mb-4" />
        <h1 className="text-6xl font-extrabold text-gray-800">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mt-2">
          Oops! Trang không tồn tại
        </h2>
        <p className="text-gray-500 mt-4">
          Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc không bao giờ tồn tại.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors duration-300 shadow-lg"
        >
          Quay về trang chủ
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
