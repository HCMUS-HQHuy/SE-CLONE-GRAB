
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StarIcon, ImageIcon, PlusIcon, MinusIcon, XIcon, ClockIcon, LocationMarkerIcon } from './Icons';
import { FoodItem, Restaurant } from '../pages/HomePage';
import { useCart } from '../contexts/CartContext';
import { restaurantApiService, RestaurantListItem } from '../services/restaurantApi';

type ProductDetailModalProps = {
  product: FoodItem;
  onClose: () => void;
};

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [restaurantDetail, setRestaurantDetail] = useState<RestaurantListItem | null>(null);
  const [isLoadingRes, setIsLoadingRes] = useState(false);
  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    
    // Fetch real restaurant data from API
    if (product.restaurantId) {
        fetchRestaurantInfo(parseInt(product.restaurantId, 10));
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose, product.restaurantId]);

  const fetchRestaurantInfo = async (resId: number) => {
      setIsLoadingRes(true);
      try {
          const res = await restaurantApiService.getRestaurantById(resId);
          setRestaurantDetail(res);
      } catch (err) {
          console.error("Failed to fetch restaurant info:", err);
      } finally {
          setIsLoadingRes(false);
      }
  };

  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  // Map API response to UI Restaurant type for cart compatibility
  const getMappedRestaurant = (): Restaurant | null => {
      if (!restaurantDetail) return product.restaurant || null;
      return {
          id: restaurantDetail.id.toString(),
          name: restaurantDetail.name,
          address: restaurantDetail.address,
          lat: 0,
          lon: 0,
          cuisine: 'Ẩm thực',
          phone: restaurantDetail.phone,
          openingHours: restaurantDetail.opening_hours,
          description: restaurantDetail.description,
          bannerUrl: '',
          logoUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448609.png',
          rating: restaurantDetail.rating,
          reviewCount: 0,
          commentCount: 0,
          orderCount: 0,
          reviews: []
      };
  };

  const handleAddToCart = () => {
    const res = getMappedRestaurant();
    if (product && res) {
      addItem(product, quantity, res);
      onClose();
    }
  };

  const handleBuyNow = () => {
    const res = getMappedRestaurant();
    if (product && res) {
      addItem(product, quantity, res, true);
      const cartState = useCart.getState();
      if (res.id === cartState.restaurant?.id || !cartState.restaurant) {
         navigate('/user/checkout');
      }
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >
      <div 
        className="relative bg-white p-6 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-300 z-10 p-2 hover:bg-gray-100 rounded-full"
          aria-label="Close"
        >
          <XIcon className="h-6 w-6" />
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="w-full h-80 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center border shadow-inner">
            {product.image ? (
                <img 
                    className="h-full w-full object-cover" 
                    src={product.image.startsWith('http') ? product.image : `http://localhost:8004/${product.image}`} 
                    alt={product.name} 
                />
            ) : (
                <ImageIcon className="h-24 w-24 text-gray-300" />
            )}
          </div>

          {/* Details Section */}
          <div className="flex flex-col">
            {product.bestseller && (
                <div className="inline-flex items-center bg-yellow-400 text-white text-[10px] font-bold px-3 py-1 rounded-full mb-3 w-fit shadow-sm">
                    <StarIcon className="w-3.5 h-3.5 mr-1.5" />
                    <span>BÁN CHẠY NHẤT</span>
                </div>
            )}
            <h1 id="product-modal-title" className="text-3xl font-extrabold text-gray-900 mb-2 leading-tight">{product.name}</h1>
            
            {/* Restaurant Info From API */}
            <div className="mb-6 border-b pb-5">
                {isLoadingRes ? (
                    <div className="animate-pulse space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                ) : restaurantDetail ? (
                    <div>
                        <Link to={`/user/restaurant/${restaurantDetail.id}`} className="inline-flex items-center font-bold text-orange-600 hover:text-orange-700 hover:underline text-lg">
                            {restaurantDetail.name}
                        </Link>
                        <div className="flex items-center text-xs text-gray-500 mt-1.5 space-x-3">
                            <div className="flex items-center">
                                <StarIcon className="w-3.5 h-3.5 text-yellow-400 mr-1" />
                                <span className="font-bold text-gray-700">{restaurantDetail.rating.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center">
                                <ClockIcon className="w-3.5 h-3.5 mr-1 text-gray-400" />
                                <span>{restaurantDetail.opening_hours}</span>
                            </div>
                        </div>
                        <div className="flex items-start text-xs text-gray-500 mt-2">
                            <LocationMarkerIcon className="w-3.5 h-3.5 mr-1 text-gray-400 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{restaurantDetail.address}</span>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 italic">Thông tin nhà hàng đang được cập nhật...</p>
                )}
            </div>

            <p className="text-gray-600 mb-6 text-sm leading-relaxed">{product.description || 'Không có mô tả cho món ăn này.'}</p>
            
            <div className="mb-8">
                {product.newPrice ? (
                <div className="flex items-baseline gap-3">
                    <p className="text-3xl font-black text-orange-500">{product.newPrice}</p>
                    <p className="text-lg text-gray-400 line-through decoration-red-400">{product.oldPrice}</p>
                </div>
                ) : (
                <p className="text-3xl font-black text-orange-500">{product.price}</p>
                )}
            </div>
            
            <div className="mt-auto space-y-6">
                {/* Quantity Selector */}
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <label className="text-sm font-bold text-gray-700">Chọn số lượng:</label>
                    <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm">
                        <button onClick={handleDecrement} className="p-2 text-gray-500 hover:text-orange-500 transition-colors">
                            <MinusIcon className="h-5 w-5"/>
                        </button>
                        <span className="px-4 font-bold text-lg text-gray-800 w-12 text-center">{quantity}</span>
                         <button onClick={handleIncrement} className="p-2 text-gray-500 hover:text-orange-500 transition-colors">
                            <PlusIcon className="h-5 w-5"/>
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <button 
                        onClick={handleAddToCart} 
                        disabled={isLoadingRes}
                        className="w-full flex justify-center items-center py-3.5 px-4 border-2 border-orange-500 rounded-xl font-bold text-orange-500 bg-white hover:bg-orange-50 transition-all active:scale-95 disabled:opacity-50"
                    >
                        Thêm vào giỏ
                    </button>
                    <button 
                        onClick={handleBuyNow} 
                        disabled={isLoadingRes}
                        className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all active:scale-95 disabled:opacity-50"
                    >
                        Mua ngay
                    </button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
