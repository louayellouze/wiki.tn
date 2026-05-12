"use client";

import React, { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Image as ImageIcon,
    X,
    Upload,
    Box,
    AlertCircle
} from "lucide-react";
import {
    getBrands,
    createBrand,
    updateBrand,
    deleteBrand
} from "@/services/brand.service";
import { Brand, BrandRequest } from "@/dtos/brand.dto";
import { uploadImage } from "@/services/product.service";
import { isAdmin, isInfoline } from "@/services/auth.service";

const Brands = () => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [formData, setFormData] = useState<BrandRequest & { id?: number }>({
        name: "",
        description: "",
        logoUrl: ""
    });

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);

    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        fetchData(currentPage);
    }, [currentPage, itemsPerPage]);

    const fetchData = async (page: number = 0) => {
        setLoading(true);
        try {
            const response = await getBrands(page, itemsPerPage);
            if (response && 'content' in response) {
                setBrands(response.content);
                setTotalPages(response.totalPages);
                setTotalElements(response.totalElements);
            } else {
                setBrands(response as Brand[]);
            }
        } catch (error) {
            console.error("Error fetching brands:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setModalMode("create");
        setFormData({ name: "", description: "", logoUrl: "" });
        setIsEditModalOpen(true);
    };

    const handleOpenEdit = (brand: Brand) => {
        setModalMode("edit");
        setFormData({
            id: brand.id,
            name: brand.name,
            description: brand.description || "",
            logoUrl: brand.logoUrl || ""
        });
        setIsEditModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Duplicate check
        const isDuplicate = brands.some(b =>
            b.name.toLowerCase() === formData.name.toLowerCase() &&
            b.id !== formData.id
        );

        if (isDuplicate) {
            alert(`Erreur: Une marque nommée "${formData.name}" existe déjà.`);
            return;
        }

        try {
            if (modalMode === "create") {
                await createBrand(formData);
            } else {
                await updateBrand(formData.id!, formData);
            }
            setIsEditModalOpen(false);
            fetchData(currentPage);
        } catch (error: any) {
            alert(`Erreur: ${error.message}`);
        }
    };

    const handleDelete = async () => {
        if (!brandToDelete) return;
        try {
            await deleteBrand(brandToDelete.id);
            setIsDeleteModalOpen(false);
            fetchData(currentPage);
        } catch (error: any) {
            alert(`Erreur lors de la suppression: ${error.message}`);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const { url } = await uploadImage(file);
            setFormData({ ...formData, logoUrl: url });
        } catch (error) {
            alert("Erreur lors de l'upload de l'image");
        }
    };

    const filteredBrands = brands.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="mx-auto max-w-full py-4 sm:py-6">
            <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Marques</h1>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">Gérez les marques de vos produits</p>
                </div>
                {isClient && !isInfoline() && (
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95"
                    >
                        <Plus size={18} />
                        Nouvelle Marque
                    </button>
                )}
            </div>

            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher une marque..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 dark:bg-gray-800/50 dark:border-gray-700">
                    <div className="grid grid-cols-[100px_1fr_auto] gap-4">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">#ID</span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Marque</span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 pr-10">Actions</span>
                    </div>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500 mt-4">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mb-2"></div>
                            <p>Chargement des marques...</p>
                        </div>
                    ) : filteredBrands.length === 0 ? (
                        <div className="p-16 text-center text-gray-500">
                            <Box className="mx-auto mb-3 text-gray-300" size={48} />
                            <p>{searchTerm ? "Aucun résultat trouvé" : "Aucune marque créée"}</p>
                        </div>
                    ) : (
                        filteredBrands.map(brand => (
                            <div key={brand.id} className="group grid grid-cols-[100px_1fr_auto] items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <div className="font-mono text-sm font-semibold text-indigo-600">#{brand.id}</div>
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700">
                                        {brand.logoUrl ? (
                                            <img src={brand.logoUrl} alt={brand.name} className="h-full w-full object-contain p-1" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-gray-300">
                                                <ImageIcon size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900 dark:text-white uppercase">{brand.name}</div>
                                        {brand.description && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{brand.description}</div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isClient && !isInfoline() && (
                                        <button
                                            onClick={() => handleOpenEdit(brand)}
                                            className="p-2 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg transition-colors"
                                        >
                                            <Edit size={18} />
                                        </button>
                                    )}
                                    {isClient && isAdmin() && (
                                        <button
                                            onClick={() => {
                                                setBrandToDelete(brand);
                                                setIsDeleteModalOpen(true);
                                            }}
                                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
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
                        sur <span className="font-semibold text-gray-900 dark:text-white">{totalElements}</span> marques
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

            {/* Modal Create/Edit */}
            {isEditModalOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                    onClick={() => setIsEditModalOpen(false)}
                >
                    <div 
                        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {modalMode === "create" ? "Nouvelle Marque" : "Modifier la Marque"}
                            </h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Nom de la marque <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Ex: Asus"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Détails de la marque..."
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Logo</label>
                                <div className="mt-2 flex items-center gap-4">
                                    {formData.logoUrl ? (
                                        <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200">
                                            <img src={formData.logoUrl} className="h-full w-full object-contain p-1" alt="Preview" />
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, logoUrl: "" })}
                                                className="absolute top-0 right-0 bg-red-600 text-white p-0.5 rounded-bl"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 dark:border-gray-600">
                                            <Upload className="text-gray-400" size={24} />
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                        </label>
                                    )}
                                    <span className="text-xs text-gray-500">Logo de la marque (affiché dans le carrousel)</span>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
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

            {/* Modal Delete */}
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
                            Voulez-vous supprimer la marque <span className="font-semibold text-gray-900 dark:text-white">"{brandToDelete?.name}"</span> ?
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

export default Brands;
