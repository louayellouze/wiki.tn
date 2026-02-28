"use client";

import React, { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    ChevronRight,
    ChevronDown,
    Image as ImageIcon,
    X,
    Upload,
    FolderTree,
    AlertCircle
} from "lucide-react";
import {
    getCategories,
    getCategoryTree,
    createCategory,
    updateCategory,
    deleteCategory
} from "@/services/category.service";
import { Category, CategoryRequest } from "@/dtos/category.dto";
import { uploadImage } from "@/services/product.service";
import { isAdmin, isWebmaster, isInfoline } from "@/services/auth.service";

const CategoryItem = ({
    category,
    level = 0,
    onEdit,
    onDelete,
    isLast = false
}: {
    category: Category;
    level?: number;
    onEdit: (cat: Category) => void;
    onDelete: (cat: Category) => void;
    isLast?: boolean;
}) => {
    const [isExpanded, setIsExpanded] = useState(level < 1); // Expand first level by default
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    const hasSubCategories = category.subCategories && category.subCategories.length > 0;
    const subCount = category.subCategories?.length || 0;

    return (
        <div className="relative w-full">
            {/* Professional Tree Line Guides */}
            {level > 0 && (
                <>
                    {/* Vertical line from parent */}
                    <div
                        className="absolute left-0 top-0 border-l-2 border-gray-200 dark:border-gray-700"
                        style={{ marginLeft: `${(level - 1) * 24 + 26}px`, height: isLast ? "24px" : "100%" }}
                    />
                    {/* Horizontal connector to item */}
                    <div
                        className="absolute top-[24px] border-t-2 border-gray-200 dark:border-gray-700"
                        style={{ marginLeft: `${(level - 1) * 24 + 26}px`, width: "20px" }}
                    />
                </>
            )}

            <div
                className={`group flex items-center justify-between border-b border-gray-100 py-3 dark:border-gray-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all duration-200 ${level > 0 ? "" : "bg-white dark:bg-gray-800"}`}
                style={{ paddingLeft: `${level * 24 + 16}px`, paddingRight: "16px" }}
            >
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`flex h-6 w-6 items-center justify-center rounded-md transition-all hover:bg-gray-200 dark:hover:bg-gray-700 ${!hasSubCategories ? "invisible" : "bg-gray-100 dark:bg-gray-800"}`}
                    >
                        {isExpanded ? <ChevronDown size={14} className="text-gray-600 dark:text-gray-400" /> : <ChevronRight size={14} className="text-gray-600 dark:text-gray-400" />}
                    </button>

                    <div className="relative">
                        {category.imageUrl ? (
                            <img src={category.imageUrl} alt={category.name} className="h-10 w-10 min-w-[40px] rounded-lg border border-gray-200 object-cover dark:border-gray-700 shadow-sm" />
                        ) : (
                            <div className={`flex h-10 w-10 min-w-[40px] items-center justify-center rounded-lg border shadow-sm transition-colors ${isExpanded && hasSubCategories ? "bg-indigo-100 border-indigo-200 text-indigo-600" : "bg-gray-100 border-gray-200 text-gray-400 dark:bg-gray-800 dark:border-gray-700"}`}>
                                {hasSubCategories ? (
                                    <FolderTree size={18} className={isExpanded ? "scale-110" : ""} />
                                ) : (
                                    <ImageIcon size={18} />
                                )}
                            </div>
                        )}
                        {subCount > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm ring-1 ring-white">
                                {subCount}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <div className={`text-sm font-bold tracking-tight uppercase transition-colors ${level === 0 ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                            {category.name}
                        </div>
                        {category.description && (
                            <div className="text-[11px] text-gray-400 dark:text-gray-500 line-clamp-1 italic max-w-xs">
                                {category.description}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {mounted && !isInfoline() && (
                        <button
                            onClick={() => onEdit(category)}
                            className="p-2 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg transition-colors"
                            title="Modifier"
                        >
                            <Edit size={16} />
                        </button>
                    )}
                    {mounted && isAdmin() && (
                        <button
                            onClick={() => onDelete(category)}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                            title="Supprimer"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>

            {isExpanded && hasSubCategories && (
                <div className="w-full">
                    {category.subCategories!.map((sub, idx) => (
                        <CategoryItem
                            key={sub.id}
                            category={sub}
                            level={level + 1}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            isLast={idx === category.subCategories!.length - 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const Categories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [flatCategories, setFlatCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [formData, setFormData] = useState<CategoryRequest & { id?: number }>({
        name: "",
        description: "",
        imageUrl: "",
        parentId: undefined
    });

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [tree, flat] = await Promise.all([getCategoryTree(), getCategories()]);
            setCategories(tree);
            setFlatCategories(flat);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setModalMode("create");
        setFormData({ name: "", description: "", imageUrl: "", parentId: undefined });
        setIsEditModalOpen(true);
    };

    const handleOpenEdit = (cat: Category) => {
        setModalMode("edit");
        setFormData({
            id: cat.id,
            name: cat.name,
            description: cat.description || "",
            imageUrl: cat.imageUrl || "",
            parentId: cat.parentId
        });
        setIsEditModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Case-insensitive duplicate check
        const isDuplicate = flatCategories.some(cat =>
            cat.name.toLowerCase() === formData.name.toLowerCase() &&
            cat.id !== formData.id
        );

        if (isDuplicate) {
            alert(`Erreur: Une catégorie nommée "${formData.name}" existe déjà.`);
            return;
        }

        try {
            if (modalMode === "create") {
                await createCategory(formData);
            } else {
                await updateCategory(formData.id!, formData);
            }
            setIsEditModalOpen(false);
            fetchData();
        } catch (error: any) {
            alert(`Erreur: ${error.message}`);
        }
    };

    const handleDelete = async () => {
        if (!categoryToDelete) return;
        try {
            await deleteCategory(categoryToDelete.id);
            setIsDeleteModalOpen(false);
            fetchData();
        } catch (error: any) {
            alert(`Erreur lors de la suppression: ${error.message}`);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const { url } = await uploadImage(file);
            setFormData({ ...formData, imageUrl: url });
        } catch (error) {
            alert("Erreur lors de l'upload de l'image");
        }
    };

    const filterTree = (cats: Category[]): Category[] => {
        if (!searchTerm) return cats;
        return cats.map(cat => ({
            ...cat,
            subCategories: cat.subCategories ? filterTree(cat.subCategories) : []
        })).filter(cat =>
            cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (cat.subCategories && cat.subCategories.length > 0)
        );
    };

    const filteredCategories = filterTree(categories);

    return (
        <div className="mx-auto max-w-full py-4 sm:py-6">
            <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hiérarchie des Catégories</h1>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">Gérez vos catégories mères et filles</p>
                </div>
                {isClient && !isInfoline() && (
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95"
                    >
                        <Plus size={18} />
                        Nouvelle Catégorie
                    </button>
                )}
            </div>

            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher une catégorie..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 dark:bg-gray-800/50 dark:border-gray-700">
                    <div className="grid grid-cols-[1fr_auto] gap-4">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Désignation</span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 pr-10">Actions</span>
                    </div>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500 mt-4">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mb-2"></div>
                            <p>Chargement des catégories...</p>
                        </div>
                    ) : filteredCategories.length === 0 ? (
                        <div className="p-16 text-center text-gray-500">
                            <FolderTree className="mx-auto mb-3 text-gray-300" size={48} />
                            <p>{searchTerm ? "Aucun résultat trouvé" : "Aucune catégorie créée"}</p>
                        </div>
                    ) : (
                        filteredCategories.map(cat => (
                            <CategoryItem
                                key={cat.id}
                                category={cat}
                                onEdit={handleOpenEdit}
                                onDelete={(cat) => {
                                    setCategoryToDelete(cat);
                                    setIsDeleteModalOpen(true);
                                }}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Modal Create/Edit */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {modalMode === "create" ? "Nouvelle Catégorie" : "Modifier la Catégorie"}
                            </h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Nom de la catégorie <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Ex: INFORMATIQUE"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Détails de la catégorie..."
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Catégorie Mère (Parent)</label>
                                <select
                                    value={formData.parentId || ""}
                                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value ? parseInt(e.target.value) : undefined })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">-- Racine (Root) --</option>
                                    {flatCategories
                                        .filter(c => c.id !== formData.id) // Prevent self-parenting
                                        .map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))
                                    }
                                </select>
                                <p className="mt-1 text-xs text-gray-400">Laissez vide si c'est une catégorie de premier niveau.</p>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Image</label>
                                <div className="mt-2 flex items-center gap-4">
                                    {formData.imageUrl ? (
                                        <div className="relative h-20 w-20 overflow-hidden rounded-lg border">
                                            <img src={formData.imageUrl} className="h-full w-full object-cover" alt="Preview" />
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, imageUrl: "" })}
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
                                    <span className="text-xs text-gray-500">Supporte le format Base64</span>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    Annuler
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                            <Trash2 className="text-red-600" size={24} />
                        </div>
                        <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Confirmer la suppression</h3>
                        <p className="mb-6 text-gray-500 dark:text-gray-400">
                            Voulez-vous supprimer la catégorie <span className="font-semibold text-gray-900 dark:text-white">"{categoryToDelete?.name}"</span> ?
                            <br />
                            <span className="text-red-500 text-sm">Attention : Toutes les sous-catégories seront également supprimées.</span>
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">Annuler</button>
                            <button onClick={handleDelete} className="rounded-lg bg-red-600 px-6 py-2 text-sm font-semibold text-white hover:bg-red-700">Supprimer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
