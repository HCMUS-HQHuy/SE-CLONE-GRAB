
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { StarIcon, ImageIcon } from '../components/Icons';
import ProductDetailModal from '../components/ProductDetailModal';
import { restaurantApiService, DishResponse } from '../services/restaurantApi';

// Constants
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

// Types
export type Review = {
  id: number;
  author: string;
  avatarUrl: string;
  rating: number;
  comment: string;
  date: string;
};

export type Restaurant = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  cuisine: string;
  phone: string;
  openingHours: string;
  description: string;
  bannerUrl: string;
  logoUrl: string;
  rating: number;
  reviewCount: number;
  commentCount: number;
  orderCount: number;
  reviews: Review[];
};

export type FoodItem = {
  id: number;
  name: string;
  description: string;
  price?: string;
  oldPrice?: string;
  newPrice?: string;
  image: string;
  bestseller: boolean;
  restaurantId: string;
  isAvailable?: boolean;
  restaurant?: Restaurant;
  distance?: number;
};

// Mock restaurants database for UI matching (In production, this would also come from API)
export const restaurants: Restaurant[] = [
  {
    id: '1001',
    name: 'Quán Ăn Gỗ',
    address: '123 Đường Lê Lợi, Quận 1, TP.HCM',
    lat: 10.7756,
    lon: 106.7001,
    cuisine: 'Món Việt',
    phone: '090 123 4567',
    openingHours: '09:00 - 22:00',
    description: 'Quán Ăn Gỗ tự hào mang đến những hương vị đậm đà, chuẩn vị Việt Nam.',
    bannerUrl: 'https://cdn.xanhsm.com/2025/01/e0898853-nha-hang-khu-ngoai-giao-doan-3.jpg',
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448609.png',
    rating: 4.7,
    reviewCount: 258,
    commentCount: 190,
    orderCount: 1200,
    reviews: []
  },
  { 
    id: '1', 
    name: 'Bếp Việt', 
    address: '45 Phạm Ngọc Thạch, Quận 3, TP.HCM', 
    lat: 10.7850, 
    lon: 106.6921, 
    cuisine: 'Món Việt', 
    phone: '091 234 5678', 
    openingHours: '10:00 - 21:00', 
    description: 'Bếp Việt chuyên các món ăn truyền thống.', 
    bannerUrl: 'https://images.unsplash.com/photo-1504754524776-8f4f37790774?auto=format&fit=crop&w=1740&q=80', 
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/4555/4555035.png',
    rating: 4.5,
    reviewCount: 180,
    commentCount: 152,
    orderCount: 980,
    reviews: []
  }
];

// FIX: Exporting foodCategories to resolve build errors in Navbar, UserRestaurantProfilePage, and DashboardPage.
export const foodCategories: { name: string; items: FoodItem[] }[] = [
  {
    name: '🔥 Đại hạ giá',
    items: [
      { id: 1, name: 'Cơm tấm sườn bì chả', description: 'Cơm tấm nóng hổi, sườn nướng đậm đà, bì dai, chả trứng béo ngậy.', oldPrice: '55.000đ', newPrice: '35.000đ', image: 'https://sakos.vn/wp-content/uploads/2024/10/bia-4.jpg', bestseller: true, restaurantId: '1001' },
      { id: 2, name: 'Trà sữa trân châu đường đen', description: 'Hương vị trà sữa truyền thống kết hợp trân châu đường đen dai ngon.', oldPrice: '45.000đ', newPrice: '29.000đ', image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=800&q=80', bestseller: false, restaurantId: '1001' },
      { id: 9, name: 'Bún bò Huế', description: 'Bún bò cay nồng, đậm đà hương vị cố đô.', oldPrice: '50.000đ', newPrice: '40.000đ', image: 'https://i.ytimg.com/vi/A_o2qfaTgKs/maxresdefault.jpg', bestseller: true, restaurantId: '1001' },
    ]
  },
  {
    name: 'Ăn vặt',
    items: [
       { id: 3, name: 'Bánh tráng trộn Sài Gòn', description: 'Đầy đủ topping: xoài, trứng cút, bò khô, rau răm...', price: '25.000đ', image: 'https://cdn.xanhsm.com/2025/01/1b04f701-banh-trang-tron-sai-gon-1.jpg', bestseller: true, restaurantId: '1001' },
    ]
  },
  {
    name: 'Ăn trưa',
    items: [
       { id: 5, name: 'Cá hồi nướng măng tây', description: 'Cá hồi nướng ăn kèm măng tây, món ăn bổ dưỡng và ngon miệng.', price: '120.000đ', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80', bestseller: true, restaurantId: '1001' },
    ]
  },
  {
    name: 'Đồ uống',
    items: [
      { id: 7, name: 'Cà phê sữa đá', description: 'Cà phê robusta đậm đà pha cùng sữa đặc, uống với đá.', price: '25.000đ', image: '', bestseller: true, restaurantId: '1001' },
      { id: 8, name: 'Nước ép cam tươi', description: 'Cam tươi vắt nguyên chất, không đường, tốt cho sức khỏe.', price: '35.000đ', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80', bestseller: false, restaurantId: '1001' },
    ]
  }
];

const FoodCard: React.FC<{ item: FoodItem }> = ({ item }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full transform hover:-translate-y-1 transition-transform duration-300 border border-gray-100">
    <div className="relative w-full h-40 bg-gray-200">
      {item.image ? (
        <img 
            className="h-full w-full object-cover" 
            src={item.image.startsWith('http') || item.image.startsWith('data:') ? item.image : `${BASE_IMG_URL}${item.image}`} 
            alt={item.name} 
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <ImageIcon className="h-16 w-16 text-gray-400" />
        </div>
      )}
      {item.bestseller && (
        <div className="absolute top-2 right-2 flex items-center bg-yellow-400 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
            <StarIcon className="w-3 h-3 mr-1" />
            <span>Bán chạy</span>
        </div>
      )}
    </div>
    <div className="p-4 flex flex-col flex-grow">
      <div className="flex-grow">
        <h3 className="text-md font-bold text-gray-800 mb-1 line-clamp-1">{item.name}</h3>
        {item.restaurant ? (
            <Link 
              to={`/user/restaurant/${item.restaurant.id}`} 
              onClick={(e) => e.stopPropagation()}
              className="text-gray-500 text-xs mb-2 font-semibold hover:text-orange-600 transition-colors block"
            >
                {item.restaurant.name}
            </Link>
        ) : (
            <span className="text-gray-400 text-xs mb-2 block italic">Nhà hàng #{item.restaurantId}</span>
        )}
        <p className="text-gray-600 text-xs mt-1 line-clamp-2">{item.description}</p>
      </div>
      <div className="mt-auto pt-3 flex justify-between items-end">
        <div>
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
  </div>
);


const HomePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiDishes, setApiDishes] = useState<DishResponse[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<FoodItem | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const dishes = await restaurantApiService.getAllDishes({ available_only: true });
        setApiDishes(dishes);
    } catch (err: any) {
        setError(err.message || 'Không thể tải danh sách món ăn.');
    } finally {
        setIsLoading(false);
    }
  };

  const groupedCategories = useMemo(() => {
    const categories: Record<string, FoodItem[]> = {};

    apiDishes.forEach(dish => {
        const catName = ID_TO_CATEGORY_NAME[dish.category_id] || 'Khác';
        
        // Find matching restaurant from mock DB (for better UI)
        const restaurant = restaurants.find(r => r.id === dish.restaurant_id.toString());

        const uiItem: FoodItem = {
            id: dish.id,
            name: dish.name,
            description: dish.description,
            restaurantId: dish.restaurant_id.toString(),
            image: dish.image_url || '',
            isAvailable: dish.is_available,
            bestseller: dish.stock_quantity < 50, // Mock bestseller based on stock
            restaurant: restaurant
        };

        if (dish.discounted_price && parseFloat(dish.discounted_price) > 0) {
            uiItem.oldPrice = formatCurrency(dish.price);
            uiItem.newPrice = formatCurrency(dish.discounted_price);
        } else {
            uiItem.price = formatCurrency(dish.price);
        }

        if (!categories[catName]) categories[catName] = [];
        categories[catName].push(uiItem);
    });

    return Object.entries(categories).map(([name, items]) => ({ name, items }));
  }, [apiDishes]);

  const handleCardClick = (item: FoodItem) => {
    setSelectedProduct(item);
  };

  if (isLoading) {
    return (
      <div className="text-center py-24 px-4 bg-gray-50 min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        <h2 className="text-xl font-semibold text-gray-800 mt-6">Đang tải món ngon...</h2>
        <p className="mt-2 text-gray-500">Chờ chút nhé, thực đơn hấp dẫn đang đến.</p>
      </div>
    );
  }

  if (error) {
    return (
        <div className="text-center py-24 px-4 bg-gray-50 min-h-[80vh]">
             <div className="bg-white p-8 rounded-2xl shadow-sm border max-w-md mx-auto">
                <h2 className="text-xl font-semibold text-red-600">Đã xảy ra lỗi</h2>
                <p className="mt-2 text-gray-600">{error}</p>
                <button onClick={fetchData} className="mt-6 bg-orange-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-600 transition-colors">
                    Thử lại
                </button>
             </div>
        </div>
    );
  }

  return (
    <div className="bg-gray-50 pb-20">
      {/* Banner Section */}
      <div className="relative h-72 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1740&q=80')"}}>
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="text-center px-4">
                  <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-wider mb-4 drop-shadow-lg">
                    Thế giới món ngon trong tầm tay!
                  </h1>
                  <p className="text-white text-lg font-medium opacity-90">Đặt ngay hôm nay, giao tận nơi nóng hổi.</p>
              </div>
          </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="space-y-16">
            {groupedCategories.length > 0 ? (
                groupedCategories.map(category => (
                    <section key={category.name}>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-orange-500 pl-4">{category.name}</h2>
                            <Link to="#" className="text-sm font-semibold text-orange-600 hover:text-orange-700">Xem tất cả &rarr;</Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {category.items.map(item => (
                                <div key={item.id} onClick={() => handleCardClick(item)} className="cursor-pointer">
                                    <FoodCard item={item} />
                                </div>
                            ))}
                        </div>
                    </section>
                ))
            ) : (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                    <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4"/>
                    <h3 className="text-xl font-semibold text-gray-700">Chưa có món ăn nào</h3>
                    <p className="text-gray-500 mt-1">Hệ thống đang cập nhật thực đơn mới.</p>
                </div>
            )}
        </div>
      </div>
      
      {selectedProduct && (
        <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
};

export default HomePage;
