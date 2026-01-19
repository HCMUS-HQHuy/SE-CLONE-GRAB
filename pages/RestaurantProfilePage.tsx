
import React, { useState, useMemo, useEffect } from 'react';
import { restaurants, FoodItem as BaseFoodItem, Restaurant } from './HomePage';
import { PencilIcon, LocationMarkerIcon, PhoneIcon, ClockIcon, StarIcon, ImageIcon, PlusIcon, ChatAltIcon, ClipboardListIcon, TrashIcon, ExclamationIcon, DocumentTextIcon } from '../components/Icons';
import AddMenuItemModal from '../components/AddMenuItemModal';
import EditRestaurantProfileModal from '../components/EditRestaurantProfileModal';
import { restaurantApiService, RestaurantListItem, DishResponse, UpdateDishRequest, UpdateRestaurantRequest } from '../services/restaurantApi';
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
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-md hover:border-orange-200">
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
                    <span className="border border-red-500 text-red-500 font-medium uppercase px-3 py-1.5 rounded transform -rotate-12 text-sm">
                        Hết hàng
                    </span>
                </div>
            )}
            {item.bestseller && (
                <div className="absolute top-2 left-2 flex items-center bg-yellow-400 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                    <StarIcon className="w-3 h-3 mr-1" />
                    <span>Bán chạy</span>
                </div>
            )}
             <div className="absolute top-2 right-2 z-10 bg-white/50 backdrop-blur-sm p-0.5 rounded-full">
                <ToggleSwitch checked={item.isAvailable} onChange={onToggle} disabled={isUpdating} />
            </div>
        </div>
        <div className="p-3 flex flex-col flex-grow">
            <h3 className="text-sm font-semibold text-gray-800 mb-1 flex-grow line-clamp-2">{item.name}</h3>
            <div className="mt-auto pt-2 flex justify-between items-end">
                {item.newPrice ? (
                    <div className="flex items-baseline gap-1.5">
                        <p className="text-md font-semibold text-orange-500">{item.newPrice}</p>
                        <p className="text-xs text-gray-400 line-through">{item.oldPrice}</p>
                    </div>
                ) : (
                    <p className="text-md font-semibold text-orange-500">{item.price}</p>
                )}
                <div className="flex space-x-1.5">
                    <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"><PencilIcon className="h-4 w-4" /></button>
                    <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><TrashIcon className="h-4 w-4" /></button>
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
    const [isActionLoading, setIsActionLoading] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const me = await apiService.getMe('seller');
            const res = await restaurantApiService.getRestaurantByOwner(me.id);
            setRestaurantData(res);
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
                bestseller: false,
            };
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
            alert('Cập nhật thất bại: ' + err.message);
        } finally {
            setIsActionLoading(null);
        }
    };

    const handleSaveItem = async (itemData: any) => {
        if (!restaurantData) return;
        setIsLoading(true);
        try {
            if (itemData.id) {
                const updatePayload: UpdateDishRequest = {
                    name: itemData.name,
                    description: itemData.description,
                    price: parseFloat(itemData.price),
                    discounted_price: itemData.discountPrice ? parseFloat(itemData.discountPrice) : 0,
                    category_id: itemData.categoryId,
                    stock_quantity: itemData.stock ? parseInt(itemData.stock, 10) : undefined,
                    is_available: true,
                    image: itemData.imageFile || undefined 
                };
                await restaurantApiService.updateDish(itemData.id, updatePayload);
                alert('Cập nhật món ăn thành công!');
            } else {
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
            const dishes = await restaurantApiService.getDishes(restaurantData.id);
            setMenuByCategories(mapApiDishesToMenuData(dishes, restaurantData.id.toString()));
            setIsMenuModalOpen(false);
        } catch (err: any) {
            alert('Lỗi: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveProfile = async (updatedData: UpdateRestaurantRequest) => {
        if (!restaurantData) return;
        setIsLoading(true);
        try {
            const result = await restaurantApiService.updateRestaurant(restaurantData.id, updatedData);
            setRestaurantData(result);
            setIsProfileModalOpen(false);
            alert('Cập nhật hồ sơ thành công!');
        } catch (err: any) {
            alert('Cập nhật hồ sơ thất bại: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !restaurantData) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gray-50/50">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-4"></div>
                <p className="text-gray-400 font-medium text-sm">Đang tải hồ sơ nhà hàng...</p>
            </div>
        );
    }

    if (error || !restaurantData) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-gray-50/50 text-center">
                <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border max-w-md">
                    <ExclamationIcon className="h-16 w-16 text-orange-200 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-800">Thông báo</h2>
                    <p className="text-gray-500 mt-2 text-sm leading-relaxed">{error || 'Không tìm thấy dữ liệu.'}</p>
                    <button onClick={fetchProfile} className="mt-8 bg-orange-500 text-white font-semibold py-2.5 px-8 rounded-full hover:bg-orange-600 transition-colors shadow-lg shadow-orange-100">Thử lại</button>
                </div>
            </div>
        );
    }

    const displayRestaurant: Restaurant = {
        id: restaurantData.id.toString(),
        name: restaurantData.name,
        address: restaurantData.address,
        lat: 0, lon: 0, cuisine: 'Ẩm thực Việt', phone: restaurantData.phone,
        openingHours: restaurantData.opening_hours,
        description: restaurantData.description,
        bannerUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80',
        logoUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448609.png',
        rating: restaurantData.rating || 0,
        reviewCount: 0, commentCount: 0, orderCount: 0, reviews: []
    };

    return (
        <div className="bg-gray-50 pb-12">
            <div className="relative">
                <div className="h-48 bg-cover bg-center bg-gray-200" style={{ backgroundImage: `url(${displayRestaurant.bannerUrl})` }}></div>
                <div className="absolute inset-0 bg-black/20"></div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative -mt-16">
                    <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 border border-gray-100/50">
                        <div className="relative flex-shrink-0">
                            <img className="h-24 w-24 rounded-2xl object-cover ring-4 ring-white shadow-sm" src={displayRestaurant.logoUrl} alt="Logo" />
                        </div>
                        <div className="flex-grow text-center sm:text-left">
                            <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">{displayRestaurant.name}</h1>
                            <div className="flex items-center justify-center sm:justify-start mt-1.5 text-xs text-gray-500 font-medium uppercase tracking-wider">
                                <span className={`px-2.5 py-0.5 rounded-full border mr-3 ${
                                    restaurantData.status === 'ACTIVE' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'
                                }`}>{restaurantData.status}</span>
                                <span>{displayRestaurant.cuisine}</span>
                            </div>
                        </div>
                        <button onClick={() => setIsProfileModalOpen(true)} className="inline-flex items-center px-6 py-2 border border-gray-100 text-xs font-semibold rounded-full text-gray-600 bg-white hover:bg-gray-50 shadow-sm transition-all"><PencilIcon className="h-4 w-4 mr-2 text-gray-400" />Chỉnh sửa hồ sơ</button>
                    </div>
                </div>
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100/50">
                        <div className="border-b border-gray-100 mb-8">
                            <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                                {categoryTabs.map(tab => (
                                    <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-semibold text-sm transition-all ${activeTab === tab ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>{tab}</button>
                                ))}
                            </nav>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            <div onClick={handleOpenAddModal} className="bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center min-h-[210px] cursor-pointer group transition-all hover:border-orange-200 hover:bg-orange-50/30" role="button">
                                <div className="text-center text-gray-400 group-hover:text-orange-400 transition-colors">
                                    <PlusIcon className="h-8 w-8 mx-auto" />
                                    <p className="mt-2 text-xs font-semibold uppercase tracking-widest">{isLoading ? '...' : 'Thêm món mới'}</p>
                                </div>
                            </div>
                            {itemsToShow.map(item => (
                                <MenuItemCard key={item.id} item={item} isUpdating={isActionLoading === item.id} onEdit={() => handleEditItem(item)} onDelete={() => handleDeleteItem(item.id)} onToggle={() => handleToggleAvailability(item)} />
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100/50">
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Về chúng tôi</h3>
                            <p className="text-sm text-gray-600 leading-relaxed italic">"{displayRestaurant.description || 'Chưa có thông tin giới thiệu.'}"</p>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100/50">
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Thông tin chi tiết</h3>
                            <ul className="space-y-4">
                                <li className="flex items-start"><LocationMarkerIcon className="h-5 w-5 text-orange-300 mr-4 flex-shrink-0 mt-0.5" /><span className="text-sm text-gray-600 font-medium">{displayRestaurant.address}</span></li>
                                <li className="flex items-center"><PhoneIcon className="h-5 w-5 text-orange-300 mr-4 flex-shrink-0" /><span className="text-sm text-gray-600 font-medium">{displayRestaurant.phone}</span></li>
                                <li className="flex items-center"><ClockIcon className="h-5 w-5 text-orange-300 mr-4 flex-shrink-0" /><span className="text-sm text-gray-600 font-medium">{displayRestaurant.openingHours}</span></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <AddMenuItemModal isOpen={isMenuModalOpen} onClose={() => setIsMenuModalOpen(false)} onSave={handleSaveItem} itemToEdit={currentItem} categories={['Đại hạ giá', 'Ăn vặt', 'Ăn trưa', 'Đồ uống']} />
            <EditRestaurantProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} onSave={handleSaveProfile} restaurant={displayRestaurant} />
        </div>
    );
};

export default StorePage;
