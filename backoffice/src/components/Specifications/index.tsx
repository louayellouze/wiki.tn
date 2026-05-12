"use client";

import React, { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    X,
    AlertCircle,
    Settings
} from "lucide-react";
import {
    getSpecKeys,
    createSpecKey,
    updateSpecKey,
    deleteSpecKey
} from "@/services/speckey.service";
import { SpecKey } from "@/dtos/product.dto";
import { isAdmin } from "@/services/auth.service";

const Specifications = () => {
    const [specKeys, setSpecKeys] = useState<SpecKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isUserAdmin, setIsUserAdmin] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [currentSpecKey, setCurrentSpecKey] = useState<{ id?: number; name: string }>({ name: "" });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [specToDelete, setSpecToDelete] = useState<SpecKey | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        setMounted(true);
        setIsUserAdmin(isAdmin());
        fetchSpecKeys(currentPage);
    }, [currentPage, itemsPerPage]);

    const fetchSpecKeys = async (page: number = 0) => {
        try {
            setLoading(true);
            const response = await getSpecKeys(page, itemsPerPage);
            if (response && 'content' in response) {
                setSpecKeys(response.content);
                setTotalPages(response.totalPages);
                setTotalElements(response.totalElements);
            } else {
                setSpecKeys(response as SpecKey[]);
            }
        } catch (error) {
            console.error("Error fetching spec keys:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreateModal = () => {
        setModalMode("create");
        setCurrentSpecKey({ name: "" });
        setIsModalOpen(true);
        setError("");
    };

    const handleOpenEditModal = (spec: SpecKey) => {
        setModalMode("edit");
        setCurrentSpecKey({ id: spec.id, name: spec.name });
        setIsModalOpen(true);
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            if (modalMode === "create") {
                await createSpecKey(currentSpecKey);
            } else {
                if (currentSpecKey.id) {
                    await updateSpecKey(currentSpecKey.id, currentSpecKey);
                }
            }
            setIsModalOpen(false);
            fetchSpecKeys(currentPage);
        } catch (error: any) {
            setError(error.message || "Une erreur est survenue");
        }
    };

    const handleDelete = async () => {
        if (!specToDelete) return;
        try {
            await deleteSpecKey(specToDelete.id);
            setIsDeleteModalOpen(false);
            setSpecToDelete(null);
            fetchSpecKeys(currentPage);
        } catch (error: any) {
            console.error("Error deleting spec key:", error);
            setError(error.message || "Erreur lors de la suppression");
        }
    };

    const filteredKeys = specKeys.filter(key =>
        key.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="mx-auto max-w-4xl p-4 sm:p-6">
            <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Clés Techniques</h1>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">Gérez les types de spécifications (Marque, Processeur, RAM, etc.)</p>
                </div>
                {mounted && isUserAdmin && (
                    <button
                        onClick={handleOpenCreateModal}
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95"
                    >
                        <Plus size={18} />
                        Nouvelle Clé
                    </button>
                )}
            </div>

            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher une clé technique..."
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
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Nom de la Clé</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                        {loading ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-10 text-center text-gray-500">
                                    Chargement...
                                </td>
                            </tr>
                        ) : filteredKeys.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-10 text-center text-gray-500">
                                    Aucune clé trouvée
                                </td>
                            </tr>
                        ) : (
                            filteredKeys.map((key) => (
                                <tr key={key.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-600">
                                        #{key.id}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        {key.name}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {mounted && isUserAdmin && (
                                                <>
                                                    <button
                                                        onClick={() => handleOpenEditModal(key)}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => { setSpecToDelete(key); setIsDeleteModalOpen(true); }}
                                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
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
                        sur <span className="font-semibold text-gray-900 dark:text-white">{totalElements}</span> clés techniques
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

            {/* Modal */}
            {isModalOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div 
                        className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {modalMode === "create" ? "Nouvelle Clé" : "Modifier la Clé"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Nom</label>
                                <input
                                    type="text"
                                    required
                                    value={currentSpecKey.name}
                                    onChange={(e) => setCurrentSpecKey({ ...currentSpecKey, name: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    placeholder="Ex: Marque, Processeur, RAM"
                                />
                            </div>

                            <div className="mt-8 flex justify-end gap-3 border-t pt-6 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-all"
                                >
                                    <X size={16} /> Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                                >
                                    {modalMode === "create" ? "Créer" : "Enregistrer"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Delete Modal */}
            {isDeleteModalOpen && specToDelete && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                    onClick={() => { setIsDeleteModalOpen(false); setSpecToDelete(null); }}
                >
                    <div 
                        className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                                <Trash2 className="text-red-600" size={24} />
                            </div>
                            <button onClick={() => { setIsDeleteModalOpen(false); setSpecToDelete(null); }} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Confirmer la suppression</h3>
                        <p className="mb-6 text-gray-500 dark:text-gray-400">
                            Voulez-vous supprimer la clé technique <span className="font-semibold text-gray-900 dark:text-white">"{specToDelete.name}"</span> ? Cela pourrait affecter les produits existants.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => { setIsDeleteModalOpen(false); setSpecToDelete(null); }} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-all">
                                <X size={16} /> Annuler
                            </button>
                            <button onClick={handleDelete} className="rounded-lg bg-red-600 px-6 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-all active:scale-95">Supprimer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Specifications;
