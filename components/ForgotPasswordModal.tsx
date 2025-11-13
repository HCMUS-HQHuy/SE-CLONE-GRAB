import React, { useState, useEffect } from 'react';
import { PhoneIcon, LockIcon, XIcon, CheckCircleIcon } from './Icons';

type ForgotPasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

type Step = 'enter-contact' | 'enter-otp' | 'reset-password' | 'success';

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<Step>('enter-contact');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [isResendActive, setIsResendActive] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal is closed
      setTimeout(() => {
        setStep('enter-contact');
        setPhone('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
      }, 300); // Delay to allow closing animation
    }
  }, [isOpen]);

  useEffect(() => {
    // FIX: Use ReturnType<typeof setTimeout> for browser compatibility instead of NodeJS.Timeout
    let timer: ReturnType<typeof setTimeout>;
    if (step === 'enter-otp' && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setIsResendActive(true);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  if (!isOpen) return null;
  
  const handleContinue = () => {
    setError('');
    // Simulate checking phone number
    if (phone === '0123456789') { // Mock an existing number
      setStep('enter-otp');
      setCountdown(60);
      setIsResendActive(false);
    } else {
      setError('Thông tin không tìm thấy trong hệ thống.'); // XT03-Err-1
    }
  };
  
  const handleVerifyOtp = () => {
    setError('');
    if (isResendActive && countdown === 0) {
      setError('Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.'); // XT03-Err-2
      return;
    }
    if (otp === '123456') { // Mock correct OTP
      setStep('reset-password');
    } else {
      setError('Mã OTP không chính xác.');
    }
  };

  const handleResendOtp = () => {
    // Simulate resending OTP
    setCountdown(60);
    setIsResendActive(false);
    setError('');
    alert('Một mã OTP mới đã được gửi đến số điện thoại của bạn.');
  };
  
  const handleResetPassword = () => {
    setError('');
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        setError('Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ, số và ký tự đặc biệt.'); // XT03-Err-3
        return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    // Simulate success
    setStep('success');
  };

  const renderStepContent = () => {
    switch(step) {
      case 'enter-contact':
        return (
          <>
            <h3 id="fp-title" className="text-xl font-bold text-gray-800 text-center">Khôi phục mật khẩu</h3>
            <p className="text-center text-gray-500 mt-2 mb-6">Nhập số điện thoại đã đăng ký để nhận mã xác thực.</p>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3"><PhoneIcon className="h-5 w-5 text-gray-400" /></span>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500" placeholder="Số điện thoại" />
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <button onClick={handleContinue} className="w-full mt-6 py-3 px-4 rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 font-medium">Tiếp tục</button>
          </>
        );
      case 'enter-otp':
        return (
          <>
            <h3 id="fp-title" className="text-xl font-bold text-gray-800 text-center">Nhập mã OTP</h3>
            <p className="text-center text-gray-500 mt-2 mb-6">Một mã OTP gồm 6 chữ số đã được gửi đến số điện thoại <strong>{phone}</strong>.</p>
             <input type="text" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} className="w-full p-3 text-center text-2xl tracking-[1rem] border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500" placeholder="------" />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <div className="text-center text-sm mt-4">
              {countdown > 0 ? (
                <p className="text-gray-500">Gửi lại mã sau {countdown} giây</p>
              ) : (
                <button onClick={handleResendOtp} disabled={!isResendActive} className="text-orange-600 hover:underline font-medium disabled:text-gray-400">Gửi lại mã</button>
              )}
            </div>
            <button onClick={handleVerifyOtp} className="w-full mt-4 py-3 px-4 rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 font-medium">Xác thực</button>
          </>
        );
      case 'reset-password':
        return (
          <>
            <h3 id="fp-title" className="text-xl font-bold text-gray-800 text-center">Đặt lại mật khẩu mới</h3>
            <p className="text-center text-gray-500 mt-2 mb-6">Vui lòng tạo một mật khẩu mới cho tài khoản của bạn.</p>
            <div className="space-y-4">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3"><LockIcon className="h-5 w-5 text-gray-400" /></span>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500" placeholder="Mật khẩu mới" />
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3"><LockIcon className="h-5 w-5 text-gray-400" /></span>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500" placeholder="Xác nhận mật khẩu mới" />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <button onClick={handleResetPassword} className="w-full mt-6 py-3 px-4 rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 font-medium">Đặt lại mật khẩu</button>
          </>
        );
      case 'success':
        return (
            <div className="text-center">
                <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4"/>
                <h3 id="fp-title" className="text-xl font-bold text-gray-800">Thành công!</h3>
                <p className="text-gray-500 mt-2 mb-6">Mật khẩu của bạn đã được đặt lại thành công. Vui lòng đăng nhập lại.</p>
                <button onClick={onSuccess} className="w-full mt-4 py-3 px-4 rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 font-medium">Quay lại Đăng nhập</button>
            </div>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fp-title"
      onClick={onClose}
    >
      <div
        className="relative bg-white p-8 rounded-lg shadow-xl w-full max-w-md space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <XIcon className="h-6 w-6" />
        </button>
        {renderStepContent()}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
