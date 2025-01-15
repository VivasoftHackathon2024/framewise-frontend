import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import authenticatedAxios from '../../config/axiosConfig';
import { SERVER_URL } from '../../data/path';

const TypingIndicator = () => (
    <div className="flex gap-2 items-center p-3 rounded-lg bg-gray-100 max-w-fit">
        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0s' }}></span>
        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
    </div>
);

const VideoChatInterface = ({ isOpen, onClose, threadId, videoId }) => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hello! I can help you understand the video analysis results. What would you like to know?'
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || !threadId) return;

        const userMessage = inputMessage.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await authenticatedAxios.post(
                `${SERVER_URL}/videos/${videoId}/chat/`,
                {
                    thread_id: threadId,
                    message: userMessage
                }
            );

            const newMessages = response.data.response
                .filter(msg => msg.role !== 'human' && msg.role !== 'tool' && msg.content.trim() !== '')
                .map(msg => ({
                    role: msg.role,
                    content: msg.content
                }));

            setMessages(prev => [...prev, ...newMessages]);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`chat-interface ${isOpen ? 'open' : ''}`}>
            <div className="flex justify-between items-center mb-2 border-b border-gray-200 pb-2">
                <h2 className="text-xl font-semibold">Video Chat Assistant</h2>
                <button 
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Chat Messages */}
            <div className="h-[calc(100vh-180px)] overflow-y-auto flex flex-col gap-4 mb-2">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex gap-2 items-start ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white
                            ${message.role === 'user' ? 'bg-green-500' : 'bg-blue-600'}`}>
                            {message.role === 'user' ? 'U' : 'AI'}
                        </div>
                        <div className={`p-3 rounded-lg max-w-[80%] ${
                            message.role === 'user' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-100 text-gray-900'
                        }`}>
                            <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                className={`prose prose-sm max-w-none ${
                                    message.role === 'user' 
                                        ? 'prose-invert' 
                                        : 'prose-gray'
                                }`}
                            >
                                {message.content}
                            </ReactMarkdown>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
                {isLoading && (
                    <div className="flex gap-2 items-start">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white bg-blue-600">
                            AI
                        </div>
                        <TypingIndicator />
                    </div>
                )}
            </div>

            {/* Chat Input */}
            <form
                onSubmit={handleSendMessage}
                className="absolute bottom-5 left-5 right-5 flex items-center bg-white rounded-lg shadow-lg border border-gray-200"
            >
                <input
                    type="text"
                    className="flex-1 p-3 outline-none disabled:bg-gray-50"
                    placeholder={isLoading ? "AI is typing..." : "Type your message..."}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    disabled={isLoading}
                />
                <div className="w-px h-7 bg-gray-200 mx-2" />
                <button
                    type="submit"
                    disabled={isLoading || !inputMessage.trim()}
                    className="p-2 text-blue-600 hover:bg-gray-100 rounded-full 
                             disabled:text-gray-400 disabled:hover:bg-transparent"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default VideoChatInterface;
