"use client";

import React, { useState, useEffect } from "react";
import {
    Search,
    Trash2,
    MessageSquare,
    Star,
    User,
    Calendar,
    RefreshCw,
    AlertCircle,
    X,
    Smile,
    Frown,
    Meh
} from "lucide-react";
import { getReviews, deleteReview } from "@/services/review.service";
import { ReviewResponse } from "@/dtos/product.dto";
import { isAdmin } from "@/services/auth.service";

const Reviews = () => {
    const [reviews, setReviews] = useState<ReviewResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isUserAdmin, setIsUserAdmin] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState<ReviewResponse | null>(null);

    useEffect(() => {
        setMounted(true);
        setIsUserAdmin(isAdmin());
        fetchReviews(currentPage);
    }, [currentPage, itemsPerPage]);

    const fetchReviews = async (page: number = 0) => {
        setLoading(true);
        try {
            const response = await getReviews(page, itemsPerPage);
            if (response && 'content' in response) {
                setReviews(response.content);
                setTotalPages(response.totalPages);
                setTotalElements(response.totalElements);
                if (page !== currentPage) setCurrentPage(page);
            } else {
                setReviews(response as ReviewResponse[]);
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!reviewToDelete) return;
        try {
            await deleteReview(reviewToDelete.id);
            setIsDeleteModalOpen(false);
            fetchReviews(currentPage);
        } catch (error: any) {
            alert(`Erreur lors de la suppression: ${error.message}`);
        }
    };

    const filteredReviews = reviews.filter(rev =>
        rev.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rev.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rev.comment.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="mx-auto max-w-full py-4 sm:py-6">
            <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Avis</h1>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">Modérez les commentaires et notes des clients</p>
                </div>
                <button
                    onClick={() => fetchReviews(currentPage)}
                    className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    Actualiser
                </button>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
                {(() => {
                    const totalAnalyzed = filteredReviews.filter(r => r.sentiment).length;
                    const positives = filteredReviews.filter(r => r.sentiment === 'POSITIVE').length;
                    const negatives = filteredReviews.filter(r => r.sentiment === 'NEGATIVE').length;
                    const neutrals = filteredReviews.filter(r => r.sentiment === 'NEUTRAL').length;
                    const satisfactionRate = totalAnalyzed > 0 ? (positives / totalAnalyzed) * 100 : 0;

                    return (
                        <>
                            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Satisfaction Global (IA)</p>
                                <div className="mt-2 flex items-end gap-2">
                                    <span className="text-2xl font-black text-gray-900 dark:text-white">{satisfactionRate.toFixed(0)}%</span>
                                    <span className={`mb-1 text-xs font-bold ${satisfactionRate >= 70 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                        {satisfactionRate >= 70 ? 'Excellent' : 'À surveiller'}
                                    </span>
                                </div>
                                <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-700">
                                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${satisfactionRate}%` }} />
                                </div>
                            </div>
                            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <p className="text-xs font-bold uppercase tracking-wider text-emerald-500">Avis Positifs</p>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-2xl font-black text-gray-900 dark:text-white">{positives}</span>
                                    <Smile className="text-emerald-500" size={24} />
                                </div>
                                <p className="mt-1 text-[10px] text-gray-400">Basé sur l'analyse IA</p>
                            </div>
                            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <p className="text-xs font-bold uppercase tracking-wider text-amber-500">Avis Neutres</p>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-2xl font-black text-gray-900 dark:text-white">{neutrals}</span>
                                    <Meh className="text-amber-500" size={24} />
                                </div>
                                <p className="mt-1 text-[10px] text-gray-400">À analyser manuellement</p>
                            </div>
                            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <p className="text-xs font-bold uppercase tracking-wider text-rose-500">Avis Négatifs</p>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-2xl font-black text-gray-900 dark:text-white">{negatives}</span>
                                    <Frown className="text-rose-500" size={24} />
                                </div>
                                <p className="mt-1 text-[10px] text-gray-400 text-rose-400 font-bold">Action requise</p>
                            </div>
                        </>
                    );
                })()}
            </div>

            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher par utilisateur ou commentaire..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">#ID</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Produit</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Client</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Note</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Commentaire</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Sentiment (IA)</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Date</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                    Chargement...
                                </td>
                            </tr>
                        ) : filteredReviews.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                    Aucun avis trouvé
                                </td>
                            </tr>
                        ) : (
                            filteredReviews.map((rev) => (
                                <tr key={rev.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-600">
                                        #{rev.id}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {rev.productImage ? (
                                                <img src={rev.productImage} className="h-10 w-10 rounded-lg object-cover" alt={rev.productTitle} />
                                            ) : (
                                                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                    <MessageSquare size={16} className="text-gray-400" />
                                                </div>
                                            )}
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[150px]" title={rev.productTitle}>
                                                {rev.productTitle}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900 dark:text-white">{rev.fullName}</span>
                                            <span className="text-xs text-gray-500">@{rev.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star 
                                                        key={i} 
                                                        size={12} 
                                                        className={`${
                                                            i < rev.rating 
                                                                ? (rev.rating >= 4 ? "fill-emerald-400 text-emerald-400" : rev.rating >= 3 ? "fill-amber-400 text-amber-400" : "fill-rose-400 text-rose-400") 
                                                                : "text-gray-200 dark:text-gray-700"
                                                        }`} 
                                                    />
                                                ))}
                                            </div>
                                            <span className={`text-[10px] font-bold ${
                                                rev.rating >= 4 ? "text-emerald-600" : rev.rating >= 3 ? "text-amber-600" : "text-rose-600"
                                            }`}>
                                                {rev.rating}/5
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {rev.comment && rev.comment.trim() ? (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md line-clamp-2 italic">
                                                "{rev.comment}"
                                            </p>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Sans commentaire</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {rev.sentiment ? (
                                            <div className="flex flex-col items-start gap-1.5">
                                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                                                    rev.sentiment === 'POSITIVE' ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400' :
                                                    rev.sentiment === 'NEGATIVE' ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-400' :
                                                    'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-900/30 dark:border-slate-800 dark:text-slate-400'
                                                }`}>
                                                    <div className={`h-1.5 w-1.5 rounded-full ${
                                                        rev.sentiment === 'POSITIVE' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' :
                                                        rev.sentiment === 'NEGATIVE' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' :
                                                        'bg-slate-400'
                                                    }`} />
                                                    {rev.sentiment}
                                                </div>
                                                {rev.sentimentScore && (
                                                    <div className="flex items-center gap-2 w-full max-w-[80px]">
                                                        <div className="h-1 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full rounded-full ${
                                                                    rev.sentiment === 'POSITIVE' ? 'bg-emerald-500' :
                                                                    rev.sentiment === 'NEGATIVE' ? 'bg-rose-500' :
                                                                    'bg-slate-400'
                                                                }`}
                                                                style={{ width: `${rev.sentimentScore * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-[9px] text-gray-400 font-bold">{(rev.sentimentScore * 100).toFixed(0)}%</span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="px-3 py-1 rounded-full border border-dashed border-gray-300 text-[10px] text-gray-400 uppercase font-bold tracking-wider inline-flex items-center gap-2">
                                                <AlertCircle size={10} />
                                                En attente
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-500">
                                        {new Date(rev.createdAt).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {mounted && isUserAdmin && (
                                            <button
                                                onClick={() => {
                                                    setReviewToDelete(rev);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination UI */}
            {!loading && totalPages > 1 && (
                <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6 dark:border-gray-700 sm:flex-row">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Affichage de <span className="font-semibold text-gray-900 dark:text-white">{currentPage * itemsPerPage + 1}</span> à{" "}
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {Math.min((currentPage + 1) * itemsPerPage, totalElements)}
                        </span>{" "}
                        sur <span className="font-semibold text-gray-900 dark:text-white">{totalElements}</span> avis
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
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i)}
                                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                                        currentPage === i
                                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
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

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                    onClick={() => setIsDeleteModalOpen(false)}
                >
                    <div 
                        className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                                <Trash2 className="text-red-600" size={24} />
                            </div>
                            <button onClick={() => setIsDeleteModalOpen(false)} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Confirmer la suppression</h3>
                        <p className="mb-6 text-gray-500 dark:text-gray-400">
                            Voulez-vous vraiment supprimer cet avis ? Cette action est irréversible.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-all">
                                <X size={16} /> Annuler
                            </button>
                            <button onClick={handleDelete} className="rounded-lg bg-red-600 px-6 py-2 text-sm font-semibold text-white hover:bg-red-700">Supprimer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reviews;
