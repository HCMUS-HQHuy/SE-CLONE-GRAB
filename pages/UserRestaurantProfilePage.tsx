import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { restaurants, foodCategories, FoodItem } from './HomePage';
import { LocationMarkerIcon, PhoneIcon, ClockIcon, StarIcon, ImageIcon } from '../components/Icons';
import ProductDetailModal from '../components/ProductDetailModal';

const FoodCard: React.FC<{ item: FoodItem }> = ({ item }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1">
      <div className="relative w-full h-40 bg-gray-200">
        {item.image ? (
          <img className="h-full w-full object-cover" src={item.image} alt={item.name} />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}
        {item.bestseller && (
          <div className="absolute top-2 right-2 flex items-center bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-full">
              <StarIcon className="w-3 h-3 mr-1" />
              <span>Bán chạy</span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-md font-bold text-gray-800 mb-1 flex-grow">{item.name}</h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.description}</p>
        <div className="mt-auto pt-2">
            {item.newPrice ? (
              <div className="flex items-baseline gap-2">
                <p className="text-lg font-bold text-orange-500">{item.newPrice}</p>
                <p className="text-sm text-gray-400 line-through">{item.oldPrice}</p>
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
  const [selectedProduct, setSelectedProduct] = useState<FoodItem | null>(null);

  const restaurant = useMemo(() => restaurants.find(r => r.id === id), [id]);

  const menuByCategory = useMemo(() => {
    if (!restaurant) return {};

    const restaurantMenuItems = foodCategories
      .flatMap(category => category.items.map(item => ({...item, categoryName: category.name})))
      .filter(item => item.restaurantId === restaurant.id);
      
    return restaurantMenuItems.reduce((acc, item) => {
        const { categoryName } = item;
        if (!acc[categoryName]) {
            acc[categoryName] = [];
        }
        acc[categoryName].push(item);
        return acc;
    }, {} as Record<string, FoodItem[]>);
  }, [restaurant]);

  if (!restaurant) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-gray-800">Không tìm thấy nhà hàng</h1>
        <p className="text-gray-500 mt-2">Nhà hàng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <Link to="/user/home" className="mt-6 inline-block bg-orange-500 text-white font-bold py-2 px-4 rounded hover:bg-orange-600 transition-colors">
            Trở về trang chủ
        </Link>
      </div>
    );
  }

  const handleCardClick = (item: FoodItem) => {
    // We need to pass the full restaurant object to the modal
    setSelectedProduct({ ...item, restaurant });
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="bg-gray-50 pb-12">
      {/* Banner and Header */}
      <div className="relative">
        <div className="h-56 bg-cover bg-center" style={{ backgroundImage: `url(${restaurant.bannerUrl})` }}></div>
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-16 sm:-mt-24">
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative flex-shrink-0">
                <img className="h-28 w-28 rounded-full object-cover border-4 border-white" src={restaurant.logoUrl} alt="Restaurant Logo" />
              </div>
              <div className="flex-grow text-center sm:text-left pt-4">
                <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
                <p className="text-md text-gray-500 mt-1">{restaurant.cuisine}</p>
                <div className="mt-3 text-sm text-gray-600 space-y-2">
                    <div className="flex items-center justify-center sm:justify-start">
                        <LocationMarkerIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                        <span>{restaurant.address}</span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start">
                        <ClockIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                        <span>{restaurant.openingHours}</span>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Menu */}
          <div className="lg:col-span-2 space-y-8">
             {Object.entries(menuByCategory).map(([categoryName, items]) => (
                <div key={categoryName} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="border-b pb-4 mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">{categoryName}</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map(item => (
                            <div key={item.id} onClick={() => handleCardClick(item)}>
                              <FoodCard item={item} />
                            </div>
                        ))}
                    </div>
                </div>
             ))}
          </div>

          {/* Right Column: Details */}
          <div className="space-y-8 lg:sticky lg:top-24">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">Về chúng tôi</h3>
              <p className="text-gray-600 text-sm">{restaurant.description}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">Thông tin liên hệ</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{restaurant.phone}</span>
                </li>
                 <li className="flex items-start">
                  <LocationMarkerIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{restaurant.address}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {selectedProduct && (
        <ProductDetailModal product={selectedProduct} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default UserRestaurantProfilePage;