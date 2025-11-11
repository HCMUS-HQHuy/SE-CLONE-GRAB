import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StarIcon, ImageIcon, ArrowRightIcon } from '../components/Icons';
import ProductDetailModal from '../components/ProductDetailModal';

// FIX: Export Restaurant type for use in other components.
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
  isAvailable?: boolean; // Added for menu management
  // These are added dynamically
  restaurant?: Restaurant;
  distance?: number;
};

// FIX: Export restaurants data for use in other components.
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
    description: 'Quán Ăn Gỗ tự hào mang đến những hương vị đậm đà, chuẩn vị Việt Nam. Với không gian ấm cúng và thực đơn đa dạng, chúng tôi là điểm đến lý tưởng cho những bữa ăn gia đình và gặp gỡ bạn bè.',
    bannerUrl: 'https://cdn.xanhsm.com/2025/01/e0898853-nha-hang-khu-ngoai-giao-doan-3.jpg',
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448609.png',
    rating: 4.7,
    reviewCount: 258,
    commentCount: 190,
    orderCount: 1200,
    reviews: [
      { id: 1, author: 'Hương Tràm', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', rating: 5, comment: 'Đồ ăn rất ngon, đặc biệt là món cơm tấm. Sẽ quay lại ủng hộ quán!', date: '2 ngày trước' },
      { id: 2, author: 'Minh Tuấn', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705d', rating: 4, comment: 'Không gian ấm cúng, phục vụ nhanh nhẹn. Giá cả hợp lý.', date: '1 tuần trước' },
    ]
  },
  { 
    id: '1002', 
    name: 'Bếp Việt', 
    address: '45 Phạm Ngọc Thạch, Quận 3, TP.HCM', 
    lat: 10.7850, 
    lon: 106.6921, 
    cuisine: 'Món Việt', 
    phone: '091 234 5678', 
    openingHours: '10:00 - 21:00', 
    description: 'Bếp Việt chuyên các món ăn truyền thống, gợi nhớ hương vị quê nhà trong từng món ăn.', 
    bannerUrl: 'https://images.unsplash.com/photo-1504754524776-8f4f37790774?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80', 
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/4555/4555035.png',
    rating: 4.5,
    reviewCount: 180,
    commentCount: 152,
    orderCount: 980,
    reviews: [
        { id: 1, author: 'Thanh Hằng', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026706d', rating: 5, comment: 'Món bún chả ở đây ngon tuyệt vời, chuẩn vị Hà Nội. Rất đáng thử.', date: 'Hôm qua' },
        { id: 2, author: 'Quốc Bảo', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026707d', rating: 4, comment: 'Phục vụ hơi chậm vào giờ cao điểm, nhưng đồ ăn ngon nên vẫn chấp nhận được.', date: '3 ngày trước' },
    ]
  },
  { 
    id: '1003', 
    name: 'Phở Ngon 3 Miền', 
    address: '212 Nguyễn Trãi, Quận 5, TP.HCM', 
    lat: 10.7545, 
    lon: 106.6696, 
    cuisine: 'Phở & Bún', 
    phone: '092 345 6789', 
    openingHours: '06:00 - 22:00', 
    description: 'Thưởng thức tô phở nóng hổi, chuẩn vị 3 miền Bắc, Trung, Nam tại Phở Ngon.', 
    bannerUrl: 'https://images.unsplash.com/photo-1569429453484-a245f09978b7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80', 
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/5856/5856424.png',
    rating: 4.8,
    reviewCount: 520,
    commentCount: 450,
    orderCount: 2500,
    reviews: [
        { id: 1, author: 'Gia đình Bún Phở', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026708d', rating: 5, comment: 'Phở ở đây là số một! Nước lèo trong, ngọt thanh, thịt bò mềm. Sẽ ghé quán thường xuyên.', date: '5 ngày trước' },
    ]
  },
  { 
    id: '1004', 
    name: 'Ốc Đảo', 
    address: '88 Nguyễn Thị Thập, Quận 7, TP.HCM', 
    lat: 10.7391, 
    lon: 106.7180, 
    cuisine: 'Hải sản', 
    phone: '093 456 7890', 
    openingHours: '16:00 - 23:00', 
    description: 'Thiên đường hải sản tươi sống với đủ loại ốc, sò, cua, ghẹ chế biến theo yêu cầu.', 
    bannerUrl: 'https://images.unsplash.com/photo-1563723876356-c87a5585044d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80', 
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/701/701963.png',
    rating: 4.6,
    reviewCount: 312,
    commentCount: 280,
    orderCount: 1500,
    reviews: []
  },
  { 
    id: '1005', 
    name: 'Lẩu & Nướng BBQ', 
    address: '300 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM', 
    lat: 10.8015, 
    lon: 106.7150, 
    cuisine: 'Lẩu & Nướng', 
    phone: '094 567 8901', 
    openingHours: '11:00 - 23:00', 
    description: 'Buffet lẩu nướng không giới hạn với hàng trăm món nhúng và nướng hảo hạng.', 
    bannerUrl: 'https://images.unsplash.com/photo-1629566236239-a9a304655325?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80', 
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/2515/2515220.png',
    rating: 4.4,
    reviewCount: 450,
    commentCount: 410,
    orderCount: 1800,
    reviews: [
        { id: 1, author: 'Anh Dũng', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026709d', rating: 4, comment: 'Đồ ăn đa dạng, tươi ngon. Tuy nhiên quán hơi đông nên ồn ào.', date: '2 tuần trước' },
        { id: 2, author: 'Chị Mai', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026710d', rating: 5, comment: 'Giá buffet hợp lý, chất lượng đồ ăn tốt. Nhân viên thân thiện, nhiệt tình. Rất thích hợp đi ăn cùng nhóm bạn.', date: '1 tháng trước' },
    ]
  },
];

// FIX: Export foodCategories to resolve import error in other components.
export const foodCategories: { name: string; items: Omit<FoodItem, 'distance' | 'restaurant'>[] }[] = [
  {
    name: '🔥 Đại hạ giá',
    items: [
      { id: 1, name: 'Cơm tấm sườn bì chả', description: 'Cơm tấm nóng hổi, sườn nướng đậm đà, bì dai, chả trứng béo ngậy.', oldPrice: '55.000đ', newPrice: '35.000đ', image: 'https://sakos.vn/wp-content/uploads/2024/10/bia-4.jpg', bestseller: true, restaurantId: '1001', isAvailable: true },
      { id: 2, name: 'Trà sữa trân châu đường đen', description: 'Hương vị trà sữa truyền thống kết hợp trân châu đường đen dai ngon.', oldPrice: '45.000đ', newPrice: '29.000đ', image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', bestseller: false, restaurantId: '1002', isAvailable: true },
      { id: 9, name: 'Bún bò Huế', description: 'Bún bò cay nồng, đậm đà hương vị cố đô.', oldPrice: '50.000đ', newPrice: '40.000đ', image: 'https://i.ytimg.com/vi/A_o2qfaTgKs/maxresdefault.jpg', bestseller: true, restaurantId: '1003', isAvailable: true },
      { id: 10, name: 'Combo Gà Rán', description: '2 miếng gà giòn tan, khoai tây chiên và nước ngọt.', oldPrice: '85.000đ', newPrice: '69.000đ', image: 'https://images.unsplash.com/photo-1562967914-608f82629710?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', bestseller: false, restaurantId: '1005', isAvailable: true },
      { id: 17, name: 'Cá hồi nướng măng tây', description: 'Cá hồi nướng ăn kèm măng tây, món ăn bổ dưỡng và ngon miệng.', oldPrice: '135.000đ', newPrice: '120.000đ', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', bestseller: true, restaurantId: '1004', isAvailable: true },
      { id: 18, name: 'Pizza Hải Sản', description: 'Pizza đế mỏng giòn với hải sản tươi ngon và phô mai.', oldPrice: '150.000đ', newPrice: '119.000đ', image: '', bestseller: false, restaurantId: '1001', isAvailable: true },
      { id: 19, name: 'Lẩu Thái Tom Yum', description: 'Lẩu thái chua cay đậm đà với hải sản, nấm và rau.', oldPrice: '250.000đ', newPrice: '199.000đ', image: '', bestseller: true, restaurantId: '1005', isAvailable: true },
    ]
  },
  {
    name: 'Ăn vặt',
    items: [
       { id: 3, name: 'Bánh tráng trộn Sài Gòn', description: 'Đầy đủ topping: xoài, trứng cút, bò khô, rau răm...', price: '25.000đ', image: 'https://cdn.xanhsm.com/2025/01/1b04f701-banh-trang-tron-sai-gon-1.jpg', bestseller: true, restaurantId: '1002', isAvailable: true },
       { id: 4, name: 'Gỏi cuốn tôm thịt', description: 'Tôm, thịt, bún, rau sống tươi ngon cuốn trong bánh tráng.', price: '30.000đ', image: 'https://cdn.tgdd.vn/2021/08/CookRecipe/Avatar/goi-cuon-tom-thit-thumbnail-1.jpg', bestseller: false, restaurantId: '1003', isAvailable: true },
       { id: 11, name: 'Nem chua rán', description: 'Nem chua rán nóng giòn, chấm cùng tương ớt cay cay.', price: '30.000đ', image: '', bestseller: true, restaurantId: '1001', isAvailable: true },
       { id: 12, name: 'Chè khúc bạch', description: 'Chè thanh mát với khúc bạch phô mai, nhãn và hạnh nhân.', price: '35.000đ', image: '', bestseller: false, restaurantId: '1004', isAvailable: true },
    ]
  },
  {
    name: 'Ăn trưa',
    items: [
       { id: 5, name: 'Cá hồi nướng măng tây', description: 'Cá hồi nướng ăn kèm măng tây, món ăn bổ dưỡng và ngon miệng.', price: '120.000đ', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib.rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', bestseller: true, restaurantId: '1004', isAvailable: true },
       { id: 6, name: 'Phở bò tái lăn', description: 'Phở bò truyền thống với thịt bò được xào tái thơm ngon.', price: '45.000đ', image: '', bestseller: false, restaurantId: '1003', isAvailable: true },
       { id: 13, name: 'Bún chả Hà Nội', description: 'Thịt nướng thơm lừng ăn kèm bún và nước mắm chua ngọt.', price: '40.000đ', image: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?ixlib.rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', bestseller: true, restaurantId: '1002', isAvailable: true },
       { id: 14, name: 'Miến xào lòng gà', description: 'Miến dong dai ngon xào cùng lòng gà và rau củ.', price: '35.000đ', image: '', bestseller: false, restaurantId: '1001', isAvailable: true },
    ]
  },
  {
    name: 'Đồ uống',
    items: [
      { id: 7, name: 'Cà phê sữa đá', description: 'Cà phê robusta đậm đà pha cùng sữa đặc, uống với đá.', price: '25.000đ', image: '', bestseller: true, restaurantId: '1002', isAvailable: true },
      { id: 8, name: 'Nước ép cam tươi', description: 'Cam tươi vắt nguyên chất, không đường, tốt cho sức khỏe.', price: '35.000đ', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?ixlib.rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', bestseller: false, restaurantId: '1001', isAvailable: true },
      { id: 15, name: 'Sinh tố bơ', description: 'Bơ sáp xay mịn cùng sữa tươi, béo ngậy và bổ dưỡng.', price: '40.000đ', image: '', bestseller: false, restaurantId: '1005', isAvailable: true },
      { id: 16, name: 'Trà đào cam sả', description: 'Thức uống giải nhiệt sảng khoái từ trà, đào, cam và sả.', price: '45.000đ', image: '', bestseller: true, restaurantId: '1003', isAvailable: true },
    ]
  }
];

const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

const FoodCard: React.FC<{ item: FoodItem }> = ({ item }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full transform hover:-translate-y-1 transition-transform duration-300">
    <div className="relative w-full h-40 bg-gray-200">
      {item.image ? (
        <img className="h-full w-full object-cover" src={item.image} alt={item.name} />
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <ImageIcon className="h-16 w-16 text-gray-400" />
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
      <div className="flex-grow">
        <h3 className="text-md font-bold text-gray-800 mb-1">{item.name}</h3>
        {item.restaurant && (
            <Link 
              to={`/user/restaurant/${item.restaurant.id}`} 
              onClick={(e) => e.stopPropagation()}
              className="text-gray-500 text-sm mb-2 font-semibold hover:text-orange-600 hover:underline transition-colors"
            >
                {item.restaurant.name}
            </Link>
        )}
        <p className="text-gray-600 text-sm mt-1">{item.description}</p>
      </div>
      <div className="mt-auto pt-3 flex justify-between items-end">
        <div>
          {item.newPrice ? (
            <div className="flex items-baseline gap-2">
              <p className="text-lg font-bold text-orange-500">{item.newPrice}</p>
              <p className="text-sm text-gray-400 line-through">{item.oldPrice}</p>
            </div>
          ) : (
            <p className="text-lg font-bold text-orange-500">{item.price}</p>
          )}
        </div>
        {item.distance !== undefined && (
          <p className="text-sm text-gray-500">{item.distance.toFixed(1)} km</p>
        )}
      </div>
    </div>
  </div>
);


const HomePage: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [filteredCategories, setFilteredCategories] = useState<typeof foodCategories>([]);
  const [selectedProduct, setSelectedProduct] = useState<FoodItem | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setLocationError(null);
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setLocationError("Bạn đã từ chối yêu cầu truy cập vị trí. Vui lòng bật trong cài đặt trình duyệt để tìm các nhà hàng gần đó.");
              break;
            case error.POSITION_UNAVAILABLE:
              setLocationError("Thông tin vị trí không có sẵn.");
              break;
            case error.TIMEOUT:
              setLocationError("Yêu cầu lấy vị trí người dùng đã hết thời gian.");
              break;
            default:
              setLocationError("Đã xảy ra lỗi không xác định khi lấy vị trí.");
              break;
          }
        }
      );
    } else {
      setLocationError("Trình duyệt của bạn không hỗ trợ định vị địa lý.");
    }
  }, []);

  useEffect(() => {
    if (userLocation) {
      const allItems: FoodItem[] = foodCategories.flatMap(category =>
        category.items.map(item => {
          const restaurant = restaurants.find(r => r.id === item.restaurantId)!;
          const distance = getDistanceFromLatLonInKm(
            userLocation.lat,
            userLocation.lon,
            restaurant.lat,
            restaurant.lon
          );
          return { ...item, restaurant, distance };
        })
      );

      const nearbyItems = allItems
        .filter(item => item.distance! <= 10)
        .sort((a, b) => a.distance! - b.distance!);

      const newFilteredCategories = foodCategories.map(category => ({
        ...category,
        items: nearbyItems.filter(item => 
          foodCategories.find(c => c.name === category.name)?.items.some(originalItem => originalItem.id === item.id)
        )
      })).filter(category => category.items.length > 0);

      setFilteredCategories(newFilteredCategories);
    } else {
       // If no location, show all items without distance
      const allItemsWithRestaurant: FoodItem[] = foodCategories.flatMap(category =>
        category.items.map(item => {
          const restaurant = restaurants.find(r => r.id === item.restaurantId)!;
          return { ...item, restaurant };
        })
      );
       const categoriesWithAllItems = foodCategories.map(category => ({
        ...category,
        items: allItemsWithRestaurant.filter(item => 
          foodCategories.find(c => c.name === category.name)?.items.some(originalItem => originalItem.id === item.id)
        )
      }));
      setFilteredCategories(categoriesWithAllItems);
    }
  }, [userLocation]);
  
  const handleCardClick = (item: FoodItem) => {
    setSelectedProduct(item);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };
  
  const renderContent = () => {
    if (locationError) {
      // Still show all items even if location fails
      console.warn(locationError);
    }
  
    if (!userLocation && !locationError) {
      return (
        <div className="text-center py-20 px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <h2 className="text-xl font-semibold text-gray-800 mt-4">Đang tìm nhà hàng gần bạn...</h2>
          <p className="mt-2 text-gray-600">Vui lòng cho phép truy cập vị trí của bạn.</p>
        </div>
      );
    }
  
    if (userLocation && filteredCategories.length === 0) {
       return (
          <div className="text-center py-20 px-4">
              <h2 className="text-xl font-semibold text-gray-800">Không tìm thấy nhà hàng nào gần bạn</h2>
              <p className="mt-2 text-gray-600">Rất tiếc, chúng tôi không tìm thấy nhà hàng nào trong phạm vi 10km.</p>
          </div>
       );
    }

    return (
      <div className="space-y-12">
        {filteredCategories.map(category => (
            <section key={category.name}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{category.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {category.items.map(item => (
                  <div key={item.id} onClick={() => handleCardClick(item)} className="cursor-pointer">
                    <FoodCard item={item} />
                  </div>
                ))}
              </div>
            </section>
          )
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Banner Section */}
      <div className="relative h-64 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80')"}}>
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <h1 className="text-4xl font-extrabold text-white tracking-wider text-center px-4">
                Tìm món ngon gần bạn!
              </h1>
          </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </div>
      
      {selectedProduct && (
        <ProductDetailModal product={selectedProduct} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default HomePage;