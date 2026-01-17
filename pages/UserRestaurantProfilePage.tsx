
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LocationMarkerIcon, PhoneIcon, ClockIcon, StarIcon, ImageIcon, ClipboardListIcon, ChatAltIcon, ChevronLeftIcon } from '../components/Icons';
import ProductDetailModal from '../components/ProductDetailModal';
import { restaurantApiService, RestaurantListItem, DishResponse } from '../services/restaurantApi';
import { FoodItem, Restaurant, Review } from './HomePage';

const BASE_IMG_URL = 'http://localhost:8004/';

const ID_TO_CATEGORY_NAME: Record<number, string> = {
    1: '🔥 Đại hạ giá',
    2: 'Ăn vặt',
    3: 'Ăn trưa',
    4: 'Đồ uống'
};

const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num).replace(/\s/g, '');
};

const FoodCard: React.FC<{ item: FoodItem; onClick: () => void }> = ({ item, onClick }) => (
    <div 
        onClick={onClick}
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1"
    >
      <div className="relative w-full h-40 bg-gray-200">
        {item.image ? (
          <img 
            className={`h-full w-full object-cover ${!item.isAvailable ? 'grayscale opacity-60' : ''}`} 
            src={item.image.startsWith('http') || item.image.startsWith('data:') ? item.image : `${BASE_IMG_URL}${item.image}`} 
            alt={item.name} 
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}
        {!item.isAvailable && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">Hết hàng</span>
             </div>
        )}
        {item.bestseller && (
          <div className="absolute top-2 right-2 flex items-center bg-yellow-400 text-white text-[10px] font-bold px-2 py-1 rounded-full">
              <StarIcon className="w-3 h-3 mr-1" />
              <span>Bán chạy</span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-md font-bold text-gray-800 mb-1 flex-grow line-clamp-2">{item.name}</h3>
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 h-8">{item.description || 'Không có mô tả.'}</p>
        <div className="mt-auto pt-2">
            {item.newPrice ? (
              <div className="flex items-baseline gap-2">
                <p className="text-lg font-bold text-orange-500">{item.newPrice}</p>
                <p className="text-xs text-gray-400 line-through">{item.oldPrice}</p>
              </div>
            ) : (
              <p className="text-lg font-bold text-orange-500">{item.price}</p>
            )}
        </div>
      </div>
    </div>
  );


const UserRestaurantProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [restaurantData, setRestaurantData] = useState<RestaurantListItem | null>(null);
  const [dishes, setDishes] = useState<DishResponse[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<FoodItem | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (id) {
        fetchRestaurantDetails(parseInt(id, 10));
    }
  }, [id]);

  const fetchRestaurantDetails = async (resId: number) => {
    setIsLoading(true);
    setError(null);
    try {
        const [resInfo, resDishes] = await Promise.all([
            restaurantApiService.getRestaurantById(resId),
            restaurantApiService.getDishes(resId)
        ]);
        setRestaurantData(resInfo);
        setDishes(resDishes);
        
        // Mock reviews since API doesn't provide them yet
        setReviews([
            { id: 1, author: 'Minh Quân', avatarUrl: 'https://i.pravatar.cc/150?u=1', rating: 5, comment: 'Đồ ăn rất ngon, giao hàng đúng hẹn!', date: '12/01/2026' },
            { id: 2, author: 'Thu Hà', avatarUrl: 'https://i.pravatar.cc/150?u=2', rating: 4, comment: 'Vị đậm đà, đóng gói cẩn thận.', date: '15/01/2026' }
        ]);
    } catch (err: any) {
        setError(err.message || 'Không thể tải thông tin nhà hàng.');
    } finally {
        setIsLoading(false);
    }
  };

  const menuByCategory = useMemo(() => {
    const grouped: Record<string, FoodItem[]> = {};
    
    dishes.forEach(dish => {
        const catName = ID_TO_CATEGORY_NAME[dish.category_id] || 'Món khác';
        
        const uiItem: FoodItem = {
            id: dish.id,
            name: dish.name,
            description: dish.description,
            restaurantId: id || '',
            image: dish.image_url || '',
            isAvailable: dish.is_available,
            bestseller: false, // Default
        };

        if (dish.discounted_price && parseFloat(dish.discounted_price) > 0) {
            uiItem.oldPrice = formatCurrency(dish.price);
            uiItem.newPrice = formatCurrency(dish.discounted_price);
        } else {
            uiItem.price = formatCurrency(dish.price);
        }

        if (!grouped[catName]) grouped[catName] = [];
        grouped[catName].push(uiItem);
    });

    return grouped;
  }, [dishes, id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-gray-500 font-medium">Đang tải thông tin nhà hàng...</p>
      </div>
    );
  }

  if (error || !restaurantData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 text-center">
        <div className="bg-white p-10 rounded-2xl shadow-lg border max-w-md">
            <ImageIcon className="h-20 w-20 text-orange-200 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">Không tìm thấy nhà hàng</h1>
            <p className="text-gray-500 mt-2">{error || 'Vui lòng kiểm tra lại đường dẫn hoặc thử lại sau.'}</p>
            <Link to="/user/home" className="mt-8 inline-block bg-orange-500 text-white font-bold py-2.5 px-8 rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-100">
                Trở về trang chủ
            </Link>
        </div>
      </div>
    );
  }

  // Chuyển đổi dữ liệu API sang kiểu Restaurant của UI
  const displayRestaurant: Restaurant = {
      id: restaurantData.id.toString(),
      name: restaurantData.name,
      address: restaurantData.address,
      lat: 0,
      lon: 0,
      cuisine: 'Ẩm thực',
      phone: restaurantData.phone,
      openingHours: restaurantData.opening_hours,
      description: restaurantData.description,
      bannerUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80',
      logoUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448609.png',
      rating: restaurantData.rating,
      reviewCount: 150, // Mock
      commentCount: 80, // Mock
      orderCount: 1000, // Mock
      reviews: []
  };

  const handleCardClick = (item: FoodItem) => {
    setSelectedProduct({ ...item, restaurant: displayRestaurant });
  };

  return (
    <div className="bg-gray-50 pb-20">
      {/* Banner and Header */}
      <div className="relative h-64 bg-gray-300">
        <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: `url(${displayRestaurant.bannerUrl})` }}
        ></div>
        <div className="absolute inset-0 bg-black/40"></div>
        <Link to="/user/home" className="absolute top-6 left-6 flex items-center text-white font-bold bg-black/20 hover:bg-black/40 px-4 py-2 rounded-full backdrop-blur-md transition-all">
            <ChevronLeftIcon className="h-5 w-5 mr-1" />
            Quay lại
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-20">
           {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8 border border-white">
            <div className="relative flex-shrink-0">
              <div className="h-32 w-32 rounded-3xl bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                <img className="h-full w-full object-cover" src={displayRestaurant.logoUrl} alt="Logo" />
              </div>
              {!restaurantData.is_open && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                      Đang đóng cửa
                  </div>
              )}
            </div>
            <div className="flex-grow text-center sm:text-left pt-2">
              <h1 className="text-3xl font-black text-gray-900 leading-tight">{restaurantData.name}</h1>
              <div className="flex items-center justify-center sm:justify-start flex-wrap gap-x-6 gap-y-2 mt-4 text-sm font-medium text-gray-600">
                  <div className="flex items-center">
                      <StarIcon className="w-5 h-5 text-yellow-400 mr-1.5" />
                      <span className="text-gray-900 font-bold">{restaurantData.rating.toFixed(1)}</span>
                      <span className="ml-1 text-gray-400 font-normal">({displayRestaurant.reviewCount}+ đánh giá)</span>
                  </div>
                  <div className="flex items-center">
                      <ClipboardListIcon className="w-5 h-5 text-gray-400 mr-1.5" />
                      <span>{displayRestaurant.orderCount.toLocaleString()}+ đơn hàng</span>
                  </div>
                  <div className="flex items-center">
                      <ChatAltIcon className="w-5 h-5 text-gray-400 mr-1.5" />
                      <span>{displayRestaurant.commentCount} bình luận</span>
                  </div>
              </div>
              <div className="mt-4 flex flex-col space-y-2 text-sm text-gray-500">
                  <div className="flex items-start justify-center sm:justify-start">
                      <LocationMarkerIcon className="h-4 w-4 text-orange-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{restaurantData.address}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start">
                      <ClockIcon className="h-4 w-4 text-orange-500 mr-2 flex-shrink-0" />
                      <span>Mở cửa: {restaurantData.opening_hours}</span>
                  </div>
              </div>
            </div>
          </div>

          {/* Grid Content */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Column: Menu */}
            <div className="lg:col-span-2 space-y-10">
              {Object.keys(menuByCategory).length > 0 ? (
                  Object.entries(menuByCategory).map(([categoryName, items]) => (
                      <div key={categoryName} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                          <div className="flex items-center space-x-3 mb-8">
                              <div className="h-8 w-1.5 bg-orange-500 rounded-full"></div>
                              <h2 className="text-2xl font-black text-gray-800 tracking-tight">{categoryName}</h2>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                              {items.map(item => (
                                <FoodCard key={item.id} item={item} onClick={() => handleCardClick(item)} />
                              ))}
                          </div>
                      </div>
                  ))
              ) : (
                  <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-200 text-center">
                      <ClipboardListIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-700">Chưa có thực đơn</h3>
                      <p className="text-gray-500 mt-1">Nhà hàng hiện chưa cập nhật món ăn nào.</p>
                  </div>
              )}
            </div>

            {/* Right Column: Details */}
            <div className="space-y-8 lg:sticky lg:top-24 h-fit">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-50 pb-3 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span> Giới thiệu quán
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed italic">
                    "{restaurantData.description || 'Quán ăn sạch sẽ, phục vụ tận tình, hương vị đậm đà truyền thống.'}"
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-50 pb-3 mb-4 flex items-center">
                     <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span> Đánh giá ({reviews.length})
                </h3>
                <ul className="space-y-6">
                    {reviews.map(review => (
                        <li key={review.id} className="flex items-start space-x-4">
                        <img className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-50" src={review.avatarUrl} alt={review.author} />
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <p className="text-sm font-bold text-gray-800">{review.author}</p>
                                <span className="text-[10px] text-gray-400 font-medium uppercase">{review.date}</span>
                            </div>
                            <div className="flex items-center mt-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <StarIcon key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-200'}`} />
                                ))}
                            </div>
                            <p className="text-sm text-gray-600 mt-2 leading-relaxed">"{review.comment}"</p>
                        </div>
                        </li>
                    ))}
                </ul>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-50 pb-3 mb-4">Liên hệ</h3>
                <ul className="space-y-4 text-sm">
                  <li className="flex items-center">
                    <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center mr-3 flex-shrink-0">
                        <PhoneIcon className="h-4 w-4 text-orange-500" />
                    </div>
                    <span className="text-gray-700 font-bold">{restaurantData.phone}</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center mr-3 flex-shrink-0">
                        <LocationMarkerIcon className="h-4 w-4 text-orange-500" />
                    </div>
                    <span className="text-gray-700 leading-snug">{restaurantData.address}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {selectedProduct && (
        <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
};

export default UserRestaurantProfilePage;
