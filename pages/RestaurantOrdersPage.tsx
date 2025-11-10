import React, { useState, useMemo } from 'react';
import { ClockIcon, CheckCircleIcon, XCircleIcon, TruckIcon } from '../components/Icons';

type OrderStatus = 'Mới' | 'Đang chuẩn bị' | 'Sẵn sàng giao' | 'Hoàn thành' | 'Đã hủy';

type OrderItem = {
  name: string;
  quantity: number;
};

type Order = {
  id: string;
  customerName: string;
  address: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
};

// Mock Data
const mockOrders: Order[] = [
  {
    id: '#12345',
    customerName: 'Nguyễn Văn A',
    address: '123 Đường ABC, Q1, TPHCM',
    items: [
      { name: 'Cơm tấm sườn bì chả', quantity: 2 },
      { name: 'Nước ép cam tươi', quantity: 1 },
    ],
    total: 105000,
    status: 'Mới',
    createdAt: '2024-07-30T10:30:00Z',
  },
  {
    id: '#12346',
    customerName: 'Trần Thị B',
    address: '456 Đường XYZ, Q3, TPHCM',
    items: [{ name: 'Pizza Hải Sản', quantity: 1 }],
    total: 119000,
    status: 'Đang chuẩn bị',
    createdAt: '2024-07-30T10:25:00Z',
  },
    {
    id: '#12347',
    customerName: 'Lê Văn C',
    address: '789 Đường LMN, Q7, TPHCM',
    items: [
        { name: 'Miến xào lòng gà', quantity: 1 },
        { name: 'Nem chua rán', quantity: 2 },
    ],
    total: 95000,
    status: 'Sẵn sàng giao',
    createdAt: '2024-07-30T10:15:00Z',
  },
   {
    id: '#12348',
    customerName: 'Phạm Thị D',
    address: '101 Đường OPQ, Bình Thạnh, TPHCM',
    items: [{ name: 'Cơm tấm sườn bì chả', quantity: 1 }],
    total: 35000,
    status: 'Hoàn thành',
    createdAt: '2024-07-29T19:30:00Z',
  },
   {
    id: '#12349',
    customerName: 'Võ Văn E',
    address: '222 Đường UVW, Q2, TPHCM',
    items: [{ name: 'Pizza Hải Sản', quantity: 1 }],
    total: 119000,
    status: 'Đã hủy',
    createdAt: '2024-07-29T12:00:00Z',
  },
];


const getStatusStyles = (status: OrderStatus) => {
    switch (status) {
        case 'Mới': return 'bg-blue-100 text-blue-800';
        case 'Đang chuẩn bị': return 'bg-yellow-100 text-yellow-800';
        case 'Sẵn sàng giao': return 'bg-indigo-100 text-indigo-800';
        case 'Hoàn thành': return 'bg-green-100 text-green-800';
        case 'Đã hủy': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleTimeString('vi-VN')} ${date.toLocaleDateString('vi-VN')}`;
};


// Reusable OrderCard Component
const OrderCard: React.FC<{ order: Order; onUpdateStatus: (id: string, status: OrderStatus) => void; }> = ({ order, onUpdateStatus }) => {
    
    const ActionButtons = () => {
        switch(order.status) {
            case 'Mới':
                return (
                    <div className="flex space-x-2">
                        <button onClick={() => onUpdateStatus(order.id, 'Đang chuẩn bị')} className="flex items-center text-sm font-medium text-white bg-green-500 hover:bg-green-600 px-3 py-1.5 rounded-md transition-colors">
                           <CheckCircleIcon className="h-4 w-4 mr-1.5" /> Chấp nhận
                        </button>
                         <button onClick={() => onUpdateStatus(order.id, 'Đã hủy')} className="flex items-center text-sm font-medium text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-md transition-colors">
                           <XCircleIcon className="h-4 w-4 mr-1.5" /> Từ chối
                        </button>
                    </div>
                );
            case 'Đang chuẩn bị':
                 return (
                    <button onClick={() => onUpdateStatus(order.id, 'Sẵn sàng giao')} className="flex items-center text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded-md transition-colors">
                       <TruckIcon className="h-4 w-4 mr-1.5" /> Sẵn sàng giao
                    </button>
                );
            case 'Sẵn sàng giao':
                 return (
                    <button onClick={() => onUpdateStatus(order.id, 'Hoàn thành')} className="flex items-center text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 px-3 py-1.5 rounded-md transition-colors">
                       <CheckCircleIcon className="h-4 w-4 mr-1.5" /> Hoàn thành
                    </button>
                );
            default:
                return null; // No actions for 'Hoàn thành' or 'Đã hủy'
        }
    }

    return (
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-wrap justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-lg text-orange-600">{order.id}</h3>
                    <p className="font-semibold text-gray-800 mt-1">{order.customerName}</p>
                    <p className="text-sm text-gray-500">{order.address}</p>
                </div>
                <div className="text-right mt-2 sm:mt-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusStyles(order.status)}`}>
                        {order.status}
                    </span>
                     <p className="text-xs text-gray-400 mt-2 flex items-center justify-end">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {formatDateTime(order.createdAt)}
                    </p>
                </div>
            </div>
            <div className="border-t border-b border-gray-200 py-3 my-3">
                <ul className="space-y-1.5 text-sm">
                    {order.items.map((item, index) => (
                        <li key={index} className="flex justify-between">
                            <span className="text-gray-700">{item.quantity}x {item.name}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm text-gray-500">Tổng tiền</p>
                    <p className="font-bold text-xl text-gray-900">{formatCurrency(order.total)}</p>
                </div>
                <ActionButtons />
            </div>
        </div>
    );
};


const RestaurantOrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>(mockOrders);
    const [activeTab, setActiveTab] = useState('Tất cả');
    
    const tabs = ['Tất cả', 'Mới', 'Đang chuẩn bị', 'Sẵn sàng giao', 'Hoàn thành'];

    const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
        setOrders(prevOrders => 
            prevOrders.map(order => 
                order.id === orderId ? { ...order, status: newStatus } : order
            )
        );
    };
    
    const filteredOrders = useMemo(() => {
        if (activeTab === 'Tất cả') {
            return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        return orders
            .filter(order => order.status === activeTab)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [orders, activeTab]);

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Đơn hàng</h1>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {tabs.map(tab => (
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
            
            {/* Orders List */}
            {filteredOrders.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOrders.map(order => (
                        <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateStatus} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-4 bg-white rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-700">Không có đơn hàng nào</h3>
                    <p className="text-gray-500 mt-1">Hiện tại không có đơn hàng nào trong mục này.</p>
                </div>
            )}
        </div>
    );
};

export default RestaurantOrdersPage;
