import React, { useState } from 'react';
import { XIcon, StarIcon } from './Icons';

type DriverReviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reviewData: { rating: number; comment: string; tags: string[] }) => void;
  driverName: string;
  driverAvatar: string;
};

const predefinedTags = [
    'Thân thiện',
    'Giao hàng nhanh',
    'Cẩn thận',
    'Chuyên nghiệp',
    'Thông thạo đường',
    'Vui vẻ'
];

const DriverReviewModal: React.FC<DriverReviewModalProps> = ({ isOpen, onClose, onSubmit, driverName, driverAvatar }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  if (!isOpen) return null;

  const ratingLabels = [ 'Tệ', 'Không hài lòng', 'Bình thường', 'Hài lòng', 'Tuyệt vời' ];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };
  
  const handleSubmit = () => {
    if (rating === 0) {
        alert("Vui lòng chọn số sao để đánh giá tài xế.");
        return;
    }
    onSubmit({ rating, comment, tags: selectedTags });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog" aria-modal="true" aria-labelledby="driver-review-modal-title"
    >
      <div
        className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b pb-4 mb-6">
            <div className="flex items-center space-x-3">
                <img src={driverAvatar} alt={driverName} className="h-12 w-12 rounded-full object-cover" />
                <div>
                    <h2 id="driver-review-modal-title" className="text-xl font-bold text-gray-800">
                      Đánh giá tài xế
                    </h2>
                    <p className="text-sm text-gray-500">{driverName}</p>
                </div>
            </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Đóng">
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-6">
            {/* Star Rating */}
            <div>
                <p className="text-center font-semibold text-gray-700 mb-2">Bạn hài lòng với tài xế chứ?</p>
                <div className="flex justify-center items-center space-x-2">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(star)} className="focus:outline-none">
                            <StarIcon className={`w-10 h-10 cursor-pointer transition-colors ${(hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'}`} />
                        </button>
                    ))}
                </div>
                 <p className="text-center text-sm text-gray-500 mt-2 h-5">
                    {(hoverRating > 0 && ratingLabels[hoverRating - 1]) || (rating > 0 && ratingLabels[rating - 1]) || 'Chọn số sao'}
                 </p>
            </div>

            {/* Tags */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tài xế có ưu điểm gì?</label>
                <div className="flex flex-wrap gap-2">
                    {predefinedTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                                selectedTags.includes(tag)
                                ? 'bg-orange-500 border-orange-500 text-white'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
                            }`}
                        >{tag}</button>
                    ))}
                </div>
            </div>

            {/* Comment */}
            <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">Góp ý thêm (không bắt buộc)</label>
                <textarea
                    id="comment" value={comment} onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Tài xế có thể cải thiện điều gì?"
                ></textarea>
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

export default DriverReviewModal;