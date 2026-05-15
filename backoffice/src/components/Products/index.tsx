"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Image as ImageIcon,
    X,
    Upload,
    MoreVertical,
    Package,
    AlertCircle,
    Zap,
    Download,
    MinusCircle,
    PlusCircle,
    Star
} from "lucide-react";
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
    getProductById
} from "@/services/product.service";
import { getSpecKeys, createSpecKey, getSpecKeyValues } from "@/services/speckey.service";
import { getCategories } from "@/services/category.service";
import { getBrands } from "@/services/brand.service";
import { isAdmin, isWebmaster, isInfoline } from "@/services/auth.service";
import {
    Product,
    ProductCreateRequest,
    ProductUpdateRequest,
    ImageDto,
    SpecificationDto,
    SpecKey,
    StockStatus
} from "@/dtos/product.dto";
import { Brand } from "@/dtos/brand.dto";
import { Category } from "@/dtos/category.dto";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";

const Products = () => {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | "all">("all");
    const [selectedStockStatus, setSelectedStockStatus] = useState<string>("all");
    const [categorySearchTerm, setCategorySearchTerm] = useState("");
    const [showOnlyFlashSale, setShowOnlyFlashSale] = useState(false);
    const [specKeys, setSpecKeys] = useState<SpecKey[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Create Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createError, setCreateError] = useState("");
    const [newProduct, setNewProduct] = useState<ProductCreateRequest>({
        title: "",
        description: "",
        reference: "",
        regularPrice: 0,
        discountPrice: 0,
        quantity: 0,
        categoryIds: [],
        codeSage: "",
        stockStatus: "EN_STOCK",
        images: [],
        specifications: [],
        isFlashSale: false
    });

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState<ProductUpdateRequest & { id: number }>({
        id: 0,
        title: "",
        description: "",
        reference: "",
        regularPrice: 0,
        discountPrice: 0,
        quantity: 0,
        categoryIds: [],
        codeSage: "",
        stockStatus: "EN_STOCK",
        images: [],
        specifications: [],
        isFlashSale: false
    });

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

    const [isClient, setIsClient] = useState(false);
    const modalDataLoaded = useRef(false);

    useEffect(() => {
        setIsClient(true);
        fetchCategories();
        fetchProducts(0, searchTerm, selectedCategoryId, selectedStockStatus, showOnlyFlashSale);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(0);
            fetchProducts(0, searchTerm, selectedCategoryId, selectedStockStatus, showOnlyFlashSale);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm, itemsPerPage, selectedCategoryId, selectedStockStatus, showOnlyFlashSale]);

    const loadModalData = async () => {
        if (modalDataLoaded.current) return;
        modalDataLoaded.current = true;
        await Promise.all([fetchSpecKeys(), fetchBrands()]);
    };

    const fetchCategories = async () => {
        try {
            const response = await getCategories();
            if (response && 'content' in response) {
                setCategories(response.content);
            } else {
                setCategories(response as Category[]);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const fetchProducts = async (page: number = 0, search: string = "", categoryId: number | "all" = "all", stockStatus: string = "all", isFlashSale?: boolean) => {
        try {
            setLoading(true);
            const response = await getProducts(page, itemsPerPage, search, categoryId, stockStatus, isFlashSale);
            
            if (response && 'content' in response) {
                setProducts(response.content);
                setTotalPages(response.totalPages);
                setTotalElements(response.totalElements);
                setCurrentPage(page);
            } else {
                setProducts(response as Product[]);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSpecKeys = async () => {
        try {
            const response = await getSpecKeys();
            if (response && 'content' in response) {
                setSpecKeys(response.content);
            } else {
                setSpecKeys(response as SpecKey[]);
            }
        } catch (error) {
            console.error("Error fetching spec keys:", error);
        }
    };

    const fetchBrands = async () => {
        try {
            const response = await getBrands();
            if (response && 'content' in response) {
                setBrands(response.content);
            } else {
                setBrands(response as Brand[]);
            }
        } catch (error) {
            console.error("Error fetching brands:", error);
        }
    };

    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateError("");
        try {
            await createProduct(newProduct);
            setIsCreateModalOpen(false);
            setNewProduct({
                title: "",
                description: "",
                reference: "",
                regularPrice: 0,
                discountPrice: 0,
                quantity: 0,
                categoryIds: [],
                codeSage: "",
                stockStatus: "EN_STOCK",
                images: [],
                specifications: [],
                brandId: undefined,
                isFlashSale: false
            });
            fetchProducts(currentPage);
        } catch (error: any) {
            setCreateError(error.message);
        }
    };

    const handleUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { id, ...updateData } = editForm;
            await updateProduct(id, updateData);
            setIsEditModalOpen(false);
            fetchProducts(currentPage);
        } catch (error) {
            console.error("Error updating product:", error);
            alert("Erreur lors de la mise à jour");
        }
    };

    const handleDeleteProduct = async () => {
        if (!productToDelete) return;
        try {
            await deleteProduct(productToDelete.id);
            setIsDeleteModalOpen(false);
            setProductToDelete(null);
            fetchProducts(currentPage);
        } catch (error) {
            console.error("Error deleting product:", error);
            alert("Erreur lors de la suppression");
        }
    };

    const handleQuantityChange = async (product: Product, delta: number) => {
        if (!product.id) return;
        try {
            const newQuantity = Math.max(0, product.quantity + delta);
            if (newQuantity === product.quantity) return;

            await updateProduct(product.id, {
                quantity: newQuantity,
                stockStatus: newQuantity > 0 ? "EN_STOCK" : "HORS_STOCK"
            });
            fetchProducts(currentPage);
        } catch (error) {
            console.error("Error updating quantity:", error);
        }
    };

    const exportProductsCSV = () => {
        const headers = ["ID", "Titre", "Référence", "Prix Public", "Prix Promo", "Quantité", "Code Sage", "Flash Sale"];
        const rows = products.map(p => [
            p.id,
            p.title,
            p.reference || "",
            p.regularPrice,
            p.discountPrice || 0,
            p.quantity,
            p.codeSage || "",
            p.isFlashSale ? "Oui" : "Non"
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `produits_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Image Handlers
    const addImage = async (form: "create" | "edit") => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";

        input.onchange = async (e: Event) => {
            const target = e.target as HTMLInputElement;
            const file = target.files?.[0];
            if (!file) return;

            try {
                const { url } = await uploadImage(file);
                const alt = file.name.split('.')[0];
                const newImage: ImageDto = { imageUrl: url, alt };

                if (form === "create") {
                    setNewProduct({ ...newProduct, images: [...(newProduct.images || []), newImage] });
                } else {
                    setEditForm({ ...editForm, images: [...(editForm.images || []), newImage] });
                }
            } catch (error) {
                console.error("Error uploading image:", error);
                alert("Erreur lors du téléchargement");
            }
        };
        input.click();
    };

    const removeImage = (index: number, form: "create" | "edit") => {
        if (form === "create") {
            const updated = [...(newProduct.images || [])];
            updated.splice(index, 1);
            setNewProduct({ ...newProduct, images: updated });
        } else {
            const updated = [...(editForm.images || [])];
            updated.splice(index, 1);
            setEditForm({ ...editForm, images: updated });
        }
    };

    // Specification Handlers
    const addSpecification = async (form: "create" | "edit") => {
        const choice = specKeys.length > 0
            ? confirm("Voulez-vous utiliser une clé existante?\n\nOK = Utiliser une clé existante\nAnnuler = Créer une nouvelle clé")
            : false;

        let selectedKey: SpecKey | null = null;

        if (choice && specKeys.length > 0) {
            const keyList = specKeys.map(k => `${k.id}: ${k.name}`).join("\n");
            const keyIdStr = prompt(`Sélectionnez une clé:\n\n${keyList}\n\nEntrez l'ID:`);
            if (!keyIdStr) return;
            const keyId = parseInt(keyIdStr);
            selectedKey = specKeys.find(k => k.id === keyId) || null;
        } else {
            const keyName = prompt("Nom de la nouvelle clé (ex: Marque, Couleur):");
            if (!keyName) return;
            try {
                const newKey = await createSpecKey({ name: keyName });
                selectedKey = newKey;
                await fetchSpecKeys();
            } catch (error: any) {
                alert(`Erreur: ${error.message}`);
                return;
            }
        }

        if (selectedKey) {
            const value = prompt(`Valeur pour "${selectedKey.name}":`);
            if (!value) return;

            const newSpec: SpecificationDto = {
                keyId: selectedKey.id,
                keyName: selectedKey.name,
                value: value
            };

            if (form === "create") {
                setNewProduct({ ...newProduct, specifications: [...(newProduct.specifications || []), newSpec] });
            } else {
                setEditForm({ ...editForm, specifications: [...(editForm.specifications || []), newSpec] });
            }
        }
    };

    const removeSpecification = (index: number, form: "create" | "edit") => {
        if (form === "create") {
            const updated = [...(newProduct.specifications || [])];
            updated.splice(index, 1);
            setNewProduct({ ...newProduct, specifications: updated });
        } else {
            const updated = [...(editForm.specifications || [])];
            updated.splice(index, 1);
            setEditForm({ ...editForm, specifications: updated });
        }
    };

    const getStockStatusBadge = (status: StockStatus, quantity: number) => {
        // If it's explicitly set to En Arrivage or En Commande, show that even if quantity is 0
        if (status === "EN_ARRIVAGE") {
            return { label: "En Arrivage", style: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" };
        }
        if (status === "EN_COMMANDE") {
            return { label: "En Commande", style: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" };
        }

        if (quantity <= 0 || status === "HORS_STOCK") {
            return { label: "Hors Stock", style: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" };
        }

        return { label: "En Stock", style: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" };
    };

    // Inline Spec Form State (Temporary for adding)
    const [specForm, setSpecForm] = useState({ keyId: 0, value: "", isNew: false, newKeyName: "" });
    const [availableValues, setAvailableValues] = useState<string[]>([]);

    useEffect(() => {
        if (specForm.keyId > 0) {
            fetchSpecValues(specForm.keyId);
        } else {
            setAvailableValues([]);
        }
    }, [specForm.keyId]);

    const fetchSpecValues = async (keyId: number) => {
        try {
            const values = await getSpecKeyValues(keyId);
            setAvailableValues(values);
        } catch (error) {
            console.error("Error fetching spec values:", error);
        }
    };

    const handleAddSpecInline = (form: "create" | "edit") => {
        if (!specForm.value) return;

        let newSpec: SpecificationDto;
        if (specForm.isNew) {
            // This will be handled after key creation in a real scenario, 
            // but for "High Speed" we might want to just store it or prompt key creation first.
            // Let's stick to selecting existing keys for speed, and a simple toggle for new keys.
            alert("Veuillez d'abord créer la nouvelle clé ou en sélectionner une existante.");
            return;
        } else {
            const key = specKeys.find(k => k.id === specForm.keyId);
            if (!key) return;
            newSpec = { keyId: key.id, keyName: key.name, value: specForm.value };
        }

        if (form === "create") {
            setNewProduct({ ...newProduct, specifications: [...(newProduct.specifications || []), newSpec] });
        } else {
            setEditForm({ ...editForm, specifications: [...(editForm.specifications || []), newSpec] });
        }
        setSpecForm({ ...specForm, value: "" });
    };

    const highlightTechnicalTerms = (text: string) => {
        if (!text) return "";
        // Simple regex-based highlighting for common tech terms, or anything in <b>
        const techTerms = [/RAM/gi, /Core/gi, /Dual/gi, /SSD/gi, /HDR/gi, /4K/gi, /Smart/gi, /UHD/gi];
        let highlighted = text;

        techTerms.forEach(regex => {
            highlighted = highlighted.replace(regex, (match) => `<span class="text-blue-600 font-bold">${match}</span>`);
        });

        // Specific red highlights for specific words
        const cautionTerms = [/Garantie/gi, /Offert/gi, /Promo/gi, /Nouveau/gi];
        cautionTerms.forEach(regex => {
            highlighted = highlighted.replace(regex, (match) => `<span class="text-red-600 font-bold">${match}</span>`);
        });

        return highlighted;
    };

    const filteredProducts = products;

    return (
        <div className="mx-auto max-w-full py-4 sm:py-6">
            <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Produits</h1>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">Gérez votre inventaire et vos spécifications</p>
                </div>
                {isClient && !isInfoline() && (
                    <button
                        onClick={() => { loadModalData(); setIsCreateModalOpen(true); }}
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95"
                    >
                        <Plus size={18} />
                        Nouveau Produit
                    </button>
                )}
                <button
                    onClick={exportProductsCSV}
                    className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-700 active:scale-95 ml-2"
                >
                    <Download size={18} />
                    Exporter CSV
                </button>
            </div>

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher par titre, catégorie ou référence..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-indigo-500/20"
                    />
                </div>
                <div className="w-full sm:w-64">
                    <select
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value === "all" ? "all" : parseInt(e.target.value))}
                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 px-4 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-indigo-500/20"
                    >
                        <option value="all">Toutes les catégories</option>
                        {categories.map((cat, idx) => (
                            <option key={cat.id || `cat-${idx}`} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <div className="w-full sm:w-48">
                    <select
                        value={selectedStockStatus}
                        onChange={(e) => setSelectedStockStatus(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 px-4 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-indigo-500/20"
                    >
                        <option value="all">Tous les stocks</option>
                        <option value="EN_STOCK">En Stock</option>
                        <option value="EN_COMMANDE">En Commande</option>
                        <option value="EN_ARRIVAGE">En Arrivage</option>
                        <option value="HORS_STOCK">Hors Stock</option>
                    </select>
                </div>
                {/* Flash Sale Filter Toggle */}
                <button
                    onClick={() => setShowOnlyFlashSale(!showOnlyFlashSale)}
                    title={showOnlyFlashSale ? "Afficher tous les produits" : "Voir seulement les Ventes Flash"}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all border-2 whitespace-nowrap ${
                        showOnlyFlashSale
                            ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-200'
                            : 'bg-white text-amber-600 border-amber-300 hover:bg-amber-50'
                    }`}
                >
                    <Zap size={16} fill={showOnlyFlashSale ? 'currentColor' : 'none'} />
                    {showOnlyFlashSale ? `⚡ ${totalElements} Vente${totalElements !== 1 ? 's' : ''} Flash` : '⚡ Ventes Flash'}
                </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                            <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">ID</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Produit</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Référence</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Prix (DT)</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Quantité</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Catégorie</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Statut</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Code Sage</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                        {loading ? (
                            <tr key="loading-row">
                                <td colSpan={9} className="px-6 py-16 text-center text-gray-500 dark:text-gray-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
                                        Chargement des produits...
                                    </div>
                                </td>
                            </tr>
                        ) : filteredProducts.length === 0 ? (
                            <tr key="empty-row">
                                <td colSpan={9} className="px-6 py-16 text-center text-gray-500 dark:text-gray-400">
                                    <AlertCircle className="mx-auto mb-2 text-gray-300" size={32} />
                                    {searchTerm ? "Aucun produit ne correspond à votre recherche" : "Aucun produit trouvé"}
                                </td>
                            </tr>
                        ) : (
                            filteredProducts.map((product, idx) => (
                                <tr key={product.id || `prod-${idx}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-4 py-5 text-center text-xs font-mono text-gray-400">
                                        #{product.id}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            {(product.imageUrl || product.images?.[0]?.imageUrl) ? (
                                                <img 
                                                    src={product.imageUrl || product.images[0].imageUrl} 
                                                    alt={product.title} 
                                                    className="h-12 w-12 rounded-lg object-cover" 
                                                />
                                            ) : (
                                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                                                    <ImageIcon size={20} className="text-gray-400" />
                                                </div>
                                            )}
                                            <div className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{product.title}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center text-sm text-gray-600 dark:text-gray-300 font-mono">
                                        {product.reference || "-"}
                                    </td>
                                    <td className="px-6 py-5 text-center text-sm font-medium text-gray-900 dark:text-white">
                                        {product.regularPrice.toLocaleString('fr-TN', { minimumFractionDigits: 3 })} DT
                                    </td>
                                    <td className="px-6 py-5 text-center text-sm text-gray-600 dark:text-gray-300">
                                        <div className="flex items-center justify-center gap-2">
                                            {isClient && !isInfoline() && (
                                                <button 
                                                    onClick={() => handleQuantityChange(product, -1)}
                                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                    title="Diminuer"
                                                >
                                                    <MinusCircle size={16} />
                                                </button>
                                            )}
                                            <span className="min-w-[20px] font-bold">{product.quantity}</span>
                                            {isClient && !isInfoline() && (
                                                <button 
                                                    onClick={() => handleQuantityChange(product, 1)}
                                                    className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                                                    title="Augmenter"
                                                >
                                                    <PlusCircle size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center text-sm text-gray-600 dark:text-gray-300">
                                        <div className="flex flex-wrap justify-center gap-1">
                                            {product.categories && product.categories.length > 0 ? (
                                                product.categories.map((cat, idx) => (
                                                    <span key={cat.id || `pcat-${idx}`} className="inline-flex items-center rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                        {cat.name}
                                                    </span>
                                                ))
                                            ) : (
                                                "-"
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStockStatusBadge(product.stockStatus, product.quantity).style}`}>
                                                {getStockStatusBadge(product.stockStatus, product.quantity).label}
                                            </span>
                                            {product.isFlashSale && (
                                                <span className="inline-flex items-center gap-1 rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                                    ⚡ Flash Sale
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center text-sm font-mono text-gray-600 dark:text-gray-300">
                                        {product.codeSage || "-"}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => product.id && router.push(`/products/${product.id}`)}
                                                disabled={!product.id}
                                                className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                                title="Voir détails"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            {isClient && !isInfoline() && (
                                                <button
                                                    onClick={() => {
                                                        if (!product.id) return;
                                                        window.location.href = `/hero-banners?productId=${product.id}`;
                                                    }}
                                                    disabled={!product.id}
                                                    className="p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg"
                                                    title="Promouvoir en Hero Banner"
                                                >
                                                    <Star size={18} />
                                                </button>
                                            )}
                                            {isClient && !isInfoline() && (
                                                <button
                                                    onClick={async () => {
                                                        if (!product.id) return;
                                                        try {
                                                            const fullProduct = await getProductById(product.id);
                                                            setEditForm({
                                                                id: fullProduct.id,
                                                                title: fullProduct.title || "",
                                                                description: fullProduct.description || "",
                                                                reference: fullProduct.reference || "",
                                                                regularPrice: fullProduct.regularPrice || 0,
                                                                discountPrice: fullProduct.discountPrice || 0,
                                                                quantity: fullProduct.quantity || 0,
                                                                categoryIds: fullProduct.categories?.map(c => c.id) || [],
                                                                codeSage: fullProduct.codeSage || "",
                                                                stockStatus: fullProduct.stockStatus,
                                                                images: [...(fullProduct.images || [])],
                                                                specifications: [...(fullProduct.specifications || [])],
                                                                brandId: fullProduct.brand?.id,
                                                                isFlashSale: fullProduct.isFlashSale || false
                                                            });
                                                            loadModalData();
                                                            setIsEditModalOpen(true);
                                                        } catch(err) {
                                                            console.error(err);
                                                            alert("Erreur lors de la récupération des détails du produit.");
                                                        }
                                                    }}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg"
                                                    title="Modifier"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                            )}
                                            {isClient && isAdmin() && (
                                                <button
                                                    onClick={() => {
                                                        if (!product.id) return;
                                                        setProductToDelete(product);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                    disabled={!product.id}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
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
                        sur <span className="font-semibold text-gray-900 dark:text-white">{totalElements}</span> produits
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={currentPage === 0}
                            onClick={() => { const p = currentPage - 1; setCurrentPage(p); fetchProducts(p, searchTerm, selectedCategoryId, selectedStockStatus, showOnlyFlashSale); }}
                            className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Précédent
                        </button>
                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setCurrentPage(i); fetchProducts(i, searchTerm, selectedCategoryId, selectedStockStatus, showOnlyFlashSale); }}
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
                            onClick={() => { const p = currentPage + 1; setCurrentPage(p); fetchProducts(p, searchTerm, selectedCategoryId, selectedStockStatus, showOnlyFlashSale); }}
                            className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Suivant
                        </button>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                    onClick={() => { setIsCreateModalOpen(false); setCategorySearchTerm(""); }}
                >
                    <div 
                        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Nouveau Produit</h2>
                            <button onClick={() => { setIsCreateModalOpen(false); setCategorySearchTerm(""); }} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {createError && (
                            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                                {createError}
                            </div>
                        )}

                        <form onSubmit={handleCreateProduct} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Column: Basic Info */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Titre <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            value={newProduct.title}
                                            onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Référence <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            value={newProduct.reference}
                                            onChange={(e) => setNewProduct({ ...newProduct, reference: e.target.value })}
                                            placeholder="Ex: WIKI-REF-001"
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Marque</label>
                                        <select
                                            value={newProduct.brandId || ""}
                                            onChange={(e) => setNewProduct({ ...newProduct, brandId: e.target.value ? parseInt(e.target.value) : undefined })}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="">-- Sans Marque --</option>
                                            {brands.map((brand, idx) => (
                                                <option key={brand.id || `brand-${idx}`} value={brand.id}>{brand.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Catégories <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                            <input
                                                type="text"
                                                placeholder="Rechercher une catégorie..."
                                                value={categorySearchTerm}
                                                onChange={(e) => setCategorySearchTerm(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 bg-white py-1.5 pl-9 pr-4 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto rounded-lg border border-gray-300 p-3 dark:border-gray-600 dark:bg-gray-700">
                                            {categories
                                                .filter(cat => cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase()))
                                                .map((cat, idx) => (
                                                    <label key={cat.id || `create-cat-${idx}`} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 p-1 rounded transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            checked={newProduct.categoryIds.includes(cat.id)}
                                                            onChange={(e) => {
                                                                const ids = e.target.checked
                                                                    ? [...newProduct.categoryIds, cat.id]
                                                                    : newProduct.categoryIds.filter(id => id !== cat.id);
                                                                setNewProduct({ ...newProduct, categoryIds: ids });
                                                            }}
                                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                        />
                                                        <span className="text-sm text-gray-700 dark:text-gray-300">{cat.name}</span>
                                                    </label>
                                                ))}
                                            {categories.filter(cat => cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase())).length === 0 && (
                                                <div className="col-span-2 py-2 text-center text-xs text-gray-500">Aucune catégorie trouvée</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Prix Public (DT) <span className="text-red-500">*</span></label>
                                            <input
                                                type="number"
                                                step="0.001"
                                                required
                                                placeholder="Ex: 1299.000"
                                                value={newProduct.regularPrice === 0 ? '' : newProduct.regularPrice}
                                                onChange={(e) => setNewProduct({ ...newProduct, regularPrice: parseFloat(e.target.value) || 0 })}
                                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300 font-bold text-red-600">Prix Promo (DT)</label>
                                            <input
                                                type="number"
                                                step="0.001"
                                                placeholder="Ex: 999.000"
                                                value={newProduct.discountPrice === 0 ? '' : newProduct.discountPrice}
                                                onChange={(e) => setNewProduct({ ...newProduct, discountPrice: parseFloat(e.target.value) || 0 })}
                                                className="w-full rounded-lg border-2 border-red-200 px-4 py-2.5 dark:border-red-900/30 dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Quantité <span className="text-red-500">*</span></label>
                                            <input
                                                type="number"
                                                required
                                                placeholder="Ex: 10"
                                                value={newProduct.quantity === 0 ? '' : newProduct.quantity}
                                                onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) || 0 })}
                                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Code Sage</label>
                                            <input
                                                type="text"
                                                value={newProduct.codeSage || ""}
                                                onChange={(e) => setNewProduct({ ...newProduct, codeSage: e.target.value })}
                                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Description (HTML supporté)</label>
                                        <textarea
                                            rows={6}
                                            value={newProduct.description || ""}
                                            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                            placeholder="Ex: <p>Nouveau <b>Core i7</b> avec <b>16GB RAM</b> pour une performance <b>UHD</b>.</p>"
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                {/* Right Column: Specs & Media */}
                                <div className="space-y-6">
                                    {/* Images Section */}
                                    <div>
                                        <div className="mb-3 flex items-center justify-between">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Images</label>
                                            <button type="button" onClick={() => addImage("create")} className="flex items-center gap-1 text-sm text-indigo-600 hover:underline">
                                                <Upload size={16} /> Télécharger
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 max-h-[150px] overflow-y-auto pr-2">
                                            {newProduct.images?.map((img, idx) => (
                                                <div key={`img-new-${idx}-${img.imageUrl}`} className="relative group">
                                                    <img src={img.imageUrl} className="h-20 w-full rounded-lg object-cover border dark:border-gray-700" alt="" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(idx, "create")}
                                                        className="absolute -right-1 -top-1 hidden group-hover:flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Specs Section */}
                                    <div>
                                        <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-300">Spécifications Techniques</label>

                                        {/* Inline Add Spec */}
                                        <div className="mb-4 flex gap-2">
                                            <div className="mb-4 flex flex-col gap-2">
                                                <div className="flex gap-2">
                                                    <select
                                                        value={specForm.keyId}
                                                        onChange={(e) => setSpecForm({ ...specForm, keyId: parseInt(e.target.value), value: "" })}
                                                        className="flex-1 rounded-lg border border-gray-300 py-1.5 px-3 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                    >
                                                        <option value="0">Sélectionner Clé...</option>
                                                        {specKeys.map((k, idx) => (
                                                            <option key={k.id || `sk-${idx}`} value={k.id}>{k.name}</option>
                                                        ))}
                                                    </select>
                                                    <div className="flex-1 relative">
                                                        <input
                                                            type="text"
                                                            placeholder="Valeur (ex: 16GB)"
                                                            list="available-values-create"
                                                            value={specForm.value}
                                                            onChange={(e) => setSpecForm({ ...specForm, value: e.target.value })}
                                                            className="w-full rounded-lg border border-gray-300 py-1.5 px-3 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                        />
                                                        <datalist id="available-values-create">
                                                            {availableValues.map((v, i) => (
                                                                <option key={`val-new-${i}-${v}`} value={v} />
                                                            ))}
                                                        </datalist>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAddSpecInline("create")}
                                                        className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-bold text-indigo-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-indigo-400"
                                                    >
                                                        OK
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                                            {newProduct.specifications?.map((spec, idx) => (
                                                <div key={`spec-new-${idx}-${spec.keyId}`} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-1.5 dark:bg-gray-700/50">
                                                    <div className="text-xs">
                                                        <span className="font-semibold text-indigo-600">{spec.keyName}</span>: {spec.value}
                                                    </div>
                                                    <button type="button" onClick={() => removeSpecification(idx, "create")} className="text-gray-400 hover:text-red-600">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={async () => {
                                                const name = prompt("Nom de la nouvelle clé (ex: Résolution) :");
                                                if (name) {
                                                    await createSpecKey({ name: name });
                                                    fetchSpecKeys();
                                                }
                                            }}
                                            className="mt-3 text-xs text-indigo-600 hover:underline flex items-center gap-1"
                                        >
                                            <Plus size={12} /> Nouvelle clé technique
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-4 py-2">
                                        <div className="flex-1">
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Statut de Stock</label>
                                            <select
                                                value={newProduct.stockStatus}
                                                onChange={(e) => setNewProduct({ ...newProduct, stockStatus: e.target.value as StockStatus })}
                                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            >
                                                <option value="EN_STOCK">En stock</option>
                                                <option value="EN_COMMANDE">En commande</option>
                                                <option value="EN_ARRIVAGE">En arrivage</option>
                                                <option value="HORS_STOCK">Hors stock</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col items-center justify-center pt-6">
                                            <label className="mb-2 text-xs font-bold text-orange-600 uppercase tracking-wider">Flash Sale ⚡</label>
                                            <button
                                                type="button"
                                                onClick={() => setNewProduct({ ...newProduct, isFlashSale: !newProduct.isFlashSale })}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${newProduct.isFlashSale ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${newProduct.isFlashSale ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3 border-t pt-6 dark:border-gray-700">
                                <button type="button" onClick={() => { setIsCreateModalOpen(false); setCategorySearchTerm(""); }} className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-all">
                                    <X size={16} /> Annuler
                                </button>
                                <button type="submit" className="rounded-lg bg-indigo-600 px-8 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 shadow-md">Créer le Produit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                    onClick={() => { setIsEditModalOpen(false); setCategorySearchTerm(""); }}
                >
                    <div 
                        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-6 dark:bg-gray-800 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Modifier le Produit</h2>
                            <button onClick={() => { setIsEditModalOpen(false); setCategorySearchTerm(""); }} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateProduct} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Column: Basic Info */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Titre</label>
                                        <input
                                            type="text"
                                            required
                                            value={editForm.title || ""}
                                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Référence</label>
                                        <input
                                            type="text"
                                            required
                                            value={editForm.reference || ""}
                                            onChange={(e) => setEditForm({ ...editForm, reference: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Marque</label>
                                        <select
                                            value={editForm.brandId || ""}
                                            onChange={(e) => setEditForm({ ...editForm, brandId: e.target.value ? parseInt(e.target.value) : undefined })}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="">-- Sans Marque --</option>
                                            {brands.map((brand, idx) => (
                                                <option key={brand.id || `brand-edit-${idx}`} value={brand.id}>{brand.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Catégories</label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                            <input
                                                type="text"
                                                placeholder="Rechercher une catégorie..."
                                                value={categorySearchTerm}
                                                onChange={(e) => setCategorySearchTerm(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 bg-white py-1.5 pl-9 pr-4 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto rounded-lg border border-gray-300 p-3 dark:border-gray-600 dark:bg-gray-700">
                                            {categories
                                                .filter(cat => cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase()))
                                                .map((cat, idx) => (
                                                    <label key={cat.id || `edit-cat-${idx}`} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 p-1 rounded transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            checked={editForm.categoryIds?.includes(cat.id)}
                                                            onChange={(e) => {
                                                                const ids = e.target.checked
                                                                    ? [...(editForm.categoryIds || []), cat.id]
                                                                    : (editForm.categoryIds || []).filter(id => id !== cat.id);
                                                                setEditForm({ ...editForm, categoryIds: ids });
                                                            }}
                                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                        />
                                                        <span className="text-sm text-gray-700 dark:text-gray-300">{cat.name}</span>
                                                    </label>
                                                ))}
                                            {categories.filter(cat => cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase())).length === 0 && (
                                                <div className="col-span-2 py-2 text-center text-xs text-gray-500">Aucune catégorie trouvée</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Prix Public (DT)</label>
                                            <input
                                                type="number"
                                                step="0.001"
                                                value={editForm.regularPrice || 0}
                                                onChange={(e) => setEditForm({ ...editForm, regularPrice: parseFloat(e.target.value) })}
                                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300 font-bold text-red-600">Prix Promo (DT)</label>
                                            <input
                                                type="number"
                                                step="0.001"
                                                value={editForm.discountPrice || 0}
                                                onChange={(e) => setEditForm({ ...editForm, discountPrice: parseFloat(e.target.value) })}
                                                className="w-full rounded-lg border-2 border-red-200 px-4 py-2.5 dark:border-red-900/30 dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Quantité</label>
                                            <input
                                                type="number"
                                                value={editForm.quantity || 0}
                                                onChange={(e) => setEditForm({ ...editForm, quantity: parseInt(e.target.value) })}
                                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Code Sage</label>
                                            <input
                                                type="text"
                                                value={editForm.codeSage || ""}
                                                onChange={(e) => setEditForm({ ...editForm, codeSage: e.target.value })}
                                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Description (HTML supporté)</label>
                                        <textarea
                                            rows={6}
                                            value={editForm.description || ""}
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                {/* Right Column: Specs & Media */}
                                <div className="space-y-6">
                                    <div>
                                        <div className="mb-3 flex items-center justify-between">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Images</label>
                                            <button type="button" onClick={() => addImage("edit")} className="flex items-center gap-1 text-sm text-indigo-600 hover:underline">
                                                <Upload size={16} /> Télécharger
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 max-h-[150px] overflow-y-auto pr-2">
                                            {editForm.images?.map((img, idx) => (
                                                <div key={`img-edit-${idx}-${img.imageUrl}`} className="relative group">
                                                    <img src={img.imageUrl} className="h-20 w-full rounded-lg object-cover border dark:border-gray-700" alt="" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(idx, "edit")}
                                                        className="absolute -right-1 -top-1 hidden group-hover:flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-300">Spécifications Techniques</label>

                                        <div className="mb-4 flex flex-col gap-2">
                                            <div className="flex gap-2">
                                                <select
                                                    value={specForm.keyId}
                                                    onChange={(e) => setSpecForm({ ...specForm, keyId: parseInt(e.target.value), value: "" })}
                                                    className="flex-1 rounded-lg border border-gray-300 py-1.5 px-3 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                >
                                                    <option value="0">Sélectionner Clé...</option>
                                                    {specKeys.map((k, idx) => (
                                                        <option key={k.id || `sk-edit-${idx}`} value={k.id}>{k.name}</option>
                                                    ))}
                                                </select>
                                                <div className="flex-1 relative">
                                                    <input
                                                        type="text"
                                                        placeholder="Valeur"
                                                        list="available-values-edit"
                                                        value={specForm.value}
                                                        onChange={(e) => setSpecForm({ ...specForm, value: e.target.value })}
                                                        className="w-full rounded-lg border border-gray-300 py-1.5 px-3 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                    />
                                                    <datalist id="available-values-edit">
                                                        {availableValues.map((v, i) => (
                                                            <option key={`val-edit-${i}-${v}`} value={v} />
                                                        ))}
                                                    </datalist>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddSpecInline("edit")}
                                                    className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-bold text-indigo-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-indigo-400"
                                                >
                                                    OK
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                                            {editForm.specifications?.map((spec, idx) => (
                                                <div key={`spec-edit-${idx}-${spec.keyId}`} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-1.5 dark:bg-gray-700/50">
                                                    <div className="text-xs">
                                                        <span className="font-semibold text-indigo-600">{spec.keyName}</span>: {spec.value}
                                                    </div>
                                                    <button type="button" onClick={() => removeSpecification(idx, "edit")} className="text-gray-400 hover:text-red-600">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 py-2">
                                        <div className="flex-1">
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Statut de Stock</label>
                                            <select
                                                value={editForm.stockStatus}
                                                onChange={(e) => setEditForm({ ...editForm, stockStatus: e.target.value as StockStatus })}
                                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            >
                                                <option value="EN_STOCK">En stock</option>
                                                <option value="EN_COMMANDE">En commande</option>
                                                <option value="EN_ARRIVAGE">En arrivage</option>
                                                <option value="HORS_STOCK">Hors stock</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col items-center justify-center pt-6">
                                            <label className="mb-2 text-xs font-bold text-orange-600 uppercase tracking-wider">Flash Sale ⚡</label>
                                            <button
                                                type="button"
                                                onClick={() => setEditForm({ ...editForm, isFlashSale: !editForm.isFlashSale })}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${editForm.isFlashSale ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editForm.isFlashSale ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3 border-t pt-6 dark:border-gray-700">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="rounded-lg px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">Annuler</button>
                                <button type="submit" className="rounded-lg bg-indigo-600 px-8 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 shadow-md">Enregistrer les modifications</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && productToDelete && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                    onClick={() => {
                        setIsDeleteModalOpen(false);
                        setProductToDelete(null);
                    }}
                >
                    <div 
                        className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
                                <AlertCircle size={24} />
                            </div>
                            <button 
                                onClick={() => { setIsDeleteModalOpen(false); setProductToDelete(null); }} 
                                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Confirmer la suppression</h2>
                        <p className="mb-6 text-gray-500 dark:text-gray-400">
                            Êtes-vous sûr de vouloir supprimer le produit <span className="font-bold text-gray-900 dark:text-white">"{productToDelete.title}"</span> ? Cette action est irréversible.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setProductToDelete(null);
                                }}
                                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-all"
                            >
                                <X size={16} /> Annuler
                            </button>
                            <button
                                onClick={handleDeleteProduct}
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

export default Products;
