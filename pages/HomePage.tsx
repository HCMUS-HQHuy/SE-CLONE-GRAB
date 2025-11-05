import React from 'react';
import { StarIcon } from '../components/Icons';

const foodCategories = [
  {
    name: '🔥 Đại hạ giá',
    items: [
      { id: 1, name: 'Cơm tấm sườn bì chả', description: 'Cơm tấm nóng hổi, sườn nướng đậm đà, bì dai, chả trứng béo ngậy.', oldPrice: '55.000đ', newPrice: '35.000đ', image: 'https://images.unsplash.com/photo-1596560543449-f54676d6b8cc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', bestseller: true },
      { id: 2, name: 'Trà sữa trân châu đường đen', description: 'Hương vị trà sữa truyền thống kết hợp trân châu đường đen dai ngon.', oldPrice: '45.000đ', newPrice: '29.000đ', image: 'https://images.unsplash.com/photo-1558160074-5834151a44a4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', bestseller: false },
    ]
  },
  {
    name: 'Ăn vặt',
    items: [
       { id: 3, name: 'Bánh tráng trộn Sài Gòn', description: 'Đầy đủ topping: xoài, trứng cút, bò khô, rau răm...', price: '25.000đ', image: 'https://images.unsplash.com/photo-1628771064211-aa715b3eb8a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', bestseller: true },
       { id: 4, name: 'Gỏi cuốn tôm thịt', description: 'Tôm, thịt, bún, rau sống tươi ngon cuốn trong bánh tráng.', price: '30.000đ', image: 'https://images.unsplash.com/photo-1599599810694-b5b373446903?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', bestseller: false },
    ]
  },
  {
    name: 'Ăn trưa',
    items: [
       { id: 5, name: 'Bún chả Hà Nội', description: 'Thịt nướng thơm lừng ăn kèm bún, rau sống và nước mắm chua ngọt.', price: '50.000đ', image: 'https://images.unsplash.com/photo-1634580392233-1b0b5a8b4e6d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', bestseller: true },
       { id: 6, name: 'Phở bò tái lăn', description: 'Phở bò truyền thống với thịt bò được xào tái thơm ngon.', price: '45.000đ', image: 'https://images.unsplash.com/photo-1569718212165-7a444c46331a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', bestseller: false },
    ]
  },
  {
    name: 'Đồ uống',
    items: [
      { id: 7, name: 'Cà phê sữa đá', description: 'Cà phê robusta đậm đà pha cùng sữa đặc, uống với đá.', price: '25.000đ', image: 'https://images.unsplash.com/photo-1558160074-5834151a44a4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', bestseller: true },
      { id: 8, name: 'Nước ép cam tươi', description: 'Cam tươi vắt nguyên chất, không đường, tốt cho sức khỏe.', price: '35.000đ', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', bestseller: false },
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
  <div className="bg-white rounded-lg shadow-md overflow-hidden flex transform hover:-translate-y-1 transition-transform duration-300">
    <div className="w-1/3 flex-shrink-0">
      <img className="h-full w-full object-cover" src={item.image} alt={item.name} />
    </div>
    <div className="w-2/3 p-4 flex flex-col justify-between relative">
      <div>
        {item.bestseller && (
            <div className="absolute top-2 right-2 flex items-center bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-full">
                <StarIcon className="w-3 h-3 mr-1" />
                <span>Bán chạy</span>
            </div>
        )}
        <h3 className="text-lg font-bold text-gray-800 mb-1 pr-16">{item.name}</h3>
        <p className="text-gray-600 text-sm">{item.description}</p>
      </div>
      <div className="mt-3">
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
          {foodCategories.map(category => (
            <section key={category.name}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{category.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {category.items.map(item => (
                  <FoodCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
