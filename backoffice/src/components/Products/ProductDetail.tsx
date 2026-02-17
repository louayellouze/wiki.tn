"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProductById } from "@/services/product.service";
import { Product, StockStatus } from "@/dtos/product.dto";
import {
    Package,
    ChevronLeft,
    Tag,
    Layers,
    Info,
    CheckCircle2,
    Clock,
    AlertCircle,
    ShoppingCart,
    Code,
    CreditCard
} from "lucide-react";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

const ProductDetail = () => {
    const { id } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        if (id) {
            fetchProduct(Number(id));
        }
    }, [id]);

    const fetchProduct = async (productId: number) => {
        try {
            setLoading(true);
            const data = await getProductById(productId);
            setProduct(data);
        } catch (error) {
            console.error("Error fetching product:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStockStatus = (status: StockStatus, quantity: number) => {
        if (quantity <= 0) {
            return { label: "Hors Stock", style: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: <AlertCircle size={14} /> };
        }
        switch (status) {
            case "EN_STOCK":
                return { label: "En Stock", style: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: <CheckCircle2 size={14} /> };
            case "EN_COMMANDE":
                return { label: "En Commande", style: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: <ShoppingCart size={14} /> };
            case "EN_ARRIVAGE":
                return { label: "En Arrivage", style: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: <Clock size={14} /> };
            case "HORS_STOCK":
                return { label: "Hors Stock", style: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: <AlertCircle size={14} /> };
            default:
                return { label: status, style: "bg-gray-100 text-gray-700", icon: <Info size={14} /> };
        }
    };

    const highlightTechnicalTerms = (text: string) => {
        if (!text) return "";
        const techTerms = [/RAM/gi, /Core/gi, /Dual/gi, /SSD/gi, /HDR/gi, /4K/gi, /Smart/gi, /UHD/gi, /NVMe/gi, /RTX/gi, /Ryzen/gi, /Intel/gi];
        let highlighted = text;
        techTerms.forEach(regex => {
            highlighted = highlighted.replace(regex, (match) => `<span class="text-blue-600 dark:text-blue-400 font-bold">${match}</span>`);
        });
        const promoTerms = [/Garantie/gi, /Offert/gi, /Promo/gi, /Nouveau/gi, /Remise/gi, /Réduction/gi];
        promoTerms.forEach(regex => {
            highlighted = highlighted.replace(regex, (match) => `<span class="text-red-600 dark:text-red-400 font-bold">${match}</span>`);
        });
        return highlighted;
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-red-100 p-6 dark:bg-red-900/20">
                    <Package className="h-12 w-12 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold dark:text-white">Produit non trouvé</h2>
                <Link href="/products" className="text-indigo-600 hover:underline flex items-center gap-2">
                    <ChevronLeft size={16} /> Retour à la liste
                </Link>
            </div>
        );
    }

    const stock = getStockStatus(product.stockStatus, product.quantity);

    return (
        <div className="mx-auto max-w-7xl">
            <Breadcrumb pageName={product.title} />

            <Link href="/products" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 dark:text-gray-400 transition-colors">
                <ChevronLeft size={18} /> Retour à la gestion des produits
            </Link>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                {/* Image Section */}
                <div className="lg:col-span-5 space-y-4">
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <img
                            src={product.images?.[activeImage]?.imageUrl || "/placeholder.png"}
                            alt={product.title}
                            className="aspect-square w-full object-cover"
                        />
                    </div>
                    {product.images && product.images.length > 1 && (
                        <div className="grid grid-cols-5 gap-2">
                            {product.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    className={`relative overflow-hidden rounded-lg border-2 transition-all ${activeImage === idx ? 'border-indigo-600 ring-2 ring-indigo-600/20' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                >
                                    <img src={img.imageUrl} alt="" className="aspect-square object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="lg:col-span-7 space-y-8">
                    <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                            <div className="flex flex-wrap gap-2">
                                {product.categories && product.categories.length > 0 ? (
                                    product.categories.map((cat) => (
                                        <span key={cat.id} className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                                            <Tag size={12} />
                                            {cat.name}
                                        </span>
                                    ))
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                                        Sans catégorie
                                    </span>
                                )}
                            </div>
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${stock.style}`}>
                                {stock.icon}
                                {stock.label}
                            </span>
                        </div>

                        <h1 className="mb-4 text-3xl font-black text-gray-900 dark:text-white lg:text-4xl">
                            {product.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-4 mb-8">
                            <div className="font-mono text-sm text-gray-500 flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900/50 px-2 py-1 rounded">
                                <Code size={16} className="text-indigo-500" />
                                <span className="text-gray-400 uppercase text-[10px] font-bold">Sage:</span>
                                <span>{product.codeSage || "N/A"}</span>
                            </div>
                            <div className="font-mono text-sm text-gray-500 flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900/50 px-2 py-1 rounded border border-indigo-100 dark:border-indigo-900/30">
                                <Info size={16} className="text-indigo-500" />
                                <span className="text-gray-400 uppercase text-[10px] font-bold">Réf:</span>
                                <span className="font-bold text-gray-900 dark:text-white">{product.reference || "N/A"}</span>
                            </div>
                            <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
                            <div className="text-sm text-gray-500 flex items-center gap-1.5">
                                <Layers size={16} className="text-gray-400" />
                                {product.quantity} en stock
                            </div>
                        </div>

                        {/* Pricing Section */}
                        <div className="mb-10 rounded-2xl bg-gray-50 p-6 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700">
                            <div className="flex flex-col sm:flex-row sm:items-end gap-6">
                                {product.discountPrice && product.discountPrice > 0 ? (
                                    <>
                                        <div className="space-y-1">
                                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Prix Initial</span>
                                            <div className="text-2xl font-bold text-gray-400 line-through">
                                                {product.regularPrice.toLocaleString('fr-TN')} <span className="text-sm font-normal">DT</span>
                                            </div>
                                        </div>
                                        <div className="hidden sm:block h-10 w-px bg-gray-200 dark:bg-gray-700"></div>
                                        <div className="space-y-1">
                                            <span className="inline-flex items-center gap-1 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-black uppercase text-red-600 dark:bg-red-900/30">Promotion</span>
                                            <div className="text-4xl font-black text-red-600">
                                                {product.discountPrice.toLocaleString('fr-TN')} <span className="text-lg font-bold">DT</span>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:mt-0 sm:ml-auto">
                                            <div className="rounded-lg bg-red-600 px-4 py-2 text-center text-sm font-black text-white shadow-lg shadow-red-200 dark:shadow-none">
                                                -{Math.round((1 - product.discountPrice / product.regularPrice) * 100)}% de réduction
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-1">
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Prix Public</span>
                                        <div className="text-4xl font-black text-gray-900 dark:text-white">
                                            {product.regularPrice.toLocaleString('fr-TN')} <span className="text-lg font-bold">DT</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                                <Info size={20} className="text-indigo-600" />
                                Description
                            </h3>
                            <div
                                className="prose prose-indigo max-w-none text-gray-600 dark:text-gray-300 dark:prose-invert"
                                dangerouslySetInnerHTML={{ __html: highlightTechnicalTerms(product.description) }}
                            />
                        </div>
                    </div>

                    {/* Specifications Section */}
                    {product.specifications && product.specifications.length > 0 && (
                        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                                <Layers size={22} className="text-indigo-600" />
                                Fiche Technique
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {product.specifications.map((spec, idx) => (
                                    <div key={idx} className="flex flex-col rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100 dark:bg-gray-900/30 dark:hover:bg-gray-900/50 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/30">
                                        <span className="mb-1 text-[10px] font-black uppercase tracking-wider text-gray-400">{spec.keyName}</span>
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{spec.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
