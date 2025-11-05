import React, { useState } from 'react';
import { StarIcon, ImageIcon, ArrowRightIcon } from '../components/Icons';

const foodCategories = [
  {
    name: '🔥 Đại hạ giá',
    items: [
      { id: 1, name: 'Cơm tấm sườn bì chả', description: 'Cơm tấm nóng hổi, sườn nướng đậm đà, bì dai, chả trứng béo ngậy.', oldPrice: '55.000đ', newPrice: '35.000đ', image: 'https://sakos.vn/wp-content/uploads/2024/10/bia-4.jpg', bestseller: true },
      { id: 2, name: 'Trà sữa trân châu đường đen', description: 'Hương vị trà sữa truyền thống kết hợp trân châu đường đen dai ngon.', oldPrice: '45.000đ', newPrice: '29.000đ', image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', bestseller: false },
      { id: 9, name: 'Bún bò Huế', description: 'Bún bò cay nồng, đậm đà hương vị cố đô.', oldPrice: '50.000đ', newPrice: '40.000đ', image: 'https://i.ytimg.com/vi/A_o2qfaTgKs/maxresdefault.jpg', bestseller: true },
      { id: 10, name: 'Combo Gà Rán', description: '2 miếng gà giòn tan, khoai tây chiên và nước ngọt.', oldPrice: '85.000đ', newPrice: '69.000đ', image: 'https://images.unsplash.com/photo-1562967914-608f82629710?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', bestseller: false },
      { id: 17, name: 'Cá hồi nướng măng tây', description: 'Cá hồi nướng ăn kèm măng tây, món ăn bổ dưỡng và ngon miệng.', oldPrice: '135.000đ', newPrice: '120.000đ', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', bestseller: true },
      { id: 18, name: 'Pizza Hải Sản', description: 'Pizza đế mỏng giòn với hải sản tươi ngon và phô mai.', oldPrice: '150.000đ', newPrice: '119.000đ', image: '', bestseller: false },
      { id: 19, name: 'Lẩu Thái Tom Yum', description: 'Lẩu thái chua cay đậm đà với hải sản, nấm và rau.', oldPrice: '250.000đ', newPrice: '199.000đ', image: '', bestseller: true },
    ]
  },
  {
    name: 'Ăn vặt',
    items: [
       { id: 3, name: 'Bánh tráng trộn Sài Gòn', description: 'Đầy đủ topping: xoài, trứng cút, bò khô, rau răm...', price: '25.000đ', image: 'https://cdn.xanhsm.com/2025/01/1b04f701-banh-trang-tron-sai-gon-1.jpg', bestseller: true },
       { id: 4, name: 'Gỏi cuốn tôm thịt', description: 'Tôm, thịt, bún, rau sống tươi ngon cuốn trong bánh tráng.', price: '30.000đ', image: 'https://cdn.tgdd.vn/2021/08/CookRecipe/Avatar/goi-cuon-tom-thit-thumbnail-1.jpg', bestseller: false },
       { id: 11, name: 'Nem chua rán', description: 'Nem chua rán nóng giòn, chấm cùng tương ớt cay cay.', price: '30.000đ', image: '', bestseller: true },
       { id: 12, name: 'Chè khúc bạch', description: 'Chè thanh mát với khúc bạch phô mai, nhãn và hạnh nhân.', price: '35.000đ', image: '', bestseller: false },
    ]
  },
  {
    name: 'Ăn trưa',
    items: [
       { id: 5, name: 'Cá hồi nướng măng tây', description: 'Cá hồi nướng ăn kèm măng tây, món ăn bổ dưỡng và ngon miệng.', price: '120.000đ', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', bestseller: true },
       { id: 6, name: 'Phở bò tái lăn', description: 'Phở bò truyền thống với thịt bò được xào tái thơm ngon.', price: '45.000đ', image: '', bestseller: false },
       { id: 13, name: 'Bún chả Hà Nội', description: 'Thịt nướng thơm lừng ăn kèm bún và nước mắm chua ngọt.', price: '40.000đ', image: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', bestseller: true },
       { id: 14, name: 'Miến xào lòng gà', description: 'Miến dong dai ngon xào cùng lòng gà và rau củ.', price: '35.000đ', image: '', bestseller: false },
    ]
  },
  {
    name: 'Đồ uống',
    items: [
      { id: 7, name: 'Cà phê sữa đá', description: 'Cà phê robusta đậm đà pha cùng sữa đặc, uống với đá.', price: '25.000đ', image: '', bestseller: true },
      { id: 8, name: 'Nước ép cam tươi', description: 'Cam tươi vắt nguyên chất, không đường, tốt cho sức khỏe.', price: '35.000đ', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', bestseller: false },
      { id: 15, name: 'Sinh tố bơ', description: 'Bơ sáp xay mịn cùng sữa tươi, béo ngậy và bổ dưỡng.', price: '40.000đ', image: '', bestseller: false },
      { id: 16, name: 'Trà đào cam sả', description: 'Thức uống giải nhiệt sảng khoái từ trà, đào, cam và sả.', price: '45.000đ', image: '', bestseller: true },
    ]
  }
];

type FoodItem = {
  id: number;
  name: string;
  description: string;
  price?: string;
  oldPrice?: string;
  newPrice?: string;
  image: string;
  bestseller: boolean;
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
        <p className="text-gray-600 text-sm">{item.description}</p>
      </div>
      <div className="mt-auto pt-3">
        {item.newPrice ? (
          <div className="flex items-baseline gap-2">
            <p className="text-lg font-bold text-orange-500">{item.newPrice}</p>
            <p className="text-sm text-gray-400 line-through">{item.oldPrice}</p>
          </div>
        ) : (
          <p className="text-lg font-bold text-orange-500">{item.price}</p>
        )}
      </div>
    </div>
  </div>
);


const HomePage: React.FC = () => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const handleShowMore = (categoryName: string) => {
    setExpandedCategories(prev => [...prev, categoryName]);
  };
  
  return (
    <div className="bg-gray-50">
      {/* Banner Section */}
      <div className="relative h-64 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80')"}}>
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <h1 className="text-4xl font-extrabold text-white tracking-wider text-center px-4">
                Tối rồi, ăn thôi!
              </h1>
          </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {foodCategories.map(category => {
            const isExpanded = expandedCategories.includes(category.name);
            const itemsToShow = isExpanded ? category.items : category.items.slice(0, 5);
            const hasMore = category.items.length > 5 && !isExpanded;

            return (
              <section key={category.name}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{category.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {itemsToShow.map(item => (
                    <FoodCard key={item.id} item={item} />
                  ))}
                  {hasMore && (
                    <div
                      onClick={() => handleShowMore(category.name)}
                      className="bg-white rounded-lg shadow-md flex items-center justify-center cursor-pointer h-full transform hover:-translate-y-1 transition-transform duration-300 hover:shadow-lg"
                      role="button"
                      aria-label={`Xem thêm món ăn trong mục ${category.name}`}
                    >
                      <ArrowRightIcon className="h-12 w-12 text-orange-500" />
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomePage;