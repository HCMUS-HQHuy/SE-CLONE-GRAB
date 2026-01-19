
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserIcon, SearchIcon, ShoppingCartIcon, BellIcon, DocumentTextIcon, MenuIcon, LocationMarkerIcon, PackageIcon, CheckCircleIcon, ImageIcon, LogoutIcon } from './Icons';
import { useCart } from '../contexts/CartContext';
import NotificationDropdown from './NotificationDropdown';
import type { Notification } from './NotificationDropdown';
import { apiService } from '../services/api';
import { restaurantApiService, RestaurantListItem, DishResponse } from '../services/restaurantApi';
import ProductDetailModal from './ProductDetailModal';
import { FoodItem } from '../pages/HomePage';

const BASE_IMG_URL = 'http://localhost:8004/';

type NavbarProps = {
  onCartClick: () => void;
};

const Navbar: React.FC<NavbarProps> = ({ onCartClick }) => {
  const { items } = useCart();
  const navigate = useNavigate();
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ dishes: (DishResponse & { restaurantName: string })[], restaurants: RestaurantListItem[] }>({ dishes: [], restaurants: [] });
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<FoodItem | null>(null);
  
  const [sourceRestaurants, setSourceRestaurants] = useState<RestaurantListItem[]>([]);
  const [sourceDishes, setSourceDishes] = useState<DishResponse[]>([]);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        const [resList, dishList] = await Promise.all([
          restaurantApiService.getRestaurants(0, 100, 'ACTIVE'),
          restaurantApiService.getAllDishes({ limit: 500, available_only: true })
        ]);
        setSourceRestaurants(resList);
        setSourceDishes(dishList);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu tìm kiếm:", err);
      }
    };
    fetchSearchData();
  }, []);

  useEffect(() => {
    const performSearch = () => {
        if (searchQuery.trim().length < 1) {
            setSearchResults({ dishes: [], restaurants: [] });
            return;
        }
        const lowercasedQuery = searchQuery.toLowerCase();

        const foundDishes = sourceDishes
            .filter(d => d.name.toLowerCase().includes(lowercasedQuery))
            .slice(0, 5)
            .map(d => ({
              ...d,
              restaurantName: sourceRestaurants.find(r => r.id === d.restaurant_id)?.name || `Nhà hàng #${d.restaurant_id}`
            }));

        const foundRestaurants = sourceRestaurants
            .filter(r => r.name.toLowerCase().includes(lowercasedQuery))
            .slice(0, 3);

        setSearchResults({ dishes: foundDishes, restaurants: foundRestaurants });
    };

    const handler = setTimeout(() => { performSearch(); }, 200);
    return () => clearTimeout(handler);
  }, [searchQuery, sourceDishes, sourceRestaurants]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
            setIsSearchFocused(false);
        }
        if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
            setIsUserMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    apiService.logout('user');
    navigate('/');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim().length > 0) {
        setIsSearchFocused(false);
        navigate(`/user/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const openProductModal = (dish: DishResponse & { restaurantName: string }) => {
    const uiItem: FoodItem = {
        id: dish.id,
        name: dish.name,
        description: dish.description,
        restaurantId: dish.restaurant_id.toString(),
        image: dish.image_url || '',
        isAvailable: dish.is_available,
        bestseller: false,
    };
    // Map giá tiền
    if (dish.discounted_price && parseFloat(dish.discounted_price) > 0) {
        uiItem.oldPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(dish.price)).replace(/\s/g, '');
        uiItem.newPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(dish.discounted_price)).replace(/\s/g, '');
    } else {
        uiItem.price = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(dish.price)).replace(/\s/g, '');
    }

    setSelectedProduct(uiItem);
    setIsSearchFocused(false);
    setSearchQuery('');
  };

  const hasResults = searchResults.dishes.length > 0 || searchResults.restaurants.length > 0;

  const mockUserNotifications: Notification[] = [
    { id: 'user-1', icon: <PackageIcon className="h-5 w-5 text-blue-500" />, title: 'Đơn hàng #12345 đã được xác nhận', description: 'Nhà hàng đang chuẩn bị món ăn của bạn.', time: '2 phút trước', isRead: false, link: '/user/order/12345' },
    { id: 'user-2', icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />, title: 'Giao hàng thành công!', description: 'Đơn hàng #12344 của bạn đã được giao. Hãy đánh giá nhé!', time: '1 giờ trước', isRead: true },
  ];

  return (
    <>
    <header className="bg-white shadow-md sticky top-0 z-20">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          <div className="flex items-center">
            <Link to="/user/home" className="flex-shrink-0 text-2xl font-bold text-orange-500">
              Food<span className="text-gray-800">Delivery</span>
            </Link>
          </div>

          <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-center">
            <div ref={searchContainerRef} className="w-full max-w-3xl relative">
              <div className="flex items-center w-full bg-gray-100 rounded-full border border-gray-200 focus-within:ring-2 focus-within:ring-orange-400 focus-within:border-orange-400 focus-within:bg-white transition-all duration-300">
                <div className="flex items-center pl-4 pr-2 py-1 flex-shrink-0 cursor-pointer group">
                  <LocationMarkerIcon className="h-5 w-5 text-gray-500 mr-2 group-hover:text-orange-500 transition-colors" />
                  <div className="hidden sm:block text-left">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Giao đến</span>
                    <p className="text-xs font-semibold text-gray-800 line-clamp-1 group-hover:text-orange-500 transition-colors">Địa chỉ của tôi</p>
                  </div>
                </div>
                <div className="h-8 border-l border-gray-300 mx-2"></div>
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="search"
                    autoComplete="off"
                    className="block w-full bg-transparent py-3 pl-10 pr-4 border-none rounded-r-full leading-5 text-gray-900 placeholder-gray-500 focus:outline-none"
                    placeholder="Tìm món ăn, trà sữa, quán cơm..."
                    type="search" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    onFocus={() => setIsSearchFocused(true)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>
              
              {isSearchFocused && searchQuery.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-30 animate-in fade-in slide-in-from-top-1">
                  {hasResults ? (
                    <div className="max-h-[70vh] overflow-y-auto">
                      {searchResults.dishes.length > 0 && (
                        <div className="p-4">
                          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">Món ăn gợi ý (Click để đặt)</h3>
                          <ul className="space-y-1">
                            {searchResults.dishes.map(dish => (
                              <li key={`dish-${dish.id}`}>
                                <button 
                                  onClick={() => openProductModal(dish)}
                                  className="w-full text-left flex items-center p-2 rounded-lg hover:bg-orange-50 group transition-colors"
                                >
                                  <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden mr-3 flex-shrink-0 border border-gray-50">
                                    {dish.image_url ? (
                                      <img src={dish.image_url.startsWith('http') ? dish.image_url : `${BASE_IMG_URL}${dish.image_url}`} alt={dish.name} className="h-full w-full object-cover"/>
                                    ) : (
                                      <div className="h-full w-full flex items-center justify-center"><ImageIcon className="h-6 w-6 text-gray-300"/></div>
                                    )}
                                  </div>
                                  <div className="flex-grow min-w-0">
                                    <p className="font-bold text-sm text-gray-800 group-hover:text-orange-600 transition-colors truncate">{dish.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{dish.restaurantName}</p>
                                  </div>
                                  <div className="text-right ml-2">
                                     <p className="text-sm font-black text-orange-500">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(dish.price)).replace(/\s/g, '')}</p>
                                  </div>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {searchResults.restaurants.length > 0 && (
                        <div className="p-4 border-t border-gray-50">
                           <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">Nhà hàng</h3>
                           <ul className="space-y-1">
                             {searchResults.restaurants.map(restaurant => (
                                <li key={`res-${restaurant.id}`}>
                                  <Link to={`/user/restaurant/${restaurant.id}`} onClick={() => setIsSearchFocused(false)} className="flex items-center p-2 rounded-lg hover:bg-orange-50 group transition-colors">
                                    <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mr-3 flex-shrink-0 font-black text-orange-600 border-2 border-white shadow-sm overflow-hidden">
                                        {restaurant.name.charAt(0)}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <p className="font-bold text-sm text-gray-800 group-hover:text-orange-600 transition-colors truncate">{restaurant.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{restaurant.address}</p>
                                    </div>
                                    <div className="ml-2 flex items-center bg-gray-50 px-2 py-1 rounded-md">
                                        <span className="text-xs font-bold text-gray-700">{restaurant.rating.toFixed(1)}</span>
                                        <svg className="w-3 h-3 text-yellow-400 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    </div>
                                  </Link>
                                </li>
                             ))}
                           </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                        <ImageIcon className="h-12 w-12 text-gray-200 mx-auto mb-2"/>
                        <p className="text-sm text-gray-500">Không tìm thấy kết quả cho "<span className="font-bold text-gray-800">{searchQuery}</span>"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            <Link to="/user/orders" className="p-2 rounded-full text-gray-500 hover:text-orange-500 hover:bg-orange-50 focus:outline-none focus:bg-orange-100 transition" aria-label="Đơn hàng">
              <DocumentTextIcon className="h-6 w-6" />
            </Link>
             <button onClick={onCartClick} className="relative p-2 rounded-full text-gray-500 hover:text-orange-500 hover:bg-orange-50 focus:outline-none focus:bg-orange-100 transition" aria-label="Giỏ hàng">
              <ShoppingCartIcon className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center ring-2 ring-white">
                  {cartItemCount}
                </span>
              )}
            </button>
            <div className="relative">
                <button
                    onClick={() => setIsNotificationOpen(prev => !prev)}
                    className="p-2 rounded-full text-gray-500 hover:text-orange-500 hover:bg-orange-50 focus:outline-none focus:bg-orange-100 transition"
                >
                    <BellIcon className="h-6 w-6" />
                    {mockUserNotifications.some(n => !n.isRead) && <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>}
                </button>
                 <NotificationDropdown isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} notifications={mockUserNotifications} />
            </div>
            
            <div className="ml-3 relative" ref={userMenuRef}>
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="bg-gray-100 rounded-full flex items-center justify-center h-10 w-10 text-sm focus:outline-none ring-2 ring-offset-2 hover:ring-orange-500 transition"
              >
                <UserIcon className="h-6 w-6 text-gray-500" />
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-30">
                  <Link to="/user/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Hồ sơ của tôi</Link>
                  <Link to="/user/support" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Hỗ trợ</Link>
                  <hr className="my-1"/>
                  <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    <LogoutIcon className="h-4 w-4 mr-2" /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="md:hidden flex items-center">
             <button className="p-2 rounded-full text-gray-500 hover:text-orange-500 hover:bg-orange-50 focus:outline-none focus:bg-orange-100 transition">
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
    {selectedProduct && (
        <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    )}
    </>
  );
};

export default Navbar;
