
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserIcon, SearchIcon, ShoppingCartIcon, BellIcon, DocumentTextIcon, MenuIcon, PackageIcon, CheckCircleIcon, ImageIcon, LogoutIcon } from './Icons';
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
            <Link to="/user/home" className="flex-shrink-0 text-2xl font-black text-orange-500 tracking-tighter">
              Food<span className="text-gray-800">Delivery</span>
            </Link>
          </div>

          <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-center">
            <div ref={searchContainerRef} className="w-full max-w-3xl relative">
              <div className="flex items-center w-full bg-gray-100 rounded-full border border-gray-200 focus-within:ring-2 focus-within:ring-orange-400 focus-within:border-orange-400 focus-within:bg-white transition-all duration-300">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="search"
                    autoComplete="off"
                    className="block w-full bg-transparent py-3.5 pl-12 pr-4 border-none rounded-full leading-5 text-gray-900 placeholder-gray-500 focus:outline-none font-medium text-sm"
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
                <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-30 animate-in fade-in slide-in-from-top-1">
                  {hasResults ? (
                    <div className="max-h-[70vh] overflow-y-auto">
                      {searchResults.dishes.length > 0 && (
                        <div className="p-5">
                          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">Món ăn gợi ý</h3>
                          <ul className="space-y-1">
                            {searchResults.dishes.map(dish => (
                              <li key={`dish-${dish.id}`}>
                                <button 
                                  onClick={() => openProductModal(dish)}
                                  className="w-full text-left flex items-center p-3 rounded-xl hover:bg-orange-50 group transition-colors"
                                >
                                  <div className="h-12 w-12 rounded-xl bg-gray-100 overflow-hidden mr-4 flex-shrink-0 border border-gray-50 shadow-inner">
                                    {dish.image_url ? (
                                      <img src={dish.image_url.startsWith('http') ? dish.image_url : `${BASE_IMG_URL}${dish.image_url}`} alt={dish.name} className="h-full w-full object-cover"/>
                                    ) : (
                                      <div className="h-full w-full flex items-center justify-center"><ImageIcon className="h-6 w-6 text-gray-300"/></div>
                                    )}
                                  </div>
                                  <div className="flex-grow min-w-0">
                                    <p className="font-black text-sm text-gray-800 group-hover:text-orange-600 transition-colors truncate">{dish.name}</p>
                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tight mt-0.5">{dish.restaurantName}</p>
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
                        <div className="p-5 border-t border-gray-50 bg-gray-50/30">
                           <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">Nhà hàng đối tác</h3>
                           <ul className="space-y-1">
                             {searchResults.restaurants.map(restaurant => (
                                <li key={`res-${restaurant.id}`}>
                                  <Link to={`/user/restaurant/${restaurant.id}`} onClick={() => setIsSearchFocused(false)} className="flex items-center p-3 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 group transition-all">
                                    <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center mr-4 flex-shrink-0 font-black text-orange-600 border-2 border-white shadow-sm">
                                        {restaurant.name.charAt(0)}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <p className="font-black text-sm text-gray-800 group-hover:text-orange-600 transition-colors truncate">{restaurant.name}</p>
                                        <p className="text-xs text-gray-500 truncate mt-0.5 font-medium">{restaurant.address}</p>
                                    </div>
                                    <div className="ml-3 flex items-center bg-white px-2.5 py-1 rounded-full shadow-sm border border-gray-50">
                                        <span className="text-[11px] font-black text-gray-700">{restaurant.rating.toFixed(1)}</span>
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
                    <div className="p-10 text-center">
                        <ImageIcon className="h-16 w-16 text-gray-100 mx-auto mb-3"/>
                        <p className="text-sm text-gray-400 font-medium">Không tìm thấy món ăn "<span className="font-black text-gray-800">{searchQuery}</span>"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <Link to="/user/orders" className="p-2.5 rounded-full text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all" aria-label="Đơn hàng">
              <DocumentTextIcon className="h-6 w-6" />
            </Link>
             <button onClick={onCartClick} className="relative p-2.5 rounded-full text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all" aria-label="Giỏ hàng">
              <ShoppingCartIcon className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="absolute top-1 right-1 block h-5 w-5 rounded-full bg-orange-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white">
                  {cartItemCount}
                </span>
              )}
            </button>
            <div className="relative">
                <button
                    onClick={() => setIsNotificationOpen(prev => !prev)}
                    className="p-2.5 rounded-full text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all"
                >
                    <BellIcon className="h-6 w-6" />
                    {mockUserNotifications.some(n => !n.isRead) && <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>}
                </button>
                 <NotificationDropdown isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} notifications={mockUserNotifications} />
            </div>
            
            <div className="ml-3 relative" ref={userMenuRef}>
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="bg-gray-100 rounded-2xl flex items-center justify-center h-11 w-11 text-sm focus:outline-none ring-2 ring-transparent hover:ring-orange-200 transition-all"
              >
                <UserIcon className="h-6 w-6 text-gray-500" />
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl py-2 ring-1 ring-black/5 z-30 border border-gray-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-50 mb-1">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Tài khoản</p>
                  </div>
                  <Link to="/user/profile" className="block px-4 py-2.5 text-sm text-gray-700 font-semibold hover:bg-orange-50 hover:text-orange-600 transition-colors">Hồ sơ của tôi</Link>
                  <Link to="/user/support" className="block px-4 py-2.5 text-sm text-gray-700 font-semibold hover:bg-orange-50 hover:text-orange-600 transition-colors">Trung tâm hỗ trợ</Link>
                  <hr className="my-1 border-gray-50"/>
                  <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2.5 text-sm text-rose-600 font-bold hover:bg-rose-50 transition-colors">
                    <LogoutIcon className="h-4 w-4 mr-2" /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="md:hidden flex items-center">
             <button className="p-2 rounded-xl text-gray-500 hover:text-orange-500 hover:bg-orange-50 transition-all">
              <MenuIcon className="h-7 w-7" />
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
