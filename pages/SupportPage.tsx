import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, PlusIcon, PaperClipIcon } from '../components/Icons';
import TicketDetailModal from '../components/TicketDetailModal';

export type Message = {
    sender: 'user' | 'support';
    text: string;
    timestamp: string;
};

export type Ticket = {
    id: string;
    type: 'Khiếu nại' | 'Hỏi đáp' | 'Góp ý';
    subject: string;
    status: 'Mới' | 'Đang xử lý' | 'Hoàn tất';
    lastUpdate: string;
    messages: Message[];
};

// Mock Data
const mockTickets: Ticket[] = [
    {
        id: 'TICKET-8A2B4',
        type: 'Khiếu nại',
        subject: 'Về đơn hàng #12345',
        status: 'Hoàn tất',
        lastUpdate: '2024-07-28',
        messages: [
            { sender: 'user', text: 'Đơn hàng của tôi bị giao thiếu món. Tôi đặt 2 cơm tấm nhưng chỉ nhận được 1.', timestamp: '10:00, 27/07/2024' },
            { sender: 'support', text: 'Chào bạn, chúng tôi rất xin lỗi về sự cố này. Chúng tôi đã xác minh và sẽ hoàn tiền cho món bị thiếu. Tiền sẽ được hoàn vào ví của bạn trong 24h tới. Cảm ơn bạn đã thông cảm.', timestamp: '10:15, 27/07/2024' },
        ]
    },
    {
        id: 'TICKET-9C3D5',
        type: 'Hỏi đáp',
        subject: 'Về chương trình khuyến mãi',
        status: 'Đang xử lý',
        lastUpdate: '2024-07-30',
        messages: [
            { sender: 'user', text: 'Mã khuyến mãi NEWUSER20K của tôi không hoạt động. Hệ thống báo mã không hợp lệ.', timestamp: '09:30, 30/07/2024' },
            { sender: 'support', text: 'Chào bạn, chúng tôi đã nhận được yêu cầu của bạn và đang kiểm tra. Chúng tôi sẽ phản hồi lại trong thời gian sớm nhất.', timestamp: '09:45, 30/07/2024' },
        ]
    },
];

const SupportPage: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Form state
    const [ticketType, setTicketType] = useState<'Khiếu nại' | 'Hỏi đáp' | 'Góp ý'>('Khiếu nại');
    const [content, setContent] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);

    const getStatusStyles = (status: Ticket['status']) => {
        switch (status) {
            case 'Mới': return 'bg-blue-100 text-blue-800';
            case 'Đang xử lý': return 'bg-yellow-100 text-yellow-800';
            case 'Hoàn tất': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleCreateTicket = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) {
            alert('Vui lòng nhập nội dung phản hồi.'); // SUP-Err-1
            return;
        }

        const newTicket: Ticket = {
            id: `TICKET-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
            type: ticketType,
            subject: content.substring(0, 30) + '...',
            status: 'Mới',
            lastUpdate: new Date().toISOString().split('T')[0],
            messages: [{
                sender: 'user',
                text: content,
                timestamp: new Date().toLocaleString('vi-VN')
            }]
        };

        setTickets([newTicket, ...tickets]);
        setIsCreating(false);
        // Reset form
        setTicketType('Khiếu nại');
        setContent('');
        setAttachment(null);
    };

    const handleSendMessage = (ticketId: string, messageText: string) => {
        const newMessage: Message = {
            sender: 'user',
            text: messageText,
            timestamp: new Date().toLocaleString('vi-VN')
        };
        const updatedTickets = tickets.map(ticket =>
            ticket.id === ticketId
                ? {
                    ...ticket,
                    messages: [...ticket.messages, newMessage],
                    // FIX: Explicitly cast status to the correct type to avoid type widening.
                    status: 'Đang xử lý' as Ticket['status'], // Assume user reply re-opens ticket
                    lastUpdate: new Date().toISOString().split('T')[0]
                }
                : ticket
        );
        setTickets(updatedTickets);
        
        const updatedSelectedTicket = updatedTickets.find(t => t.id === ticketId);
        setSelectedTicket(updatedSelectedTicket || null);
    };

    const CreateTicketForm = () => (
        <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Gửi yêu cầu hỗ trợ mới</h2>
            <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                    <label htmlFor="ticket-type" className="block text-sm font-medium text-gray-700">Loại yêu cầu</label>
                    <select id="ticket-type" value={ticketType} onChange={e => setTicketType(e.target.value as any)} className="mt-1 block w-full input-field">
                        <option>Khiếu nại</option>
                        <option>Hỏi đáp</option>
                        <option>Góp ý</option>
                    </select>
                </div>
                 <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">Nội dung</label>
                    <textarea id="content" value={content} onChange={e => setContent(e.target.value)} rows={5} className="mt-1 block w-full input-field" placeholder="Mô tả chi tiết vấn đề của bạn..."></textarea>
                </div>
                 <div>
                    <label htmlFor="attachment" className="block text-sm font-medium text-gray-700">Đính kèm (nếu có)</label>
                    <div className="mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            <PaperClipIcon className="mx-auto h-10 w-10 text-gray-400"/>
                            <div className="flex text-sm text-gray-600">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none">
                                    <span>Tải tệp lên</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={e => setAttachment(e.target.files ? e.target.files[0] : null)}/>
                                </label>
                            </div>
                            <p className="text-xs text-gray-500">{attachment ? attachment.name : 'PNG, JPG, PDF'}</p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end space-x-3">
                    <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Hủy</button>
                    <button type="submit" className="px-6 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600">Gửi</button>
                </div>
            </form>
             <style>{`.input-field { border: 1px solid #D1D5DB; border-radius: 0.375rem; padding: 0.5rem 0.75rem; } .input-field:focus { outline: none; border-color: #F97316; box-shadow: 0 0 0 1px #F97316; }`}</style>
        </div>
    );
    
    const TicketList = () => (
         <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Lịch sử hỗ trợ</h2>
                <button onClick={() => setIsCreating(true)} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600">
                    <PlusIcon className="h-5 w-5 mr-2"/> Tạo yêu cầu mới
                </button>
            </div>
            <div className="space-y-3">
                {tickets.length > 0 ? tickets.map(ticket => (
                    <div key={ticket.id} onClick={() => setSelectedTicket(ticket)} className="p-4 border rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-50">
                        <div>
                            <p className="font-semibold text-gray-900">{ticket.type} - <span className="text-orange-600">{ticket.id}</span></p>
                            <p className="text-sm text-gray-600">{ticket.subject}</p>
                            <p className="text-xs text-gray-400 mt-1">Cập nhật lần cuối: {ticket.lastUpdate}</p>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusStyles(ticket.status)}`}>
                            {ticket.status}
                        </span>
                    </div>
                )) : (
                    <div className="text-center text-gray-500 py-8">
                        <p>Bạn chưa có yêu cầu hỗ trợ nào.</p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-6">
                <Link to="/user/profile" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
                    <ChevronLeftIcon className="h-5 w-5 mr-1"/>
                    Quay lại tài khoản
                </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Hỗ trợ & Phản hồi</h1>

            {isCreating ? <CreateTicketForm /> : <TicketList />}

            {selectedTicket && (
                <TicketDetailModal 
                    isOpen={!!selectedTicket}
                    onClose={() => setSelectedTicket(null)}
                    ticket={selectedTicket}
                    onSendMessage={handleSendMessage}
                />
            )}
        </div>
    );
};

export default SupportPage;