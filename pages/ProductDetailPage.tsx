import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StarIcon, ImageIcon, PlusIcon, MinusIcon } from '../components/Icons';

// FIX: Add a type for food items to ensure type safety.
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

// NOTE: In a real app, this data would come from a global state/context or an API call
// FIX: Apply the FoodItem type to the items in foodCategories to resolve type inference issues.
const foodCategories: { name: string; items: FoodItem[] }[] = [
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
       { id: 5, name: 'Cá hồi nướng măng tây', description: 'Cá hồi nướng ăn kèm măng tây, món ăn bổ dưỡng và ngon miệng.', price: '120.000đ', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib.rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', bestseller: true },
       { id: 6, name: 'Phở bò tái lăn', description: 'Phở bò truyền thống với thịt bò được xào tái thơm ngon.', price: '45.000đ', image: '', bestseller: false },
       { id: 13, name: 'Bún chả Hà Nội', description: 'Thịt nướng thơm lừng ăn kèm bún và nước mắm chua ngọt.', price: '40.000đ', image: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?ixlib.rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', bestseller: true },
       { id: 14, name: 'Miến xào lòng gà', description: 'Miến dong dai ngon xào cùng lòng gà và rau củ.', price: '35.000đ', image: '', bestseller: false },
    ]
  },
  {
    name: 'Đồ uống',
    items: [
      { id: 7, name: 'Cà phê sữa đá', description: 'Cà phê robusta đậm đà pha cùng sữa đặc, uống với đá.', price: '25.000đ', image: '', bestseller: true },
      { id: 8, name: 'Nước ép cam tươi', description: 'Cam tươi vắt nguyên chất, không đường, tốt cho sức khỏe.', price: '35.000đ', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?ixlib.rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', bestseller: false },
      { id: 15, name: 'Sinh tố bơ', description: 'Bơ sáp xay mịn cùng sữa tươi, béo ngậy và bổ dưỡng.', price: '40.000đ', image: '', bestseller: false },
      { id: 16, name: 'Trà đào cam sả', description: 'Thức uống giải nhiệt sảng khoái từ trà, đào, cam và sả.', price: '45.000đ', image: '', bestseller: true },
    ]
  }
];

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);

  const product = foodCategories.flatMap(cat => cat.items).find(item => item.id === Number(id));

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-2xl font-bold">Sản phẩm không tồn tại</h1>
        <Link to="/user/home" className="text-orange-500 hover:underline mt-4 inline-block">
          Trở lại menu
        </Link>
      </div>
    );
  }

  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };


  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
            <Link to="/user/home" className="text-gray-500 hover:text-orange-600 transition-colors duration-300">
                &larr; Trở lại menu
            </Link>
        </div>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="w-full h-80 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
            {product.image ? (
                <img className="h-full w-full object-cover" src={product.image} alt={product.name} />
            ) : (
                <ImageIcon className="h-24 w-24 text-gray-400" />
            )}
          </div>

          {/* Details Section */}
          <div className="flex flex-col justify-center">
            {product.bestseller && (
                <div className="inline-flex items-center bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full mb-2 w-fit">
                    <StarIcon className="w-4 h-4 mr-1.5" />
                    <span>Bán chạy nhất</span>
                </div>
            )}
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-gray-600 mb-4">{product.description}</p>
            
            <div className="mb-6">
                {product.newPrice ? (
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-orange-500">{product.newPrice}</p>
                    <p className="text-lg text-gray-400 line-through">{product.oldPrice}</p>
                </div>
                ) : (
                <p className="text-3xl font-bold text-orange-500">{product.price}</p>
                )}
            </div>
            
            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
                <label className="text-sm font-medium text-gray-700">Số lượng:</label>
                <div className="flex items-center border border-gray-300 rounded-md">
                    <button onClick={handleDecrement} className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-l-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <MinusIcon className="h-5 w-5"/>
                    </button>
                    <span className="px-4 py-1.5 font-semibold text-lg">{quantity}</span>
                     <button onClick={handleIncrement} className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-r-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <PlusIcon className="h-5 w-5"/>
                    </button>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <button className="w-full flex justify-center py-3 px-4 border border-orange-500 rounded-md shadow-sm text-sm font-medium text-orange-500 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300">
                    Thêm vào giỏ hàng
                </button>
                <button className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300">
                    Mua ngay
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
