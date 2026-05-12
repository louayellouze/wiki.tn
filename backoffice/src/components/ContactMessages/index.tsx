"use client";

import React, { useState, useEffect } from "react";
import {
    Search,
    Mail,
    Phone,
    User,
    Calendar,
    MessageSquare,
    RefreshCw,
    Loader2,
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle,
    Send,
    ArrowLeft,
    Filter
} from "lucide-react";
import { getContactMessages, updateContactStatus } from "@/services/contact.service";
import { ContactMessage } from "@/dtos/contact.dto";

const ContactMessagesComponent = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [updating, setUpdating] = useState<number | null>(null);
    const [replyText, setReplyText] = useState<{ [key: number]: string }>({});
    const [error, setError] = useState<string | null>(null);

    const fetchMessages = async (page: number) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getContactMessages(page, itemsPerPage);
            if (Array.isArray(data)) {
                setMessages(data);
                setTotalPages(1);
                setTotalElements(data.length);
            } else {
                setMessages(data.content || []);
                setTotalPages(data.totalPages || 0);
                setTotalElements(data.totalElements || 0);
            }
        } catch (err) {
            console.error("Failed to fetch messages:", err);
            setError("Erreur lors du chargement des messages");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages(currentPage);
    }, [currentPage, itemsPerPage]);

    const handleStatusUpdate = async (id: number, status: string) => {
        setUpdating(id);
        try {
            await updateContactStatus(id, status, replyText[id]);
            await fetchMessages(currentPage);
            setReplyText(prev => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setUpdating(null);
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'PENDING': return { label: 'EN ATTENTE', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: <Clock size={12} /> };
            case 'IN_PROGRESS': return { label: 'EN COURS', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: <RefreshCw size={12} /> };
            case 'RESOLVED': return { label: 'RÉSOLU', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: <CheckCircle2 size={12} /> };
            case 'REJECTED': return { label: 'REJETÉ', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20', icon: <XCircle size={12} /> };
            default: return { label: (status || 'INCONNU').toUpperCase(), color: 'bg-slate-500/10 text-slate-500 border-slate-500/20', icon: <AlertCircle size={12} /> };
        }
    };

    const filteredMessages = messages.filter(msg =>
        msg.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (msg.lastName && msg.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="mx-auto w-full max-w-[1400px] animate-in fade-in duration-500 px-4 sm:px-6 py-8 space-y-8">
            
            {/* Page Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                        <span className="hover:text-emerald-500 transition-colors cursor-pointer">Dashboard</span>
                        <span>/</span>
                        <span className="text-slate-900 dark:text-white">Support Client</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Centre de Réclamations</h1>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Requêtes</span>
                        <span className="text-lg font-semibold text-slate-900 dark:text-white">{totalElements}</span>
                    </div>
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block" />
                    <button
                        onClick={() => fetchMessages(currentPage)}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 h-11 px-4 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 font-medium"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        <span className="hidden sm:inline">Rafraîchir</span>
                    </button>
                </div>
            </header>

            {/* Advanced Filter/Search Bar */}
            <div className="flex flex-col md:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-emerald-500" />
                    <input
                        type="text"
                        placeholder="Rechercher un client, un email ou un mot clé..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-12 pl-11 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                </div>
                <button className="h-12 px-4 inline-flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <Filter size={16} />
                    <span className="text-sm font-medium">Filtres</span>
                </button>
            </div>

            {/* Content List */}
            <div className="grid gap-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50 rounded-2xl backdrop-blur-sm">
                        <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
                        <p className="mt-4 text-sm font-medium text-slate-500">Chargement des données...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-96 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl text-center p-6">
                        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Erreur de chargement</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">{error}</p>
                        <button onClick={() => fetchMessages(currentPage)} className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl transition-transform active:scale-95 shadow-lg">
                            Réessayer
                        </button>
                    </div>
                ) : filteredMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-80 bg-slate-50 dark:bg-slate-900/20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                        <Mail className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Aucun message trouvé</h3>
                        <p className="text-sm text-slate-400 mt-1">Ajustez vos critères de recherche.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredMessages.map((msg) => {
                            const statusCfg = getStatusInfo(msg.status);
                            return (
                                <div key={msg.id} className="group relative bg-white dark:bg-[#0f1629] border border-slate-200 dark:border-[#1e293b] rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700">
                                    
                                    {/* Subtle side strip color depending on status */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${msg.status === 'RESOLVED' ? 'bg-emerald-500' : msg.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                                    
                                    <div className="p-6 lg:p-8 flex flex-col lg:flex-row gap-8">
                                        
                                        {/* 1. Client Profile Column */}
                                        <div className="lg:w-64 xl:w-72 shrink-0 flex flex-col gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white text-xl font-bold shadow-sm group-hover:scale-105 transition-transform">
                                                    {msg.firstName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                                                        {msg.firstName} {msg.lastName}
                                                    </h3>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1.5 mt-1">
                                                        <Calendar size={12} />
                                                        {new Date(msg.createdAt).toLocaleDateString('fr-FR')} à {new Date(msg.createdAt).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-2 space-y-2">
                                                <a href={`mailto:${msg.email}`} className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:border-emerald-500/30 hover:bg-white dark:hover:bg-slate-800 transition-all overflow-hidden">
                                                    <Mail size={15} className="text-slate-400 shrink-0" />
                                                    <span className="truncate font-medium">{msg.email}</span>
                                                </a>
                                                {msg.phone && (
                                                    <div className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-xl text-sm text-slate-600 dark:text-slate-300">
                                                        <Phone size={15} className="text-slate-400 shrink-0" />
                                                        <span className="font-medium">{msg.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* 2. Message Content Center */}
                                        <div className="flex-1 flex flex-col justify-between min-h-full">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                                    <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 uppercase">
                                                        ID #{msg.id}
                                                    </span>
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${statusCfg.color}`}>
                                                        {statusCfg.icon}
                                                        {statusCfg.label}
                                                    </span>
                                                </div>
                                                
                                                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                                                    {msg.subject || "Réclamation Générale"}
                                                </h4>
                                                
                                                <div className="p-5 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl relative">
                                                    <div className="text-slate-600 dark:text-slate-300 text-[15px] leading-relaxed italic">
                                                        "{msg.message}"
                                                    </div>
                                                </div>
                                            </div>

                                            {msg.response && (
                                                <div className="mt-6 p-5 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-xl relative group/resp">
                                                    <div className="absolute right-4 top-4 text-emerald-500/20">
                                                        <CheckCircle2 size={24} />
                                                    </div>
                                                    <div className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        Réponse de l'équipe
                                                    </div>
                                                    <p className="text-[14px] font-semibold text-emerald-900 dark:text-emerald-100 leading-relaxed">
                                                        {msg.response}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* 3. Action / Reply Form Right */}
                                        <div className="lg:w-72 xl:w-80 shrink-0 flex flex-col">
                                            <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 h-full flex flex-col shadow-sm">
                                                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 block">
                                                    Répondre au client
                                                </label>
                                                
                                                <textarea 
                                                    placeholder="Rédigez votre solution ici..."
                                                    className="flex-1 min-h-[120px] w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none resize-none"
                                                    value={replyText[msg.id as number] || ''}
                                                    onChange={(e) => setReplyText({ ...replyText, [msg.id as number]: e.target.value })}
                                                />
                                                
                                                <div className="grid grid-cols-2 gap-2.5 mt-4">
                                                    <button 
                                                        disabled={updating === msg.id}
                                                        onClick={() => handleStatusUpdate(msg.id as number, 'IN_PROGRESS')}
                                                        className="flex items-center justify-center gap-2 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wide transition-all shadow-md shadow-blue-500/10 active:scale-[0.97] disabled:opacity-50"
                                                    >
                                                        <RefreshCw size={14} className={updating === msg.id ? 'animate-spin' : ''} />
                                                        En Cours
                                                    </button>
                                                    <button 
                                                        disabled={updating === msg.id}
                                                        onClick={() => handleStatusUpdate(msg.id as number, 'RESOLVED')}
                                                        className="flex items-center justify-center gap-2 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wide transition-all shadow-md shadow-emerald-500/10 active:scale-[0.97] disabled:opacity-50"
                                                    >
                                                        <CheckCircle2 size={14} />
                                                        Résoudre
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Enhanced Pagination */}
            {!loading && totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-sm font-medium text-slate-500">
                        Affichage de la page <span className="font-bold text-slate-900 dark:text-white">{currentPage + 1}</span> sur <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span>
                    </p>
                    <div className="inline-flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-sm">
                        <button
                            disabled={currentPage === 0}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-30 active:scale-90"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
                        <button
                            disabled={currentPage === totalPages - 1}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-30 active:scale-90"
                        >
                            <ArrowLeft size={18} className="rotate-180" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactMessagesComponent;
