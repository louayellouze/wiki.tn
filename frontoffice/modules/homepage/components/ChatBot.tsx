'use client'

import React, { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send, Bot, User, ShoppingBag, Loader2, Sparkles } from 'lucide-react'
import Link from 'next/link'
import api from '@/common/utils/api'
import { formatPrice } from '@/common/utils/format'

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    recommendations?: any[];
}

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'assistant', content: 'Bonjour ! 👋 Je suis Wiki Bot, votre assistant shopping. Comment puis-je vous aider aujourd\'hui ?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = { role: 'user' as const, content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const chatHistory = messages.concat(userMsg).map(m => ({
                role: m.role,
                content: m.content
            }));

            const response = await api.post('/v1/chat/ask', {
                messages: chatHistory
            });

            const botMsg: ChatMessage = {
                role: 'assistant',
                content: response.data.content,
                recommendations: response.data.recommendations
            };

            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: "Désolé, j'ai rencontré une erreur. Ma connexion avec le serveur est peut-être interrompue." 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[100] flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="w-[calc(100vw-2rem)] max-w-[360px] md:max-w-[400px] h-[520px] bg-white rounded-3xl shadow-[0_25px_60px_-12px_rgba(0,0,0,0.25)] border border-slate-100 flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-5 duration-300">
                    
                    {/* Header */}
                    <div className="bg-gradient-to-r from-wiki to-wiki-dark p-5 text-white flex justify-between items-center relative overflow-hidden">
                        {/* Decorative circles */}
                        <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
                        <div className="absolute bottom-0 left-1/3 w-12 h-12 bg-white/5 rounded-full" />
                        
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-inner">
                                <Bot size={22} />
                            </div>
                            <div>
                                <h3 className="font-bold text-[15px] leading-none tracking-tight">Wiki Bot</h3>
                                <div className="flex items-center gap-1.5 mt-1.5">
                                    <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse shadow-[0_0_6px_rgba(110,231,183,0.6)]" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">En ligne</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)} 
                            className="hover:bg-white/20 p-2 rounded-xl transition-all duration-200 relative z-10 active:scale-90"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-slate-50/80 to-white">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                {/* Avatar + bubble */}
                                <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    {/* Avatar */}
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                                        msg.role === 'user' 
                                            ? 'bg-wiki-btn text-white' 
                                            : 'bg-gradient-to-br from-wiki to-wiki-dark text-white'
                                    }`}>
                                        {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                    </div>
                                    
                                    {/* Bubble */}
                                    <div className={`p-3.5 rounded-2xl text-[13px] leading-relaxed ${
                                        msg.role === 'user' 
                                            ? 'bg-gradient-to-br from-wiki-btn to-emerald-800 text-white rounded-br-md shadow-lg shadow-emerald-900/20' 
                                            : 'bg-white text-slate-700 border border-slate-100 rounded-bl-md shadow-sm'
                                    }`}>
                                        {msg.content}
                                    </div>
                                </div>
                                
                                {/* Recommendations */}
                                {msg.recommendations && msg.recommendations.length > 0 && (
                                    <div className="mt-3 flex flex-col gap-2 w-full max-w-[90%] ml-9">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                            <Sparkles size={10} /> Produits recommandés
                                        </p>
                                        {msg.recommendations.map((prod, pIdx) => (
                                            <Link 
                                                key={pIdx}
                                                href={`/products/${prod.slug}`}
                                                className="bg-white border border-slate-100 p-3 rounded-xl flex items-center gap-3 shadow-sm hover:shadow-md hover:border-wiki/40 hover:-translate-y-0.5 transition-all duration-300 group"
                                            >
                                                <div className="w-11 h-11 bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden shrink-0 border border-slate-50 group-hover:border-wiki/20 transition-colors">
                                                    <img 
                                                        src={prod.imageUrl ? (prod.imageUrl.startsWith('http') ? prod.imageUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '')}${prod.imageUrl}`) : '/assets/img/logo.png'} 
                                                        alt={prod.title} 
                                                        className="max-h-full object-contain" 
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-slate-700 truncate group-hover:text-wiki-dark transition-colors">{prod.title}</p>
                                                    <p className="text-sm font-black text-wiki-dark mt-0.5">{formatPrice(prod.price)}</p>
                                                </div>
                                                <div className="w-8 h-8 rounded-lg bg-wiki/10 flex items-center justify-center group-hover:bg-wiki group-hover:text-white text-wiki transition-all duration-300">
                                                    <ShoppingBag size={14} />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        
                        {/* Typing indicator */}
                        {isLoading && (
                            <div className="flex items-end gap-2">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-wiki to-wiki-dark text-white flex items-center justify-center shrink-0 shadow-sm">
                                    <Bot size={14} />
                                </div>
                                <div className="bg-white p-4 rounded-2xl rounded-bl-md border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-wiki rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-wiki rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-wiki rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-2">
                        <input 
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Posez votre question..."
                            className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-wiki/30 focus:border-wiki/40 outline-none transition-all placeholder:text-slate-400"
                        />
                        <button 
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="bg-gradient-to-r from-wiki to-wiki-dark text-white p-2.5 rounded-xl hover:shadow-lg hover:shadow-wiki/30 disabled:opacity-40 disabled:shadow-none transition-all duration-300 active:scale-90"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`group w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300 transform ${
                    isOpen 
                        ? 'rotate-0 bg-slate-100 text-slate-500 scale-90 rounded-full hover:bg-slate-200' 
                        : 'bg-gradient-to-br from-wiki to-wiki-dark text-white hover:scale-110 hover:shadow-wiki/40 hover:shadow-[0_8px_30px_rgba(99,211,110,0.4)]'
                }`}
            >
                {isOpen ? (
                    <X size={28} />
                ) : (
                    <div className="relative">
                        <MessageSquare size={28} className="group-hover:scale-110 transition-transform" />
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                    </div>
                )}
            </button>
        </div>
    );
};

export default ChatBot;
