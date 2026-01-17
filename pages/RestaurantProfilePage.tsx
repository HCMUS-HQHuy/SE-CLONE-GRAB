
import React, { useState, useMemo, useEffect } from 'react';
import { restaurants, FoodItem as BaseFoodItem, Restaurant } from './HomePage';
import { PencilIcon, LocationMarkerIcon, PhoneIcon, ClockIcon, StarIcon, ImageIcon, PlusIcon, ChatAltIcon, ClipboardListIcon, TrashIcon, ExclamationIcon, DocumentTextIcon } from '../components/Icons';
import AddMenuItemModal from '../components/AddMenuItemModal';
import EditRestaurantProfileModal from '../components/EditRestaurantProfileModal';
import { restaurantApiService, RestaurantListItem, DishResponse, UpdateDishRequest } from '../services/restaurantApi';
import { apiService } from '../services/api';

// Extend FoodItem type for management
type FoodItem = BaseFoodItem & { isAvailable: boolean; category: string; stock_quantity?: number; category_id?: number };
type MenuData = { [category: string]: FoodItem[] };

const BASE_IMG_URL = 'http://localhost:8004/';

// Mapping ID từ backend sang tên category hiển thị
const ID_TO_CATEGORY_NAME: Record<number, string> = {
    1: 'Đại hạ giá',
    2: 'Ăn vặt',
    3: 'Ăn trưa',
    4: 'Đồ uống'
};

const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num).replace(/\s/g, '');
};

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void; disabled?: boolean }> = ({ checked, onChange, disabled }) => (
    <button
        onClick={(e) => { e.stopPropagation(); if(!disabled) onChange(); }}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${checked ? 'bg-green-500' : 'bg-gray-300'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
    </button>
);

const MenuItemCard: React.FC<{ item: FoodItem; onEdit: () => void; onDelete: () => void; onToggle: () => void; isUpdating?: boolean }> = ({ item, onEdit, onDelete, onToggle, isUpdating }) => (
    <div className="bg-white rounded-lg shadow-md border overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:border-orange-300">
        <div className="relative w-full h-32 bg-gray-100">
            {item.image ? (
                <img 
                    className={`h-full w-full object-cover ${!item.isAvailable ? 'filter grayscale' : ''}`} 
                    src={item.image.startsWith('data:') || item.image.startsWith('http') ? item.image : `${BASE_IMG_URL}${item.image}`} 
                    alt={item.name} 
                />
            ) : (
                <div className={`h-full w-full flex items-center justify-center ${!item.isAvailable ? 'filter grayscale' : ''}`}>
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                </div>
            )}
             {!item.isAvailable && (
                <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
                    <span className="border-2 border-red-500 text-red-500 font-bold uppercase px-4 py-2 rounded transform -rotate-12 text-lg">
                        Hết hàng
                    </span>
                </div>
            )}
            {item.bestseller && (
                <div className="absolute top-2 left-2 flex items-center bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                    <StarIcon className="w-3 h-3 mr-1" />
                    <span>Bán chạy</span>
                </div>
            )}
             <div className="absolute top-2 right-2 z-10 bg-white/50 backdrop-blur-sm p-0.5 rounded-full">
                <ToggleSwitch checked={item.isAvailable} onChange={onToggle} disabled={isUpdating} />
            </div>
        </div>
        <div className="p-3 flex flex-col flex-grow">
            <h3 className="text-sm font-bold text-gray-800 mb-1 flex-grow line-clamp-2">{item.name}</h3>
            <div className="mt-auto pt-2 flex justify-between items-end">
                {item.newPrice ? (
                    <div className="flex items-baseline gap-1.5">
                        <p className="text-md font-bold text-orange-500">{item.newPrice}</p>
                        <p className="text-xs text-gray-400 line-through">{item.oldPrice}</p>
                    </div>
                ) : (
                    <p className="text-md font-bold text-orange-500">{item.price}</p>
                )}
                <div className="flex space-x-2">
                    <button onClick={onEdit} className="text-gray-400 hover:text-blue-600"><PencilIcon className="h-5 w-5" /></button>
                    <button onClick={onDelete} className="text-gray-400 hover:text-red-600"><TrashIcon className="h-5 w-5" /></button>
                </div>
            </div>
        </div>
    </div>
);


const StorePage: React.FC = () => {
    const [restaurantData, setRestaurantData] = useState<RestaurantListItem | null>(null);
    const [menuByCategories, setMenuByCategories] = useState<MenuData>({});
    const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<FoodItem | null>(null);
    const [activeTab, setActiveTab] = useState('Tất cả');
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState<number | null>(null); // Lưu ID món đang cập nhật status
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // 1. Lấy thông tin user (8003)
            const me = await apiService.getMe('seller');
            // 2. Lấy nhà hàng (8004)
            const res = await restaurantApiService.getRestaurantByOwner(me.id);
            setRestaurantData(res);
            
            // 3. Lấy danh sách món ăn (8004)
            const dishes = await restaurantApiService.getDishes(res.id);
            const mappedMenu = mapApiDishesToMenuData(dishes, res.id.toString());
            setMenuByCategories(mappedMenu);
        } catch (err: any) {
            setError(err.message || 'Không thể tải dữ liệu.');
        } finally {
            setIsLoading(false);
        }
    };

    const mapApiDishesToMenuData = (apiDishes: DishResponse[], resId: string): MenuData => {
        const menu: MenuData = {};
        
        apiDishes.forEach(dish => {
            const catName = ID_TO_CATEGORY_NAME[dish.category_id] || 'Khác';
            
            // Chuyển đổi dữ liệu từ API sang FoodItem UI
            const uiItem: FoodItem = {
                id: dish.id,
                name: dish.name,
                description: dish.description,
                restaurantId: resId,
                image: dish.image_url || '',
                isAvailable: dish.is_available,
                category: catName,
                category_id: dish.category_id,
                stock_quantity: dish.stock_quantity,
                bestseller: false, // Default
            };

            // Xử lý giá tiền
            if (dish.discounted_price && parseFloat(dish.discounted_price) > 0) {
                uiItem.oldPrice = formatCurrency(dish.price);
                uiItem.newPrice = formatCurrency(dish.discounted_price);
            } else {
                uiItem.price = formatCurrency(dish.price);
            }

            if (!menu[catName]) menu[catName] = [];
            menu[catName].push(uiItem);
        });

        return menu;
    };
    
    const categoryTabs = useMemo(() => ['Tất cả', 'Đại hạ giá', 'Ăn vặt', 'Ăn trưa', 'Đồ uống'], []);

    const itemsToShow = useMemo(() => {
        if (activeTab === 'Tất cả') {
            return Object.values(menuByCategories).flat().sort((a,b) => a.id - b.id);
        }
        return menuByCategories[activeTab] || [];
    }, [activeTab, menuByCategories]);

    const handleOpenAddModal = () => {
        setCurrentItem(null);
        setIsMenuModalOpen(true);
    };

    const handleEditItem = (item: FoodItem) => {
        setCurrentItem(item);
        setIsMenuModalOpen(true);
    };

    const handleDeleteItem = (itemId: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa món ăn này không?')) {
            setMenuByCategories(prev => {
                const newMenu = { ...prev };
                for (const category in newMenu) {
                    newMenu[category] = newMenu[category].filter(item => item.id !== itemId);
                    if (newMenu[category].length === 0) delete newMenu[category];
                }
                return newMenu;
            });
        }
    };

    const handleToggleAvailability = async (item: FoodItem) => {
        setIsActionLoading(item.id);
        try {
            const updatePayload: UpdateDishRequest = {
                is_available: !item.isAvailable
            };
            await restaurantApiService.updateDish(item.id, updatePayload);
            
            // Cập nhật state local
            setMenuByCategories(prev => {
                const newMenu = { ...prev };
                for (const category in newMenu) {
                    newMenu[category] = newMenu[category].map(i =>
                        i.id === item.id ? { ...i, isAvailable: !item.isAvailable } : i
                    );
                }
                return newMenu;
            });
        } catch (err: any) {
            alert('Cập nhật trạng thái thất bại: ' + err.message);
        } finally {
            setIsActionLoading(null);
        }
    };

    const handleSaveItem = async (itemData: any) => {
        if (!restaurantData) return;
        setIsLoading(true);
        try {
            if (itemData.id) {
                // LOGIC UPDATE (PUT)
                const updatePayload: UpdateDishRequest = {
                    name: itemData.name,
                    description: itemData.description,
                    price: parseFloat(itemData.price),
                    discounted_price: itemData.discountPrice ? parseFloat(itemData.discountPrice) : 0,
                    category_id: itemData.categoryId,
                    stock_quantity: itemData.stock ? parseInt(itemData.stock, 10) : undefined,
                    is_available: true,
                    // image_url: ... (Nếu có API upload ảnh riêng để lấy URL mới)
                };
                
                await restaurantApiService.updateDish(itemData.id, updatePayload);
                alert('Cập nhật món ăn thành công!');
            } else {
                // LOGIC CREATE (POST)
                const dishPayload = {
                    name: itemData.name,
                    price: itemData.price.toString(),
                    discounted_price: itemData.discountPrice ? itemData.discountPrice.toString() : undefined,
                    description: itemData.description,
                    category_id: itemData.categoryId,
                    image: itemData.imageFile,
                    is_available: true,
                    stock_quantity: itemData.stock ? parseInt(itemData.stock, 10) : undefined
                };

                await restaurantApiService.createDish(restaurantData.id, dishPayload);
                alert('Món ăn đã được tạo thành công!');
            }
            
            // Fetch lại toàn bộ menu sau khi thay đổi để đồng bộ
            const dishes = await restaurantApiService.getDishes(restaurantData.id);
            setMenuByCategories(mapApiDishesToMenuData(dishes, restaurantData.id.toString()));
            setIsMenuModalOpen(false);
        } catch (err: any) {
            alert('Lỗi: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveProfile = (updatedData: Partial<Restaurant>) => {
        setIsProfileModalOpen(false);
    };

    if (isLoading && !restaurantData) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                <p className="text-gray-500 font-medium">Đang tải hồ sơ nhà hàng...</p>
            </div>
        );
    }

    if (error || !restaurantData) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-gray-50 text-center">
                <div className="bg-white p-10 rounded-2xl shadow-lg border max-w-md">
                    <ExclamationIcon className="h-20 w-20 text-orange-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800">Rất tiếc!</h2>
                    <p className="text-gray-600 mt-2">{error || 'Không tìm thấy thông tin nhà hàng của bạn.'}</p>
                    <button onClick={fetchProfile} className="mt-8 bg-orange-500 text-white font-bold py-2 px-8 rounded-lg hover:bg-orange-600 transition-colors">
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    const displayRestaurant: Restaurant = {
        id: restaurantData.id.toString(),
        name: restaurantData.name,
        address: restaurantData.address,
        lat: 0,
        lon: 0,
        cuisine: 'Ẩm thực Việt',
        phone: restaurantData.phone,
        openingHours: restaurantData.opening_hours,
        description: restaurantData.description,
        bannerUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80',
        logoUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448609.png',
        rating: restaurantData.rating || 0,
        reviewCount: 0,
        commentCount: 0,
        orderCount: 0,
        reviews: []
    };

    return (
        <div className="bg-gray-50 pb-12">
            <div className="relative">
                <div className="h-48 bg-cover bg-center bg-gray-300" style={{ backgroundImage: `url(${displayRestaurant.bannerUrl})` }}></div>
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative -mt-20">
                    <div className="bg-white rounded-xl shadow-lg p-5 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 border border-gray-100">
                        <div className="relative flex-shrink-0">
                            <img className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-md" src={displayRestaurant.logoUrl} alt="Logo" />
                        </div>
                        <div className="flex-grow text-center sm:text-left">
                            <h1 className="text-2xl font-bold text-gray-900">{displayRestaurant.name}</h1>
                            <div className="flex items-center justify-center sm:justify-start mt-1 text-sm text-gray-500">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase mr-2 border ${
                                    restaurantData.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                }`}>
                                    {restaurantData.status}
                                </span>
                                <span>{displayRestaurant.cuisine}</span>
                            </div>
                            <div className="flex items-center justify-center sm:justify-start flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-gray-600">
                                <div className="flex items-center"><StarIcon className="w-4 h-4 text-yellow-400 mr-1" /><span className="font-semibold text-gray-800">{displayRestaurant.rating.toFixed(1)}</span></div>
                                <div className="flex items-center"><ChatAltIcon className="w-4 h-4 text-gray-400 mr-1" /><span>{displayRestaurant.commentCount} bình luận</span></div>
                                <div className="flex items-center"><ClipboardListIcon className="w-4 h-4 text-gray-400 mr-1" /><span>{displayRestaurant.orderCount}+ đơn hàng</span></div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsProfileModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm flex-shrink-0"
                        ><PencilIcon className="h-4 w-4 mr-2 text-gray-400" />Chỉnh sửa</button>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border">
                        <div className="border-b border-gray-200 mb-6">
                            <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                                {categoryTabs.map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                            activeTab === tab
                                            ? 'border-orange-500 text-orange-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </nav>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            <div
                                onClick={handleOpenAddModal}
                                className="bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center h-full min-h-[210px] cursor-pointer group transition-all duration-300 hover:shadow-inner hover:border-orange-400 hover:bg-orange-50"
                                role="button" aria-label="Thêm món"
                            >
                                <div className="text-center text-gray-400 group-hover:text-orange-500 transition-colors">
                                    {isLoading ? (
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                                    ) : (
                                        <PlusIcon className="h-10 w-10 mx-auto" />
                                    )}
                                    <p className="mt-2 text-sm font-semibold">{isLoading ? 'Đang tải...' : 'Thêm món'}</p>
                                </div>
                            </div>
                            {itemsToShow.map(item => (
                                <MenuItemCard
                                    key={item.id}
                                    item={item}
                                    isUpdating={isActionLoading === item.id}
                                    onEdit={() => handleEditItem(item)}
                                    onDelete={() => handleDeleteItem(item.id)}
                                    onToggle={() => handleToggleAvailability(item)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white p-6 rounded-lg shadow-md border">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4 flex items-center">
                                <DocumentTextIcon className="h-5 w-5 mr-2 text-orange-500"/> Về chúng tôi
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{displayRestaurant.description || 'Chưa có giới thiệu.'}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md border">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">Thông tin chi tiết</h3>
                            <ul className="space-y-4 text-sm">
                                <li className="flex items-start">
                                    <LocationMarkerIcon className="h-5 w-5 text-orange-400 mr-3 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700 font-medium">{displayRestaurant.address}</span>
                                </li>
                                <li className="flex items-center">
                                    <PhoneIcon className="h-5 w-5 text-orange-400 mr-3 flex-shrink-0" />
                                    <span className="text-gray-700 font-medium">{displayRestaurant.phone}</span>
                                </li>
                                <li className="flex items-center">
                                    <ClockIcon className="h-5 w-5 text-orange-400 mr-3 flex-shrink-0" />
                                    <span className="text-gray-700 font-medium">{displayRestaurant.openingHours}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <AddMenuItemModal
                isOpen={isMenuModalOpen}
                onClose={() => setIsMenuModalOpen(false)}
                onSave={handleSaveItem}
                itemToEdit={currentItem}
                categories={['Đại hạ giá', 'Ăn vặt', 'Ăn trưa', 'Đồ uống']}
            />
            <EditRestaurantProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                onSave={handleSaveProfile}
                restaurant={displayRestaurant}
            />
        </div>
    );
};

export default StorePage;
