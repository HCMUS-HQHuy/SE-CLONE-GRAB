
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { restaurantApiService, DishResponse, RestaurantListItem } from '../services/restaurantApi';
import { FoodItem, restaurants } from './HomePage';
import { StarIcon, ImageIcon, SearchIcon } from '../components/Icons';
import ProductDetailModal from '../components/ProductDetailModal';

const BASE_IMG_URL = 'http://localhost:8004/';

const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num).replace(/\s/g, '');
};

const SearchResultsPage: React.FC = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get('q') || '';
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [allDishes, setAllDishes] = useState<DishResponse[]>([]);
    const [allRestaurants, setAllRestaurants] = useState<RestaurantListItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<FoodItem | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [dishes, resList] = await Promise.all([
                restaurantApiService.getAllDishes({ limit: 500, available_only: true }),
                restaurantApiService.getRestaurants(0, 100, 'ACTIVE')
            ]);
            setAllDishes(dishes);
            setAllRestaurants(resList);
        } catch (err: any) {
            setError(err.message || 'Không thể tải kết quả tìm kiếm.');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const lowerQuery = searchQuery.toLowerCase();
        
        return allDishes
            .filter(dish => dish.name.toLowerCase().includes(lowerQuery))
            .map(dish => {
                const restaurantInfo = allRestaurants.find(r => r.id === dish.restaurant_id);
                
                const uiItem: FoodItem = {
                    id: dish.id,
                    name: dish.name,
                    description: dish.description,
                    restaurantId: dish.restaurant_id.toString(),
                    image: dish.image_url || '',
                    isAvailable: dish.is_available,
                    bestseller: false,
                    restaurant: restaurantInfo ? {
                        id: restaurantInfo.id.toString(),
                        name: restaurantInfo.name,
                        address: restaurantInfo.address,
                        lat: 0, lon: 0, cuisine: 'Ẩm thực', phone: restaurantInfo.phone,
                        openingHours: restaurantInfo.opening_hours,
                        description: restaurantInfo.description,
                        bannerUrl: '', logoUrl: '', rating: restaurantInfo.rating,
                        reviewCount: 0, commentCount: 0, orderCount: 0, reviews: []
                    } : undefined
                };

                if (dish.discounted_price && parseFloat(dish.discounted_price) > 0) {
                    uiItem.oldPrice = formatCurrency(dish.price);
                    uiItem.newPrice = formatCurrency(dish.discounted_price);
                } else {
                    uiItem.price = formatCurrency(dish.price);
                }

                return uiItem;
            });
    }, [allDishes, allRestaurants, searchQuery]);

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto py-20 px-4 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                <p className="mt-4 text-gray-500">Đang tìm kiếm món ngon cho bạn...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <SearchIcon className="h-6 w-6 text-orange-500 mr-2" />
                    Kết quả cho: <span className="text-orange-600 ml-2">"{searchQuery}"</span>
                </h1>
                <p className="text-sm text-gray-500 mt-1">Tìm thấy {filteredResults.length} món ăn phù hợp.</p>
            </div>

            {filteredResults.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredResults.map(item => (
                        <div 
                            key={item.id} 
                            onClick={() => setSelectedProduct(item)}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1 group"
                        >
                            <div className="relative h-44 bg-gray-100 overflow-hidden">
                                {item.image ? (
                                    <img 
                                        src={item.image.startsWith('http') ? item.image : `${BASE_IMG_URL}${item.image}`} 
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center"><ImageIcon className="h-10 w-10 text-gray-300"/></div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-gray-900 group-hover:text-orange-500 transition-colors line-clamp-1">{item.name}</h3>
                                {item.restaurant && (
                                    <p className="text-xs text-gray-500 font-medium mt-1">{item.restaurant.name}</p>
                                )}
                                <div className="mt-3 flex items-baseline justify-between">
                                    {item.newPrice ? (
                                        <div className="flex items-baseline space-x-2">
                                            <span className="text-lg font-black text-orange-500">{item.newPrice}</span>
                                            <span className="text-xs text-gray-400 line-through">{item.oldPrice}</span>
                                        </div>
                                    ) : (
                                        <span className="text-lg font-black text-orange-500">{item.price}</span>
                                    )}
                                    <button className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase">Đặt món</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white p-20 rounded-2xl border-2 border-dashed text-center">
                    <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <SearchIcon className="h-10 w-10 text-gray-300" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Không có kết quả nào</h2>
                    <p className="text-gray-500 mt-2">Vui lòng thử tìm kiếm với từ khóa khác.</p>
                    <Link to="/user/home" className="mt-6 inline-block bg-orange-500 text-white font-bold py-2 px-6 rounded-lg shadow-lg shadow-orange-100">Khám phá thực đơn</Link>
                </div>
            )}

            {selectedProduct && (
                <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
            )}
        </div>
    );
};

export default SearchResultsPage;
