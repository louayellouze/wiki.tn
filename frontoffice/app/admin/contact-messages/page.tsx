'use client'

import React, { useEffect, useState } from 'react'
import { adminContactService, ContactMessage } from '@/common/services/adminContactService'
import { Mail, Phone, Calendar, User, MessageSquare, Loader2, AlertCircle } from 'lucide-react'

export default function AdminContactMessagesPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const data = await adminContactService.getAllMessages();
                setMessages(data);
            } catch (err: any) {
                console.error('Failed to fetch messages:', err);
                setError(err.response?.data || 'Erreur lors de la récupération des messages.');
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
                <Loader2 className="w-12 h-12 text-wiki animate-spin" />
                <p className="text-slate-500 font-bold animate-pulse">Chargement des messages...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Messages de Contact</h1>
                        <p className="text-slate-500 font-medium mt-1">Gérer et consulter les demandes des clients.</p>
                    </div>
                    <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-wiki animate-pulse" />
                        <span className="font-bold text-slate-700">{messages.length} Messages au total</span>
                    </div>
                </div>

                {error && (
                    <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl flex items-center gap-4 text-rose-600 animate-in fade-in duration-300">
                        <AlertCircle className="shrink-0" size={24} />
                        <div>
                            <p className="font-black text-lg">Erreur de chargement</p>
                            <p className="font-medium opacity-80">{error}</p>
                        </div>
                    </div>
                )}

                {!error && messages.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
                        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <MessageSquare size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Aucun message pour le moment</h3>
                        <p className="text-slate-500 mt-2">Les messages envoyés via le formulaire apparaîtront ici.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {messages.map((msg) => (
                            <div key={msg.id} className="bg-white rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all border border-slate-100 group">
                                <div className="flex flex-col h-full gap-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-wiki/10 group-hover:text-wiki transition-colors">
                                                <User size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-xl text-slate-900 group-hover:text-wiki transition-colors">
                                                    {msg.firstName} {msg.lastName}
                                                </h3>
                                                <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest mt-0.5">
                                                    <Calendar size={12} />
                                                    {new Date(msg.createdAt).toLocaleDateString('fr-FR', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-xl shadow-sm">
                                                <Mail size={16} className="text-wiki" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Email</p>
                                                <p className="text-sm font-bold text-slate-700 truncate">{msg.email}</p>
                                            </div>
                                        </div>
                                        {msg.phone && (
                                            <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
                                                <div className="p-2 bg-white rounded-xl shadow-sm">
                                                    <Phone size={16} className="text-wiki" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Téléphone</p>
                                                    <p className="text-sm font-bold text-slate-700">{msg.phone}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative mt-2">
                                        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-wiki/20 rounded-full" />
                                        <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap pl-2 italic">
                                            "{msg.message}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
