'use client'

import React, { useEffect, useState, useCallback } from 'react';
import { useCart } from '@/common/context/CartContext';
import { Trash2, ShoppingBag, X, Plus, Minus, ArrowRight, Sparkles, ShoppingCart } from 'lucide-react'
import { formatPrice } from '@/common/utils/format'
import Image from 'next/image';
import Link from 'next/link';
import { ProductService } from '@/common/services/productService';
import { categoryService } from '@/common/services/categoryService';
import { ProductMinResponse } from '@/app/dtos/product';

/**
 * Accessory category slugs to try in order.
 * Products must belong to one of these categories to appear as suggestions.
 */
const ACCESSORY_CATEGORY_SLUGS = [
    'accessoires-gaming',
    'accessoires-informatique',
    'accessoires-telephonie',
    'accessoires',
];

export const CartDrawer = () => {
    const { cart, isDrawerOpen, setIsDrawerOpen, updateQuantity, removeFromCart, addToCart, totalPrice, totalItems } = useCart();

    const [suggestions, setSuggestions] = useState<ProductMinResponse[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

    const fetchSmartSuggestions = useCallback(async () => {
        if (cart.length === 0) {
            setSuggestions([]);
            return;
        }

        setLoadingSuggestions(true);
        try {
            const cartIds = new Set(cart.map(c => c.id));

            // 1. Gather all direct category slugs from the cart items
            const directCartSlugs = new Set<string>();
            cart.forEach(item => {
                item.categorySlugs?.forEach(slug => directCartSlugs.add(slug));
            });

            // 2. Dynamically discover accessory categories and expand cart categories from the API
            const categoryTree = await categoryService.getCategoryTree();

            // Expand cart slugs to include all parent categories
            const expandedCartSlugs = new Set<string>(directCartSlugs);
            const findAndExpandParents = (nodes: any[], currentPath: string[]) => {
                for (const node of nodes) {
                    if (!node.slug) continue;
                    const path = [...currentPath, node.slug];
                    
                    if (directCartSlugs.has(node.slug)) {
                        // We found a category from the cart! Add its entire ancestry to the expanded set.
                        path.forEach(p => expandedCartSlugs.add(p));
                    }

                    if (node.subCategories?.length) {
                        findAndExpandParents(node.subCategories, path);
                    }
                }
            };
            findAndExpandParents(categoryTree, []);

            // 3. Extract concept keywords from the expanded categories
            const cartConcepts = new Set<string>();
            expandedCartSlugs.forEach(slug => {
                slug.split('-').forEach(word => {
                    if (word.length > 2) cartConcepts.add(word.toLowerCase());
                });
            });

            const relevantAccessorySlugs: string[] = [];
            const allAccessorySlugs: string[] = [];

            const collectAccessorySlugs = (cats: typeof categoryTree) => {
                for (const cat of cats) {
                    const slug = cat.slug?.toLowerCase() || '';
                    const name = cat.name?.toLowerCase() || '';

                    const isAccessory =
                        slug.includes('access') || name.includes('access') ||
                        slug.includes('accesoire') || name.includes('accesoire') ||
                        slug.includes('acessoire') || name.includes('acessoire') ||
                        slug.includes('acesoire') || name.includes('acesoire');

                    if (isAccessory) {
                        allAccessorySlugs.push(cat.slug);

                        // Check if this accessory category relates to anything in our cart
                        let isRelated = false;
                        for (const concept of Array.from(cartConcepts)) {
                            if (slug.includes(concept) || name.includes(concept)) {
                                isRelated = true;
                                break;
                            }
                            // Special case for linguistic variations (e.g. telephonie vs telephone)
                            if (concept.includes('telephon') && slug.includes('telephon')) {
                                isRelated = true;
                                break;
                            }
                            // Special case for gamer vs gaming
                            if (concept.includes('gam') && slug.includes('gam')) {
                                isRelated = true;
                                break;
                            }
                            // Map generic PC/Informatique to Gaming accessories (mice, keyboards apply to all PCs)
                            const isPcConcept = concept === 'pc' || concept === 'informatique' || concept === 'portable' || concept === 'ordinateur';
                            if (isPcConcept && slug.includes('gam')) {
                                isRelated = true;
                                break;
                            }
                        }

                        // Always include generic "accessoires" as a fallback
                        if (slug === 'accessoires' || slug === 'accesoires' || isRelated) {
                            relevantAccessorySlugs.push(cat.slug);
                        }
                    }

                    // Recursion
                    if (cat.subCategories?.length) {
                        collectAccessorySlugs(cat.subCategories);
                    }
                }
            };
            collectAccessorySlugs(categoryTree);

            // Prioritize relevant accessories, fallback to all accessories if no match found
            const targetSlugs = relevantAccessorySlugs.length > 0 ? relevantAccessorySlugs : allAccessorySlugs;

            if (targetSlugs.length === 0) {
                setSuggestions([]);
                return;
            }

            // Fetch 6 products from EACH relevant category concurrently
            const fetchPromises = targetSlugs.map(slug =>
                ProductService.getFilteredProducts({
                    categorySlug: slug,
                    page: 0,
                    size: 6,
                }).catch(() => null) // Ignore errors for individual categories
            );

            const results = await Promise.all(fetchPromises);
            
            // Extract the product lists
            const categoryProductLists = results
                .map(r => r?.content ?? [])
                .filter(list => list.length > 0);

            const allSuggestions: ProductMinResponse[] = [];
            const seen = new Set<number>();
            
            // Limite stricte : 2 produits maximum par catégorie
            const MAX_PER_CATEGORY = 2;

            // Interleave products so we get a mix from different categories
            // e.g. [Gaming1, Telephonie1, Gaming2, Telephonie2]
            let hasMore = true;
            let index = 0;
            
            while (hasMore && allSuggestions.length < 6 && index < MAX_PER_CATEGORY) {
                hasMore = false;
                for (const productList of categoryProductLists) {
                    if (index < productList.length) {
                        hasMore = true;
                        const p = productList[index];
                        if (!cartIds.has(p.id) && !seen.has(p.id)) {
                            seen.add(p.id);
                            allSuggestions.push(p);
                        }
                    }
                    if (allSuggestions.length >= 6) break;
                }
                index++;
            }

            setSuggestions(allSuggestions);
        } catch (err) {
            console.error('Failed to fetch suggestions:', err);
            setSuggestions([]);
        } finally {
            setLoadingSuggestions(false);
        }
    }, [cart]);

    useEffect(() => {
        if (isDrawerOpen && cart.length > 0) {
            fetchSmartSuggestions();
        }
    }, [isDrawerOpen, fetchSmartSuggestions]);

    const handleAddSuggestion = (product: ProductMinResponse) => {
        // Pass the raw product so CartContext resolves price correctly via discountPrice || regularPrice
        addToCart(product);
        setAddedIds(prev => new Set(prev).add(product.id));
        setTimeout(() => {
            setAddedIds(prev => {
                const next = new Set(prev);
                next.delete(product.id);
                return next;
            });
        }, 1500);
    };

    if (!isDrawerOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={() => setIsDrawerOpen(false)}
            />

            {/* Drawer */}
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
                <div className="w-screen max-w-md pointer-events-auto">
                    <div className="h-full flex flex-col bg-white shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-6 border-b">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-wiki/10 rounded-xl flex items-center justify-center">
                                    <ShoppingBag className="w-6 h-6 text-wiki" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Mon Panier</h2>
                                    <p className="text-sm text-slate-500">{totalItems} article{totalItems > 1 ? 's' : ''}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsDrawerOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        {/* Scrollable content */}
                        <div className="flex-1 overflow-y-auto">
                            {/* Cart Items */}
                            <div className="py-4 px-6">
                                {cart.length === 0 ? (
                                    <div className="h-48 flex flex-col items-center justify-center text-center">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                            <ShoppingBag className="w-10 h-10 text-slate-200" />
                                        </div>
                                        <p className="text-xl font-bold text-slate-400">Votre panier est vide</p>
                                        <button
                                            onClick={() => setIsDrawerOpen(false)}
                                            className="mt-4 text-wiki font-bold hover:underline"
                                        >
                                            Continuer vos achats
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {cart.map((item, index) => (
                                            <div key={item.id || `cart-${index}`} className="flex gap-4 group">
                                                <div className="w-24 h-24 bg-slate-50 rounded-2xl flex-shrink-0 flex items-center justify-center p-2 border border-slate-100">
                                                    <Image
                                                        src={item.imageUrl || '/assets/img/logo.png'}
                                                        alt={item.title}
                                                        width={96}
                                                        height={96}
                                                        className="max-h-full object-contain"
                                                    />
                                                </div>
                                                <div className="flex-1 flex flex-col justify-between py-1">
                                                    <div>
                                                        <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-tight mb-1 group-hover:text-wiki transition-colors">
                                                            {item.title}
                                                        </h3>
                                                        <div className="flex flex-col items-end gap-1">
                                                            <p className="text-wiki-btn font-black">{formatPrice(item.price)}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Total: {formatPrice(item.price * item.quantity)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center bg-slate-100 rounded-lg px-2 py-1">
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                className="p-1 hover:text-wiki"
                                                            >
                                                                <Minus className="w-4 h-4" />
                                                            </button>
                                                            <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                className="p-1 hover:text-wiki"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        <button
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Smart Suggestions */}
                            {cart.length > 0 && (loadingSuggestions || suggestions.length > 0) && (
                                <div className="px-6 pb-6 border-t border-dashed border-slate-200 pt-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Sparkles className="w-4 h-4 text-amber-500" />
                                        <p className="text-sm font-bold text-slate-700">Accessoires recommandés</p>
                                    </div>

                                    {loadingSuggestions ? (
                                        <div className="flex gap-3 overflow-x-auto pb-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="flex-shrink-0 w-32 bg-slate-100 rounded-xl h-36 animate-pulse" />
                                            ))}
                                        </div>
                                    ) : suggestions.length > 0 ? (
                                        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                                            {suggestions.map(product => (
                                                <div
                                                    key={product.id}
                                                    className="flex-shrink-0 w-36 bg-slate-50 border border-slate-100 rounded-2xl p-3 flex flex-col items-center gap-2 hover:border-wiki/30 hover:shadow-md transition-all group"
                                                >
                                                    <div className="w-16 h-16 flex items-center justify-center">
                                                        <Image
                                                            src={product.imageUrl || '/assets/img/logo.png'}
                                                            alt={product.title}
                                                            width={64}
                                                            height={64}
                                                            className="max-h-full object-contain"
                                                        />
                                                    </div>
                                                    <p className="text-[11px] font-semibold text-slate-700 text-center line-clamp-2 leading-tight">
                                                        {product.title}
                                                    </p>
                                                    <p className="text-xs font-black text-wiki-btn">
                                                        {formatPrice(product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.regularPrice)}
                                                    </p>
                                                    <button
                                                        onClick={() => handleAddSuggestion(product)}
                                                        className={`w-full py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${addedIds.has(product.id)
                                                            ? 'bg-emerald-500 text-white'
                                                            : 'bg-wiki/10 text-wiki hover:bg-wiki hover:text-white'
                                                            }`}
                                                    >
                                                        {addedIds.has(product.id) ? (
                                                            <>✓ Ajouté</>
                                                        ) : (
                                                            <><ShoppingCart className="w-3 h-3" /> Ajouter</>
                                                        )}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {cart.length > 0 && (
                            <div className="border-t px-6 py-8 bg-slate-50">
                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-slate-500">
                                        <span className="text-sm font-medium">Sous-total</span>
                                        <span className="font-bold">{formatPrice(totalPrice)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500">
                                        <span className="text-sm font-medium">Livraison</span>
                                        <span className="text-emerald-600 font-bold">Gratuite</span>
                                    </div>
                                    <div className="flex justify-between items-baseline mb-6">
                                        <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Total estimé</span>
                                        <span className="text-3xl font-black text-wiki-btn tracking-tighter">{formatPrice(totalPrice)}</span>
                                    </div>
                                </div>

                                <Link
                                    href="/checkout"
                                    onClick={() => setIsDrawerOpen(false)}
                                    className="w-full bg-wiki hover:bg-wiki-dark text-white py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg shadow-xl shadow-wiki/20 transition-all hover:scale-[1.02] active:scale-95 group"
                                >
                                    Passer la commande
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>

                                <button
                                    onClick={() => setIsDrawerOpen(false)}
                                    className="w-full mt-4 py-2 text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors"
                                >
                                    Continuer mes achats
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
