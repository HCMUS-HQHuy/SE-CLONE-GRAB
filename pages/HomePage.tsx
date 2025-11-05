import React from 'react';
import { StarIcon } from '../components/Icons';

const foodCategories = [
  {
    name: '🔥 Đại hạ giá',
    items: [
      { id: 1, name: 'Cơm tấm sườn bì chả', description: 'Cơm tấm nóng hổi, sườn nướng đậm đà, bì dai, chả trứng béo ngậy.', oldPrice: '55.000đ', newPrice: '35.000đ', image: 'data:image/jpeg;base64,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', bestseller: true },
      { id: 2, name: 'Trà sữa trân châu đường đen', description: 'Hương vị trà sữa truyền thống kết hợp trân châu đường đen dai ngon.', oldPrice: '45.000đ', newPrice: '29.000đ', image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', bestseller: false },
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
       { id: 5, name: 'Cá hồi nướng măng tây', description: 'Cá hồi nướng ăn kèm măng tây, món ăn bổ dưỡng và ngon miệng.', price: '120.000đ', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', bestseller: true },
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