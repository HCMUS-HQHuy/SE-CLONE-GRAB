import React, { useState, useRef, useEffect } from 'react';
import { XIcon, PaperAirplaneIcon } from './Icons';
import type { Ticket, Message } from '../pages/SupportPage';

type TicketDetailModalProps = {
    isOpen: boolean;
    onClose: () => void;
    ticket: Ticket;
    onSendMessage: (ticketId: string, message: string) => void;
};

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const isUser = message.sender === 'user';
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${isUser ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${isUser ? 'text-orange-100' : 'text-gray-500'} text-right`}>{message.timestamp}</p>
            </div>
        </div>
    );
};


const TicketDetailModal: React.FC<TicketDetailModalProps> = ({ isOpen, onClose, ticket, onSendMessage }) => {
    const [reply, setReply] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [ticket.messages]);
    
    if (!isOpen) return null;

    const handleSend = () => {
        if (!reply.trim()) return;
        onSendMessage(ticket.id, reply);
        setReply('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
            onClick={onClose}
            role="dialog" aria-modal="true" aria-labelledby="ticket-detail-title"
        >
            <div
                className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col"
                style={{ height: 'clamp(400px, 80vh, 700px)' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center border-b p-4 flex-shrink-0">
                    <h2 id="ticket-detail-title" className="text-lg font-bold text-gray-800">
                        Hỗ trợ cho ticket: <span className="text-orange-600">{ticket.id}</span>
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex-grow p-4 space-y-4 overflow-y-auto bg-gray-50">
                    {ticket.messages.map((msg, index) => (
                        <MessageBubble key={index} message={msg} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {ticket.status !== 'Hoàn tất' && (
                     <div className="border-t p-4 flex-shrink-0">
                        <div className="flex items-center space-x-3">
                            <textarea
                                value={reply}
                                onChange={e => setReply(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Nhập tin nhắn của bạn..."
                                rows={1}
                                className="flex-grow p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                            />
                            <button
                                onClick={handleSend}
                                className="p-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 disabled:bg-gray-300"
                                disabled={!reply.trim()}
                            >
                                <PaperAirplaneIcon className="h-5 w-5 transform rotate-90" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketDetailModal;