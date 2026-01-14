
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserIcon, SearchIcon, HeartIcon, ShoppingCartIcon, BellIcon, DocumentTextIcon, MenuIcon, LocationMarkerIcon, PackageIcon, CheckCircleIcon, XCircleIcon, ImageIcon, LogoutIcon } from './Icons';
import { useCart } from '../contexts/CartContext';
import NotificationDropdown from './NotificationDropdown';
import type { Notification } from './NotificationDropdown';
import { restaurants, foodCategories, FoodItem, Restaurant } from '../pages/HomePage';
import { apiService } from '../services/api';


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
  const [searchResults, setSearchResults] = useState<{ dishes: FoodItem[], restaurants: Restaurant[] }>({ dishes: [], restaurants: [] });
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Pre-process food items to include restaurant info for easy searching
  const allFoodItems = useMemo(() => {
      return foodCategories.flatMap(category =>
          category.items.map(item => {
              const restaurant = restaurants.find(r => r.id === item.restaurantId);
              return { ...item, restaurant };
          })
      );
  }, []);

  useEffect(() => {
    const performSearch = () => {
        if (searchQuery.trim().length < 1) {
            setSearchResults({ dishes: [], restaurants: [] });
            return;
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        const foundDishes = allFoodItems.filter(item => item.name.toLowerCase().includes(lowercasedQuery)).slice(0, 4);
        const foundRestaurants = restaurants.filter(r => r.name.toLowerCase().includes(lowercasedQuery)).slice(0, 3);
        setSearchResults({ dishes: foundDishes, restaurants: foundRestaurants });
    };
    const handler = setTimeout(() => { performSearch(); }, 200);
    return () => clearTimeout(handler);
  }, [searchQuery, allFoodItems]);

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

  const handleSearchItemClick = () => {
    setIsSearchFocused(false);
    setSearchQuery('');
  };

  const hasResults = searchResults.dishes.length > 0 || searchResults.restaurants.length > 0;

  const mockUserNotifications: Notification[] = [
    { id: 'user-1', icon: <PackageIcon className="h-5 w-5 text-blue-500" />, title: 'Đơn hàng #12345 đã được xác nhận', description: 'Nhà hàng Quán Ăn Gỗ đang chuẩn bị món ăn của bạn.', time: '2 phút trước', isRead: false, link: '/user/order/12345' },
    { id: 'user-2', icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />, title: 'Giao hàng thành công!', description: 'Đơn hàng #12344 của bạn đã được giao. Hãy đánh giá tài xế nhé!', time: '1 giờ trước', isRead: true },
  ];

  return (
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
                  <div className="hidden sm:block">
                    <span className="text-xs text-gray-500">Giao đến</span>
                    <p className="text-sm font-semibold text-gray-800 line-clamp-1 group-hover:text-orange-500 transition-colors">Chọn địa chỉ...</p>
                  </div>
                </div>
                <div className="h-8 border-l border-gray-300 mx-2"></div>
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="search"
                    className="block w-full bg-transparent py-3 pl-10 pr-4 border-none rounded-r-full leading-5 text-gray-900 placeholder-gray-500 focus:outline-none"
                    placeholder="Tìm Bún bò Huế, Pizza..."
                    type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => setIsSearchFocused(true)}
                  />
                </div>
              </div>
              
              {isSearchFocused && searchQuery.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-30">
                  {hasResults ? (
                    <div>
                      {searchResults.dishes.length > 0 && (
                        <div className="p-4">
                          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Món ăn</h3>
                          <ul className="space-y-2">
                            {searchResults.dishes.map(dish => (
                              <li key={`dish-${dish.id}`}>
                                <Link to={`/user/restaurant/${dish.restaurantId}`} onClick={handleSearchItemClick} className="flex items-center p-2 rounded-md hover:bg-gray-100">
                                  {dish.image ? <img src={dish.image} alt={dish.name} className="h-12 w-12 rounded-md object-cover mr-3"/> : <div className="h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center mr-3"><ImageIcon className="h-6 w-6 text-gray-400"/></div>}
                                  <div className="flex-grow">
                                    <p className="font-semibold text-sm text-gray-800">{dish.name}</p>
                                    <p className="text-xs text-gray-500">{dish.restaurant?.name}</p>
                                  </div>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {searchResults.restaurants.length > 0 && (
                        <div className="p-4 border-t">
                           <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Nhà hàng</h3>
                           <ul className="space-y-2">
                             {searchResults.restaurants.map(restaurant => (
                                <li key={`res-${restaurant.id}`}>
                                  <Link to={`/user/restaurant/${restaurant.id}`} onClick={handleSearchItemClick} className="flex items-center p-2 rounded-md hover:bg-gray-100">
                                    <img src={restaurant.logoUrl} alt={restaurant.name} className="h-12 w-12 rounded-full object-cover mr-3"/>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-sm text-gray-800">{restaurant.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{restaurant.address}</p>
                                    </div>
                                  </Link>
                                </li>
                             ))}
                           </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-sm text-gray-500"><p>Không tìm thấy kết quả cho "{searchQuery}"</p></div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            <Link to="/user/orders" className="p-2 rounded-full text-gray-500 hover:text-orange-500 hover:bg-orange-50 focus:outline-none focus:bg-orange-100 transition" aria-label="Đơn hàng">
              <DocumentTextIcon className="h-6 w-6" />
            </Link>
            <Link to="/user/favorites" className="p-2 rounded-full text-gray-500 hover:text-orange-500 hover:bg-orange-50 focus:outline-none focus:bg-orange-100 transition" aria-label="Yêu thích">
              <HeartIcon className="h-6 w-6" />
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
  );
};

export default Navbar;
