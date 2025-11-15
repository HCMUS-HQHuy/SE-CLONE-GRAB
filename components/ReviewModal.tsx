import React, { useState, useRef } from 'react';
import { XIcon, StarIcon, CameraIcon } from './Icons';

type ReviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reviewData: { rating: number; comment: string; images: string[] }) => void;
  orderId: string;
  restaurantName: string;
};

const MAX_IMAGES = 3;

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, onSubmit, orderId, restaurantName }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const ratingLabels = [
    'Tệ',
    'Không hài lòng',
    'Bình thường',
    'Hài lòng',
    'Tuyệt vời',
  ];
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
        const files = Array.from(event.target.files).slice(0, MAX_IMAGES - images.length);
        files.forEach(file => {
            // Add basic validation (e.g., file size)
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                alert(`Ảnh ${file.name} quá lớn. Vui lòng chọn ảnh nhỏ hơn 2MB.`);
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setImages(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    }
  };
  
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = () => {
    if (rating === 0) {
        alert("Vui lòng chọn số sao để đánh giá.");
        return;
    }
    onSubmit({ rating, comment, images });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
    >
      <div
        className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <div>
            <h2 id="review-modal-title" className="text-xl font-bold text-gray-800">
              Đánh giá đơn hàng #{orderId}
            </h2>
            <p className="text-sm text-gray-500">Nhà hàng: {restaurantName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Đóng">
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-6">
            {/* Star Rating */}
            <div>
                <p className="text-center font-semibold text-gray-700 mb-2">Trải nghiệm của bạn thế nào?</p>
                <div className="flex justify-center items-center space-x-2">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button 
                            key={star}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                            className="focus:outline-none"
                        >
                            <StarIcon className={`w-10 h-10 cursor-pointer transition-colors ${
                                (hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'
                            }`} />
                        </button>
                    ))}
                </div>
                 <p className="text-center text-sm text-gray-500 mt-2 h-5">
                    {(hoverRating > 0 && ratingLabels[hoverRating - 1]) || (rating > 0 && ratingLabels[rating - 1]) || 'Chọn số sao'}
                 </p>
            </div>

            {/* Comment */}
            <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">Bình luận</label>
                <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Hãy chia sẻ cảm nhận của bạn về món ăn và nhà hàng..."
                ></textarea>
            </div>

            {/* Image Upload */}
            <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Thêm hình ảnh (Tối đa {MAX_IMAGES})</label>
                 <div className="grid grid-cols-3 gap-3">
                    {images.map((imgSrc, index) => (
                        <div key={index} className="relative">
                            <img src={imgSrc} alt={`Preview ${index}`} className="h-24 w-full object-cover rounded-md" />
                            <button onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-0.5">
                                <XIcon className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                    {images.length < MAX_IMAGES && (
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-md hover:border-orange-400 transition-colors"
                        >
                            <CameraIcon className="h-8 w-8 text-gray-400"/>
                            <span className="text-xs text-gray-500 mt-1">Thêm ảnh</span>
                        </button>
                    )}
                 </div>
                 <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                 />
            </div>
        </div>
        
        <div className="mt-8 pt-5 border-t flex justify-end">
            <button
                onClick={handleSubmit}
                className="w-full py-3 px-4 rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 font-medium"
            >
                Gửi đánh giá
            </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
