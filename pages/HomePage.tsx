import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '../components/Icons';

const featuredCategories = [
    { name: 'Rau củ', image: 'https://i.imgur.com/gI25A41.png' },
    { name: 'Trái cây', image: 'https://i.imgur.com/61GyGhy.png' },
    { name: 'Thịt tươi', image: 'https://i.imgur.com/a5HLw0o.png' },
    { name: 'Trứng', image: 'https://i.imgur.com/nJgQj3z.png' },
    { name: 'Đồ uống', image: 'https://i.imgur.com/qL3QGWU.png' },
    { name: 'Bánh mì', image: 'https://i.imgur.com/5XhJ8W2.png' },
    { name: 'Hải sản', image: 'https://i.imgur.com/v1uY32U.png' },
    { name: 'Salad', image: 'https://i.imgur.com/L13aSC0.png' },
    { name: 'Thực phẩm khô', image: 'https://i.imgur.com/Z4wZ8gJ.png' },
];

const bestSellers = [
    { name: 'Hành tây', price: '20.000đ', salePrice: '15.000đ', discount: '17%', image: 'https://i.imgur.com/o5V2sTf.png' },
    { name: 'Ngò rí', price: '25.000đ', salePrice: '21.000đ', discount: '10%', image: 'https://i.imgur.com/sPTiFCo.png' },
    { name: 'Đậu cove', price: '47.000đ', salePrice: '40.000đ', discount: '17%', image: 'https://i.imgur.com/mO24jzi.png' },
    { name: 'Cà chua Đà Lạt', price: '15.000đ', image: 'https://i.imgur.com/S8z1gE1.png' },
    { name: 'Bí đỏ', price: '22.000đ', salePrice: '18.000đ', discount: '15%', image: 'https://i.imgur.com/8zRLyS9.png' },
];

const ProductCard: React.FC<{ product: typeof bestSellers[0] }> = ({ product }) => (
    <div className="border border-gray-200 rounded-lg p-4 text-center group flex-shrink-0 w-48">
        {product.discount && (
            <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full absolute top-2 left-2">
                -{product.discount}
            </div>
        )}
        <img src={product.image} alt={product.name} className="h-24 w-24 mx-auto mb-2 transition-transform duration-300 group-hover:scale-110" />
        <h3 className="text-sm font-semibold text-gray-800 h-10">{product.name}</h3>
        <div className="flex justify-center items-baseline my-2">
            {product.salePrice ? (
                <>
                    <p className="text-primary font-bold">{product.salePrice}</p>
                    <p className="text-xs text-gray-400 line-through ml-2">{product.price}</p>
                </>
            ) : (
                <p className="text-primary font-bold">{product.price}</p>
            )}
        </div>
        <button className="w-full bg-primary-light text-primary-dark font-bold py-2 rounded-md hover:bg-primary hover:text-white transition-colors duration-300 text-sm">
            Thêm vào giỏ
        </button>
    </div>
);

const HomePage: React.FC = () => {
  return (
    <div className="bg-gray-50">
      {/* Banner Section */}
      <div className="bg-green-100">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex items-center">
            <div className="w-1/2">
                <h1 className="text-5xl font-extrabold text-gray-800 leading-tight">
                    Rau Tươi <br/> <span className="text-primary">Giảm Giá Lớn</span>
                </h1>
                <p className="mt-4 text-lg text-gray-600">
                    Tiết kiệm tới 50% cho đơn hàng đầu tiên của bạn
                </p>
                <button className="mt-8 bg-primary text-white font-bold py-3 px-8 rounded-md hover:bg-primary-dark transition-transform transform hover:scale-105 duration-300">
                    ĐẶT NGAY
                </button>
            </div>
            <div className="w-1/2">
                <img src="https://i.imgur.com/1EAD7Tb.png" alt="Fresh Vegetables" className="w-full h-auto" />
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Featured Categories */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Danh mục nổi bật</h2>
            <div className="flex items-center space-x-2">
                <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-100"><ChevronLeftIcon className="h-5 w-5 text-gray-600" /></button>
                <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-100"><ChevronRightIcon className="h-5 w-5 text-gray-600" /></button>
            </div>
          </div>
          <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4">
             {featuredCategories.map(category => (
                <div key={category.name} className="text-center flex-shrink-0 w-24 group">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-center h-24 w-24 mx-auto transition-shadow duration-300 group-hover:shadow-lg">
                        <img src={category.image} alt={category.name} className="h-16 w-16 object-contain" />
                    </div>
                    <p className="mt-2 text-sm font-semibold text-gray-700">{category.name}</p>
                </div>
             ))}
          </div>
        </section>

        {/* Best Sellers Section */}
        <section className="mt-12">
            <div className="flex bg-white rounded-lg p-6 border border-gray-200">
                <div className="w-1/4 bg-cover bg-center rounded-lg" style={{backgroundImage: "url('https://i.imgur.com/nJgqLBe.png')"}}>
                    <div className="p-6 h-full flex flex-col justify-between text-white bg-black bg-opacity-30 rounded-lg">
                        <div>
                            <h3 className="text-2xl font-bold">Bán chạy nhất hàng ngày</h3>
                            <p className="text-sm mt-2">Mua sắm thoải mái chỉ từ 20.000 VNĐ</p>
                        </div>
                        <button className="mt-4 bg-primary text-white font-bold py-2 px-4 rounded-md self-start hover:bg-primary-dark transition-colors duration-300">
                            Mua ngay
                        </button>
                    </div>
                </div>
                <div className="w-3/4 pl-6">
                    <div className="flex justify-between items-center mb-4">
                         <div className="flex space-x-4 border-b">
                            <button className="py-2 text-sm font-semibold text-primary border-b-2 border-primary">Rau củ</button>
                            <button className="py-2 text-sm font-medium text-gray-500 hover:text-gray-800">Trái cây</button>
                            <button className="py-2 text-sm font-medium text-gray-500 hover:text-gray-800">Đồ khô</button>
                        </div>
                        <button className="text-primary font-semibold text-sm hover:underline">Xem tất cả</button>
                    </div>
                     <div className="flex space-x-4 overflow-x-auto pb-4">
                        {bestSellers.map(product => <ProductCard key={product.name} product={product} />)}
                    </div>
                </div>
            </div>
        </section>
        
        {/* Promotional Banners */}
        <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-orange-100 p-6 rounded-lg flex items-center">
                <div>
                    <h4 className="font-bold text-lg text-gray-800">Nông sản tươi mới</h4>
                    <p className="text-sm text-gray-600">Sản phẩm 100% từ thiên nhiên</p>
                </div>
                <img src="https://i.imgur.com/dK3f0oX.png" alt="Fresh Produce" className="h-20 w-auto ml-auto" />
            </div>
            <div className="bg-blue-100 p-6 rounded-lg flex items-center">
                <div>
                    <h4 className="font-bold text-lg text-gray-800">Bữa sáng lành mạnh</h4>
                    <p className="text-sm text-gray-600">Sữa tươi nguyên chất, tiệt trùng</p>
                </div>
                <img src="https://i.imgur.com/QhFzYg1.png" alt="Healthy Breakfast" className="h-20 w-auto ml-auto" />
            </div>
            <div className="bg-green-100 p-6 rounded-lg flex items-center">
                <div>
                    <h4 className="font-bold text-lg text-gray-800">Rau củ hữu cơ 100%</h4>
                    <p className="text-sm text-gray-600">Sạch sẽ và an toàn chất lượng</p>
                </div>
                <img src="https://i.imgur.com/uR3VvAs.png" alt="Organic Vegetables" className="h-20 w-auto ml-auto" />
            </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
