import React, { useState, useMemo } from 'react';
import { restaurants, foodCategories, FoodItem as BaseFoodItem, Restaurant } from './HomePage';
import { PencilIcon, LocationMarkerIcon, PhoneIcon, ClockIcon, StarIcon, ImageIcon, PlusIcon, ChatAltIcon, ClipboardListIcon, TrashIcon } from '../components/Icons';
import AddMenuItemModal from '../components/AddMenuItemModal';
import EditRestaurantProfileModal from '../components/EditRestaurantProfileModal';

// Extend FoodItem type to ensure isAvailable is always present for management
type FoodItem = BaseFoodItem & { isAvailable: boolean };

// Mock Data for a specific restaurant - let's assume the logged-in restaurant is "Quán Ăn Gỗ"
const restaurantData: Restaurant = restaurants.find(r => r.id === '1001')!;

// Custom toggle switch component
const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void; }> = ({ checked, onChange }) => (
    <button
        onClick={(e) => { e.stopPropagation(); onChange(); }}
        role="switch"
        aria-checked={checked}
        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${checked ? 'bg-green-500' : 'bg-gray-300'}`}
    >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
    </button>
);

// Card for managing menu items
const MenuItemCard: React.FC<{ item: FoodItem; onEdit: () => void; onDelete: () => void; onToggle: () => void; }> = ({ item, onEdit, onDelete, onToggle }) => (
    <div className="bg-white rounded-lg shadow-md border overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:border-orange-300">
        <div className="relative w-full h-32 bg-gray-100">
            {item.image ? (
                <img className={`h-full w-full object-cover ${!item.isAvailable ? 'filter grayscale' : ''}`} src={item.image} alt={item.name} />
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
                <ToggleSwitch checked={item.isAvailable} onChange={onToggle} />
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
    const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<FoodItem | null>(null);

    const initialMenuItems = useMemo(() => {
        return foodCategories
            .flatMap(category => category.items)
            .filter(item => item.restaurantId === restaurantData.id)
            .map(item => ({ ...item, isAvailable: item.isAvailable ?? true })); // Ensure isAvailable is set
    }, []);

    const [menuItems, setMenuItems] = useState<FoodItem[]>(initialMenuItems);

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
            setMenuItems(prev => prev.filter(item => item.id !== itemId));
        }
    };

    const handleToggleAvailability = (itemId: number) => {
        setMenuItems(prev =>
            prev.map(item =>
                item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
            )
        );
    };

    const handleSaveItem = (itemData: any) => {
        if (currentItem) {
            setMenuItems(prev => prev.map(item => item.id === itemData.id ? { ...item, ...itemData } : item));
        } else {
            const newItem: FoodItem = {
                ...itemData,
                id: Math.max(0, ...menuItems.map(i => i.id)) + 1, // Generate new ID
                restaurantId: restaurantData.id,
                isAvailable: true,
            };
            setMenuItems(prev => [...prev, newItem]);
        }
        setIsMenuModalOpen(false);
        setCurrentItem(null);
    };

    const handleSaveProfile = (updatedData: Partial<Restaurant>) => {
        console.log('Saving profile:', updatedData);
        // Here you would typically update the restaurantData state
        setIsProfileModalOpen(false);
    };

    return (
        <div className="bg-gray-50 pb-12">
            {/* Banner and Header */}
            <div className="relative">
                <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${restaurantData.bannerUrl})` }}></div>
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Store Profile Header */}
                <div className="relative -mt-20">
                    <div className="bg-white rounded-xl shadow-lg p-5 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                        <div className="relative flex-shrink-0">
                            <img className="h-24 w-24 rounded-full object-cover ring-4 ring-white" src={restaurantData.logoUrl} alt="Restaurant Logo" />
                        </div>
                        <div className="flex-grow text-center sm:text-left">
                            <h1 className="text-2xl font-bold text-gray-900">{restaurantData.name}</h1>
                            <p className="text-sm text-gray-500 mt-1">{restaurantData.cuisine}</p>
                            <div className="flex items-center justify-center sm:justify-start flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-gray-600">
                                <div className="flex items-center"><StarIcon className="w-4 h-4 text-yellow-400 mr-1" /><span className="font-semibold text-gray-800">{restaurantData.rating.toFixed(1)}</span><span className="ml-1">({restaurantData.reviewCount.toLocaleString()} đánh giá)</span></div>
                                <div className="flex items-center"><ChatAltIcon className="w-4 h-4 text-gray-400 mr-1" /><span>{restaurantData.commentCount.toLocaleString()} bình luận</span></div>
                                <div className="flex items-center"><ClipboardListIcon className="w-4 h-4 text-gray-400 mr-1" /><span>{restaurantData.orderCount.toLocaleString()}+ đơn hàng</span></div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsProfileModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 flex-shrink-0"
                        ><PencilIcon className="h-4 w-4 mr-2 text-gray-400" />Chỉnh sửa</button>
                    </div>
                </div>

                {/* Two-column Layout */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Menu */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Thực đơn nổi bật</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            <div
                                onClick={handleOpenAddModal}
                                className="bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center h-full min-h-[210px] cursor-pointer group transition-all duration-300 hover:shadow-inner hover:border-orange-400 hover:bg-orange-50"
                                role="button" aria-label="Thêm món ăn mới"
                            >
                                <div className="text-center text-gray-400 group-hover:text-orange-500 transition-colors">
                                    <PlusIcon className="h-10 w-10 mx-auto" />
                                    <p className="mt-2 text-sm font-semibold">Thêm món</p>
                                </div>
                            </div>
                            {menuItems.map(item => (
                                <MenuItemCard
                                    key={item.id}
                                    item={item}
                                    onEdit={() => handleEditItem(item)}
                                    onDelete={() => handleDeleteItem(item.id)}
                                    onToggle={() => handleToggleAvailability(item.id)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white p-6 rounded-lg shadow-md border">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">Về chúng tôi</h3>
                            <p className="text-gray-600 text-sm">{restaurantData.description}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md border">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">Thông tin chi tiết</h3>
                            <ul className="space-y-4 text-sm">
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
                isOpen={isMenuModalOpen}
                onClose={() => setIsMenuModalOpen(false)}
                onSave={handleSaveItem}
                itemToEdit={currentItem}
            />
            <EditRestaurantProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                onSave={handleSaveProfile}
                restaurant={restaurantData}
            />
        </div>
    );
};

export default StorePage;
