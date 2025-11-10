import React, { useState, useEffect } from 'react';
import { StarIcon, ImageIcon, PlusIcon, MinusIcon, XIcon } from './Icons';
import { FoodItem } from '../pages/HomePage';

type ProductDetailModalProps = {
  product: FoodItem;
  onClose: () => void;
};

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const [quantity, setQuantity] = useState(1);

  // Handle Escape key press to close modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >
      <div 
        className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-300"
          aria-label="Close"
        >
          <XIcon className="h-6 w-6" />
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="w-full h-80 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
            {product.image ? (
                <img className="h-full w-full object-cover" src={product.image} alt={product.name} />
            ) : (
                <ImageIcon className="h-24 w-24 text-gray-400" />
            )}
          </div>

          {/* Details Section */}
          <div className="flex flex-col justify-center">
            {product.bestseller && (
                <div className="inline-flex items-center bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full mb-2 w-fit">
                    <StarIcon className="w-4 h-4 mr-1.5" />
                    <span>Bán chạy nhất</span>
                </div>
            )}
            <h1 id="product-modal-title" className="text-3xl font-extrabold text-gray-900 mb-2">{product.name}</h1>
            <div className="mb-4 border-b pb-4">
              <p className="font-semibold text-gray-700">{product.restaurant.name}</p>
              <p className="text-sm text-gray-500">{product.restaurant.address}</p>
               {product.distance !== undefined && (
                <p className="text-sm text-orange-600 font-medium mt-1">Cách bạn khoảng {product.distance.toFixed(1)} km</p>
              )}
            </div>
            <p className="text-gray-600 mb-4">{product.description}</p>
            
            <div className="mb-6">
                {product.newPrice ? (
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-orange-500">{product.newPrice}</p>
                    <p className="text-lg text-gray-400 line-through">{product.oldPrice}</p>
                </div>
                ) : (
                <p className="text-3xl font-bold text-orange-500">{product.price}</p>
                )}
            </div>
            
            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
                <label className="text-sm font-medium text-gray-700">Số lượng:</label>
                <div className="flex items-center border border-gray-300 rounded-md">
                    <button onClick={handleDecrement} className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-l-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <MinusIcon className="h-5 w-5"/>
                    </button>
                    <span className="px-4 py-1.5 font-semibold text-lg">{quantity}</span>
                     <button onClick={handleIncrement} className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-r-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <PlusIcon className="h-5 w-5"/>
                    </button>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <button className="w-full flex justify-center py-3 px-4 border border-orange-500 rounded-md shadow-sm text-sm font-medium text-orange-500 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300">
                    Thêm vào giỏ hàng
                </button>
                <button className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300">
                    Mua ngay
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;