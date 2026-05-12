"use client";

import React, { useState, useEffect } from "react";
import {
    Search,
    History,
    Filter,
    Calendar,
    User,
    Database,
    Info,
    CheckCircle,
    AlertCircle,
    Trash2,
    RefreshCw,
    LogIn,
    LogOut
} from "lucide-react";
import { getHistorique, searchHistorique } from "@/services/historique.service";
import { Historique, ActionType, EntityType } from "@/dtos/historique.dto";

const HistoriqueComponent = () => {
    const [logs, setLogs] = useState<Historique[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        username: "",
        entityType: "",
        actionType: ""
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        fetchLogs(currentPage);
    }, [filters.entityType, filters.actionType, currentPage, itemsPerPage]); // Reload on select change, debounced for text

    const fetchLogs = async (page: number = 0) => {
        setLoading(true);
        try {
            // Use searchHistorique which handles filtering and pagination content
            const response = await searchHistorique(filters, page, itemsPerPage);
            setLogs(response.content);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            setLoading(false);
        }
    };

    const getActionIcon = (type: ActionType) => {
        switch (type) {
            case "CREATE": return <CheckCircle size={16} className="text-green-500" />;
            case "UPDATE": return <RefreshCw size={16} className="text-blue-500" />;
            case "DELETE": return <Trash2 size={16} className="text-red-500" />;
            case "LOGIN": return <LogIn size={16} className="text-indigo-500" />;
            case "LOGOUT": return <LogOut size={16} className="text-gray-500" />;
            default: return <Info size={16} />;
        }
    };

    const getEntityColor = (type: EntityType) => {
        switch (type) {
            case "PRODUCT": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
            case "CATEGORY": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
            case "ORDER": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
            case "USER": return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
            default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
        }
    };

    const filteredLogs = logs.filter(log =>
        log.username.toLowerCase().includes(filters.username.toLowerCase()) ||
        log.details.toLowerCase().includes(filters.username.toLowerCase())
    );

    return (
        <div className="mx-auto max-w-full py-4 sm:py-6">
            <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Historique d'Audit</h1>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">Suivi complet des actions effectuées sur la plateforme</p>
                </div>
                <button
                    onClick={() => fetchLogs(currentPage)}
                    className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    Actualiser
                </button>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
                <div className="relative col-span-1 md:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher par utilisateur ou détail..."
                        value={filters.username}
                        onChange={(e) => setFilters({ ...filters, username: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                </div>
                <div>
                    <select
                        value={filters.entityType}
                        onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                        <option value="">Toutes les entités</option>
                        <option value="PRODUCT">Produits</option>
                        <option value="CATEGORY">Catégories</option>
                        <option value="ORDER">Commandes</option>
                        <option value="USER">Utilisateurs</option>
                    </select>
                </div>
                <div>
                    <select
                        value={filters.actionType}
                        onChange={(e) => setFilters({ ...filters, actionType: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                        <option value="">Toutes les actions</option>
                        <option value="CREATE">Création</option>
                        <option value="UPDATE">Modification</option>
                        <option value="DELETE">Suppression</option>
                        <option value="LOGIN">Connexion</option>
                    </select>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="hidden border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/50 md:block">
                    <div className="grid grid-cols-[80px_180px_120px_150px_1fr] gap-4">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">#ID</span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Date & Heure</span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Action</span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Entité</span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Détails & Auteur</span>
                    </div>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mb-2"></div>
                            <p>Chargement des logs...</p>
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="p-16 text-center text-gray-500">
                            <History className="mx-auto mb-3 text-gray-300" size={48} />
                            <p>Aucun événement enregistré</p>
                        </div>
                    ) : (
                        filteredLogs.map((log) => (
                            <div key={log.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors md:px-6">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-[80px_180px_120px_150px_1fr]">
                                    <div className="flex items-center text-xs font-bold font-mono text-indigo-600">
                                        #{log.id}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Calendar size={14} />
                                        {new Date(log.actionDate).toLocaleString('fr-FR')}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-semibold">
                                        {getActionIcon(log.actionType)}
                                        {log.actionType}
                                    </div>
                                    <div>
                                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${getEntityColor(log.entityType)}`}>
                                            {log.entityType}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{log.details}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <User size={12} />
                                            <span className="font-semibold uppercase">{log.username}</span>
                                            <span className="text-gray-300">|</span>
                                            <span>{log.userRole}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Pagination UI */}
            {!loading && totalPages > 1 && (
                <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6 dark:border-gray-700 sm:flex-row">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Affichage de <span className="font-semibold text-gray-900 dark:text-white">{currentPage * itemsPerPage + 1}</span> à{" "}
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {Math.min((currentPage + 1) * itemsPerPage, totalElements)}
                        </span>{" "}
                        sur <span className="font-semibold text-gray-900 dark:text-white">{totalElements}</span> événements
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={currentPage === 0}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Précédent
                        </button>
                        <div className="flex items-center gap-1">
                            {/* Show a limited number of page buttons if there are too many */}
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum = i;
                                if (totalPages > 5 && currentPage > 2) {
                                    pageNum = Math.min(currentPage - 2 + i, totalPages - 5 + i);
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                                            currentPage === pageNum
                                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                        }`}
                                    >
                                        {pageNum + 1}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            disabled={currentPage === totalPages - 1}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Suivant
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoriqueComponent;
