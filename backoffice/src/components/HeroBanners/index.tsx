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
    AlertCircle,
    Check,
    Power
} from "lucide-react";
import {
    getHeroBanners,
    createHeroBanner,
    updateHeroBanner,
    deleteHeroBanner,
    toggleHeroBannerActive
} from "@/services/heroBanner.service";
import { getProducts, uploadImage } from "@/services/product.service";
import { getCategories } from "@/services/category.service";
import { HeroBanner, HeroBannerCreateRequest, HeroBannerUpdateRequest } from "@/dtos/hero-banner.dto";
import { Product } from "@/dtos/product.dto";
import { Category } from "@/dtos/category.dto";

const HeroBanners = () => {
    const [banners, setBanners] = useState<HeroBanner[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [productSearch, setProductSearch] = useState("");
    const [categorySearch, setCategorySearch] = useState("");

    // Modals State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [bannerToDelete, setBannerToDelete] = useState<HeroBanner | null>(null);

    const [formError, setFormError] = useState("");

    const [newBanner, setNewBanner] = useState<HeroBannerCreateRequest>({
        title: "",
        description: "",
        imageUrl: "",
        linkUrl: "",
        buttonText: "Achetez maintenant",
        emplacement: "HOME_SLIDER",
        active: true,
        displayOrder: 0
    });

    const [editForm, setEditForm] = useState<HeroBannerUpdateRequest & { id: number }>({
        id: 0,
        title: "",
        description: "",
        imageUrl: "",
        linkUrl: "",
        buttonText: "",
        emplacement: "",
        active: true,
        displayOrder: 0
    });

    useEffect(() => {
        fetchBanners();
        fetchAllProducts();
        fetchAllCategories();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const data = await getHeroBanners();
            setBanners(data);
        } catch (error) {
            console.error("Error fetching banners:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllProducts = async () => {
        try {
            const data = await getProducts();
            setAllProducts(data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const fetchAllCategories = async () => {
        try {
            const data = await getCategories();
            setAllCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const getLinkType = (url: string) => {
        if (!url) return "Aucun";
        if (url.startsWith("/products/")) return "Produit";
        if (url.startsWith("/categories/")) return "Catégorie";
        if (url.startsWith("http")) return "Externe";
        return "Interne";
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");
        if (!newBanner.imageUrl) {
            setFormError("Une image est requise");
            return;
        }
        try {
            await createHeroBanner(newBanner);
            setIsCreateModalOpen(false);
            setNewBanner({
                title: "",
                description: "",
                imageUrl: "",
                linkUrl: "",
                buttonText: "Achetez maintenant",
                emplacement: "HOME_SLIDER",
                active: true,
                displayOrder: 0
            });
            fetchBanners();
        } catch (error: any) {
            setFormError(error.message);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { id, ...updateData } = editForm;
            await updateHeroBanner(id, updateData);
            setIsEditModalOpen(false);
            fetchBanners();
        } catch (error) {
            console.error("Error updating banner:", error);
            alert("Erreur lors de la mise à jour");
        }
    };

    const handleDelete = async () => {
        if (!bannerToDelete) return;
        try {
            await deleteHeroBanner(bannerToDelete.id);
            setIsDeleteModalOpen(false);
            setBannerToDelete(null);
            fetchBanners();
        } catch (error) {
            console.error("Error deleting banner:", error);
            alert("Erreur lors de la suppression");
        }
    };

    const handleToggleActive = async (id: number) => {
        try {
            await toggleHeroBannerActive(id);
            fetchBanners();
        } catch (error) {
            console.error("Error toggling banner status:", error);
        }
    };

    const handleImageUpload = async (file: File, form: "create" | "edit") => {
        try {
            const { url } = await uploadImage(file);
            if (form === "create") {
                setNewBanner({ ...newBanner, imageUrl: url });
            } else {
                setEditForm({ ...editForm, imageUrl: url });
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Erreur lors du téléchargement");
        }
    };

    const filteredBanners = banners.filter(b =>
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.description.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    return (
        <div className="mx-auto max-w-7xl p-4 sm:p-6">
            <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Bannières Hero</h1>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">Gérez les bannières publicitaires de la page d'accueil</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95"
                >
                    <Plus size={18} />
                    Nouvelle Bannière
                </button>
            </div>

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher par titre ou description..."
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
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Image</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Infos</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Emplacement</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Ordre</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Statut</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
                                        Chargement...
                                    </div>
                                </td>
                            </tr>
                        ) : filteredBanners.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                                    <AlertCircle className="mx-auto mb-2 text-gray-300" size={32} />
                                    Aucune bannière trouvée
                                </td>
                            </tr>
                        ) : (
                            filteredBanners.map((banner) => (
                                <tr key={banner.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-5">
                                        <img src={banner.imageUrl} alt={banner.title} className="h-16 w-32 rounded-lg object-cover border dark:border-gray-700 shadow-sm" />
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="font-medium text-gray-900 dark:text-white">{banner.title}</div>
                                        <div className="text-xs text-gray-500 line-clamp-1">{banner.description}</div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`text-[10px] px-2 py-1 rounded-md font-bold text-white uppercase ${banner.emplacement === "HOME_SLIDER" ? "bg-indigo-500" :
                                            banner.emplacement === "HOME_PROMOTION" ? "bg-amber-500" :
                                                "bg-purple-500"
                                            }`}>
                                            {banner.emplacement === "HOME_SLIDER" ? "Slider" :
                                                banner.emplacement === "HOME_PROMOTION" ? "Promotion" :
                                                    banner.emplacement}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-center text-gray-600 dark:text-gray-300">
                                        {banner.displayOrder}
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <button
                                            onClick={() => handleToggleActive(banner.id)}
                                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${banner.active
                                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                                }`}
                                        >
                                            {banner.active ? <Power size={12} /> : <Power size={12} />}
                                            {banner.active ? "Actif" : "Inactif"}
                                        </button>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditForm({
                                                        id: banner.id,
                                                        title: banner.title,
                                                        description: banner.description,
                                                        imageUrl: banner.imageUrl,
                                                        linkUrl: banner.linkUrl || "",
                                                        buttonText: banner.buttonText || "",
                                                        emplacement: banner.emplacement || "HOME_SLIDER",
                                                        active: banner.active,
                                                        displayOrder: banner.displayOrder || 0
                                                    });
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setBannerToDelete(banner);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create/Edit Modal Content Template */}
            {(isCreateModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {isCreateModalOpen ? "Nouvelle Bannière" : "Modifier la Bannière"}
                            </h2>
                            <button
                                onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); setFormError(""); }}
                                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {formError && (
                            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                                {formError}
                            </div>
                        )}

                        <form onSubmit={isCreateModalOpen ? handleCreate : handleUpdate} className="space-y-6">
                            {/* Live Preview Section */}
                            <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10">
                                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                                    <ImageIcon size={14} />
                                    Aperçu en temps réel
                                </h3>
                                <div className="flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                    <div className="flex-1 space-y-2">
                                        <div
                                            className="text-cyan-800 dark:text-cyan-300 text-lg font-bold line-clamp-1"
                                            dangerouslySetInnerHTML={{ __html: (isCreateModalOpen ? newBanner.title : editForm.title) || "Titre de la bannière" }}
                                        />
                                        <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-2">
                                            {(isCreateModalOpen ? newBanner.description : editForm.description) || "Votre description publicitaire s'affichera ici..."}
                                        </p>
                                        <div className="inline-block px-4 py-1.5 bg-amber-500 text-white text-xs font-bold rounded">
                                            {(isCreateModalOpen ? newBanner.buttonText : editForm.buttonText) || "Bouton"}
                                        </div>
                                    </div>
                                    <div className="w-24 h-16 rounded overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center border dark:border-gray-700">
                                        {(isCreateModalOpen ? newBanner.imageUrl : editForm.imageUrl) ? (
                                            <img src={isCreateModalOpen ? newBanner.imageUrl : editForm.imageUrl} className="w-full h-full object-contain" alt="Aperçu" />
                                        ) : (
                                            <ImageIcon className="text-gray-300" size={24} />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Titre <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={isCreateModalOpen ? newBanner.title : editForm.title}
                                        onChange={(e) => isCreateModalOpen
                                            ? setNewBanner({ ...newBanner, title: e.target.value })
                                            : setEditForm({ ...editForm, title: e.target.value })
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                    <textarea
                                        rows={2}
                                        value={isCreateModalOpen ? newBanner.description : editForm.description}
                                        onChange={(e) => isCreateModalOpen
                                            ? setNewBanner({ ...newBanner, description: e.target.value })
                                            : setEditForm({ ...editForm, description: e.target.value })
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                {/* Selectors */}
                                <div className="space-y-4 md:col-span-2 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Assistants de lien rapide</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-1.5 block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase">Lier à un Produit</label>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                                <input
                                                    type="text"
                                                    placeholder="Rechercher un produit..."
                                                    value={productSearch}
                                                    onChange={(e) => { setProductSearch(e.target.value); setCategorySearch(""); }}
                                                    className="w-full rounded-lg border border-gray-300 bg-white py-1.5 pl-9 pr-4 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm"
                                                />
                                                {productSearch && (
                                                    <div className="absolute z-50 mt-1 max-h-40 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                                        {allProducts
                                                            .filter(p => p.title.toLowerCase().includes(productSearch.toLowerCase()))
                                                            .map(product => (
                                                                <button
                                                                    key={product.id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const url = `/products/${product.id}`;
                                                                        const current = isCreateModalOpen ? newBanner : editForm;
                                                                        const setter = isCreateModalOpen ? setNewBanner : setEditForm;
                                                                        setter({
                                                                            ...current,
                                                                            linkUrl: url,
                                                                            title: current.title || product.title,
                                                                            imageUrl: current.imageUrl || product.imageUrl || ""
                                                                        } as any);
                                                                        setProductSearch("");
                                                                    }}
                                                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                                                >
                                                                    <div className="h-6 w-8 rounded bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                                                        {product.imageUrl && <img src={product.imageUrl} className="w-full h-full object-cover" />}
                                                                    </div>
                                                                    <span className="truncate">{product.title}</span>
                                                                </button>
                                                            ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase">Lier à une Catégorie</label>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                                <input
                                                    type="text"
                                                    placeholder="Rechercher une catégorie..."
                                                    value={categorySearch}
                                                    onChange={(e) => { setCategorySearch(e.target.value); setProductSearch(""); }}
                                                    className="w-full rounded-lg border border-gray-300 bg-white py-1.5 pl-9 pr-4 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm"
                                                />
                                                {categorySearch && (
                                                    <div className="absolute z-50 mt-1 max-h-40 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                                        {allCategories
                                                            .filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()))
                                                            .map(category => (
                                                                <button
                                                                    key={category.id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const url = `/categories/${category.id}`;
                                                                        const current = isCreateModalOpen ? newBanner : editForm;
                                                                        const setter = isCreateModalOpen ? setNewBanner : setEditForm;
                                                                        setter({
                                                                            ...current,
                                                                            linkUrl: url,
                                                                            title: current.title || category.name
                                                                        } as any);
                                                                        setCategorySearch("");
                                                                    }}
                                                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                                                >
                                                                    <div className="h-2 w-2 rounded-full bg-purple-500" />
                                                                    <span className="truncate">{category.name}</span>
                                                                </button>
                                                            ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Lien URL définitif</label>
                                    <input
                                        type="text"
                                        value={isCreateModalOpen ? newBanner.linkUrl : editForm.linkUrl}
                                        onChange={(e) => isCreateModalOpen
                                            ? setNewBanner({ ...newBanner, linkUrl: e.target.value })
                                            : setEditForm({ ...editForm, linkUrl: e.target.value })
                                        }
                                        placeholder="Ex: /products/1"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Texte du Bouton</label>
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={isCreateModalOpen ? newBanner.buttonText : editForm.buttonText}
                                            onChange={(e) => isCreateModalOpen
                                                ? setNewBanner({ ...newBanner, buttonText: e.target.value })
                                                : setEditForm({ ...editForm, buttonText: e.target.value })
                                            }
                                            placeholder="Ex: Achetez maintenant"
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <div className="flex flex-wrap gap-1.5">
                                            {["Achetez maintenant", "Voir les offres", "Découvrez", "En savoir plus"].map(text => (
                                                <button
                                                    key={text}
                                                    type="button"
                                                    onClick={() => isCreateModalOpen
                                                        ? setNewBanner({ ...newBanner, buttonText: text })
                                                        : setEditForm({ ...editForm, buttonText: text })
                                                    }
                                                    className="text-[10px] bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300"
                                                >
                                                    {text}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Emplacement (Position sur la page)</label>
                                    <select
                                        value={isCreateModalOpen ? newBanner.emplacement : editForm.emplacement}
                                        onChange={(e) => isCreateModalOpen
                                            ? setNewBanner({ ...newBanner, emplacement: e.target.value })
                                            : setEditForm({ ...editForm, emplacement: e.target.value })
                                        }
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="" disabled>Sélectionner un emplacement...</option>
                                        <option value="HOME_SLIDER">Haut de page (Slider)</option>
                                        <option value="HOME_PROMOTION">Milieu de page (Promotion)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Ordre d'affichage</label>
                                    <input
                                        type="number"
                                        value={isCreateModalOpen ? newBanner.displayOrder : editForm.displayOrder}
                                        onChange={(e) => isCreateModalOpen
                                            ? setNewBanner({ ...newBanner, displayOrder: parseInt(e.target.value) || 0 })
                                            : setEditForm({ ...editForm, displayOrder: parseInt(e.target.value) || 0 })
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div className="flex items-center gap-2 pt-8">
                                    <input
                                        type="checkbox"
                                        id="active-toggle"
                                        checked={isCreateModalOpen ? newBanner.active : editForm.active}
                                        onChange={(e) => isCreateModalOpen
                                            ? setNewBanner({ ...newBanner, active: e.target.checked })
                                            : setEditForm({ ...editForm, active: e.target.checked })
                                        }
                                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="active-toggle" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Actif</label>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Image Marketing <span className="text-red-500"> (ou image produit par défaut)</span></label>
                                <div className="flex flex-col gap-4">
                                    {(isCreateModalOpen ? newBanner.imageUrl : editForm.imageUrl) && (
                                        <div className="relative w-full aspect-[21/9] rounded-lg overflow-hidden border dark:border-gray-700 shadow-inner bg-gray-100 dark:bg-gray-900">
                                            <img
                                                src={isCreateModalOpen ? newBanner.imageUrl : editForm.imageUrl}
                                                className="w-full h-full object-contain"
                                                alt="Preview"
                                            />
                                            <div className="absolute top-2 right-2 flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => isCreateModalOpen
                                                        ? setNewBanner({ ...newBanner, imageUrl: "" })
                                                        : setEditForm({ ...editForm, imageUrl: "" })
                                                    }
                                                    className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow-lg transition-colors"
                                                    title="Supprimer l'image"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-center w-full">
                                        <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-800/50 hover:bg-indigo-50 border-gray-300 dark:border-gray-600 hover:border-indigo-400 transition-all`}>
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className="w-6 h-6 mb-2 text-gray-400" />
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    <span className="font-semibold text-indigo-600">Télécharger une image marketing</span>
                                                </p>
                                                <p className="text-[10px] text-gray-400">JPG, PNG, WEBP (Format recommandé 21:9)</p>
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleImageUpload(file, isCreateModalOpen ? "create" : "edit");
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3 border-t pt-6 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); setFormError(""); }}
                                    className="rounded-lg px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-lg bg-indigo-600 px-8 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 shadow-md"
                                >
                                    {isCreateModalOpen ? "Créer la Bannière" : "Enregistrer les modifications"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
                            <AlertCircle size={24} />
                        </div>
                        <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Confirmer la suppression</h2>
                        <p className="mb-6 text-gray-500 dark:text-gray-400">
                            Êtes-vous sûr de vouloir supprimer la bannière <strong>{bannerToDelete?.title}</strong> ? Cette action est irréversible.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDelete}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HeroBanners;
