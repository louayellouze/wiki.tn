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
} from "lucide-react";
import { getContactMessages } from "@/services/contact.service";
import { ContactMessage } from "@/dtos/contact.dto";

const ContactMessagesComponent = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const data = await getContactMessages();
            setMessages(data);
        } catch (error) {
            console.error("Error fetching contact messages:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredMessages = messages.filter(msg =>
        msg.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (msg.lastName && msg.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="mx-auto max-w-full py-4 sm:py-6">
            <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messages de Contact</h1>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">Gérer les demandes reçues via le formulaire de contact</p>
                </div>
                <button
                    onClick={fetchMessages}
                    className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    Actualiser
                </button>
            </div>

            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Rechercher par nom, email ou contenu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="hidden border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/50 md:block">
                    <div className="grid grid-cols-[200px_200px_1fr] gap-4">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Date & Expéditeur</span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Contact</span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Message</span>
                    </div>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600 mb-2" />
                            <p>Chargement des messages...</p>
                        </div>
                    ) : filteredMessages.length === 0 ? (
                        <div className="p-16 text-center text-gray-500">
                            <Mail className="mx-auto mb-3 text-gray-300" size={48} />
                            <p>Aucun message trouvé</p>
                        </div>
                    ) : (
                        filteredMessages.map((msg) => (
                            <div key={msg.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors md:px-6">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-[200px_200px_1fr]">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                                            <User size={14} className="text-gray-400" />
                                            {msg.firstName} {msg.lastName}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Calendar size={12} />
                                            {new Date(msg.createdAt).toLocaleString('fr-FR')}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Mail size={14} />
                                            {msg.email}
                                        </div>
                                        {msg.phone && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <Phone size={14} />
                                                {msg.phone}
                                            </div>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <div className="flex items-start gap-2">
                                            <MessageSquare size={14} className="mt-1 text-gray-400 shrink-0" />
                                            <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                                                {msg.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactMessagesComponent;
