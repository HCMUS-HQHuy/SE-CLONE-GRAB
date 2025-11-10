import React, { useState } from 'react';
import { restaurants, foodCategories } from './HomePage'; // Reusing the data structure
import { FoodItem, Restaurant } from './HomePage';
import { PencilIcon, LocationMarkerIcon, PhoneIcon, ClockIcon, StarIcon, ImageIcon, PlusIcon, UserIcon, ChatAltIcon, ClipboardListIcon } from '../components/Icons';
import AddMenuItemModal from '../components/AddMenuItemModal';

// Mock Data for a specific restaurant - let's assume the logged-in restaurant is "Quán Ăn Gỗ"
const restaurantData: Restaurant = restaurants.find(r => r.name === 'Quán Ăn Gỗ')!;

// Filter food items for this specific restaurant
const restaurantMenuItems = foodCategories
  .flatMap(category => category.items)
  .filter(item => item.restaurantId === restaurantData.id)
  .map(item => ({...item, restaurant: restaurantData})); // Add restaurant object for FoodCard


const FoodCard: React.FC<{ item: FoodItem }> = ({ item }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
      <div className="relative w-full h-32 bg-gray-200">
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
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-sm font-bold text-gray-800 mb-1 flex-grow">{item.name}</h3>
        <div className="mt-auto pt-2">
            {item.newPrice ? (
              <div className="flex items-baseline gap-2">
                <p className="text-md font-bold text-orange-500">{item.newPrice}</p>
                <p className="text-xs text-gray-400 line-through">{item.oldPrice}</p>
              </div>
            ) : (
              <p className="text-md font-bold text-orange-500">{item.price}</p>
            )}
        </div>
      </div>
    </div>
  );


const RestaurantProfilePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<FoodItem | null>(null);

  const handleOpenAddModal = () => {
    setCurrentItem(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (item: FoodItem) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  const handleSaveItem = (itemData: any) => {
    if (currentItem) {
      // In a real app, you'd find and update the item in your global state
      console.log('Updating item:', itemData);
    } else {
      // In a real app, you'd add the new item to your global state
      console.log('Adding new item:', itemData);
    }
    handleCloseModal();
  };

  return (
    <div className="bg-gray-100">
      {/* Banner and Header */}
      <div className="relative">
        <div className="h-56 bg-cover bg-center" style={{ backgroundImage: `url(${restaurantData.bannerUrl})` }}></div>
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-16 sm:-mt-24">
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative flex-shrink-0">
                <img className="h-28 w-28 rounded-full object-cover border-4 border-white" src={restaurantData.logoUrl} alt="Restaurant Logo" />
              </div>
              <div className="flex-grow text-center sm:text-left">
                <h1 className="text-3xl font-bold text-gray-900">{restaurantData.name}</h1>
                <p className="text-md text-gray-500">{restaurantData.cuisine}</p>
              </div>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                <PencilIcon className="h-5 w-5 mr-2 text-gray-400" />
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Menu */}
          <div className="lg:col-span-2 space-y-8">
             <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center border-b pb-4 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Thực đơn nổi bật</h2>
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    <div 
                        onClick={handleOpenAddModal}
                        className="bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center h-full min-h-[210px] cursor-pointer group transition-all duration-300 hover:shadow-lg hover:border-orange-400 hover:bg-orange-50"
                        role="button"
                        aria-label="Thêm món ăn mới"
                    >
                        <div className="text-center text-gray-400 group-hover:text-orange-500 transition-colors">
                            <PlusIcon className="h-10 w-10 mx-auto" />
                            <p className="mt-2 text-sm font-semibold">Thêm món</p>
                        </div>
                    </div>

                    {restaurantMenuItems.slice(0, 5).map(item => (
                        <div key={item.id} onClick={() => handleEditItem(item)}>
                          <FoodCard item={item} />
                        </div>
                    ))}
                 </div>
                 {restaurantMenuItems.length > 5 && (
                    <div className="text-center mt-6">
                        <button className="text-sm font-semibold text-orange-600 hover:text-orange-500">
                            Xem tất cả thực đơn &rarr;
                        </button>
                    </div>
                 )}
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">Thống kê</h3>
                <ul className="space-y-3 text-sm">
                    <li className="flex items-center justify-between">
                        <div className="flex items-center">
                            <StarIcon className="h-5 w-5 text-yellow-400 mr-3 flex-shrink-0" />
                            <span className="text-gray-700">Đánh giá trung bình</span>
                        </div>
                        <span className="font-bold text-gray-800">{restaurantData.rating.toFixed(1)} / 5.0</span>
                    </li>
                    <li className="flex items-center justify-between">
                        <div className="flex items-center">
                            <UserIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                            <span className="text-gray-700">Tổng lượt đánh giá</span>
                        </div>
                        <span className="font-bold text-gray-800">{restaurantData.reviewCount}</span>
                    </li>
                    <li className="flex items-center justify-between">
                        <div className="flex items-center">
                            <ChatAltIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                            <span className="text-gray-700">Tổng bình luận</span>
                        </div>
                        <span className="font-bold text-gray-800">{restaurantData.commentCount}</span>
                    </li>
                    <li className="flex items-center justify-between">
                        <div className="flex items-center">
                            <ClipboardListIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                            <span className="text-gray-700">Tổng đơn hàng</span>
                        </div>
                        <span className="font-bold text-gray-800">{restaurantData.orderCount.toLocaleString()}+</span>
                    </li>
                </ul>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">Về chúng tôi</h3>
              <p className="text-gray-600 text-sm">{restaurantData.description}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">Thông tin chi tiết</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <LocationMarkerIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{restaurantData.address}</span>
                </li>
                <li className="flex items-center">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{restaurantData.phone}</span>
                </li>
                <li className="flex items-center">
                  <ClockIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{restaurantData.openingHours}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <AddMenuItemModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveItem}
        itemToEdit={currentItem}
      />
    </div>
  );
};

export default RestaurantProfilePage;