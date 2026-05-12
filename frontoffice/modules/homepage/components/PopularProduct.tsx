'use client'

import Button from '@/common/components/elements/Button'
import { Card } from '@/common/components/elements/Card'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import api from '@/common/utils/api'
import { useCart } from '@/common/context/CartContext'
import { formatPrice } from '@/common/utils/format'
import ButtonLove from '@/common/components/elements/ButtonLove'
import { ProductService } from '@/common/services/productService'
import { categoryService } from '@/common/services/categoryService'
import { ProductMinResponse, CategoryMinResponse } from '@/app/dtos/product'

interface Category {
    id: number;
    name: string;
    imageUrl?: string;
    productCount?: number;
}

interface Product {
    id: number;
    title: string;
    slug: string;
    regularPrice: number;
    imageUrl?: string;
    images?: { imageUrl: string }[];
    category?: {
        id: number;
        name: string;
    };
    stockStatus?: string;
}

const PopularProduct = () => {
    const [categories, setCategories] = useState<CategoryMinResponse[]>([]);
    const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
    const [products, setProducts] = useState<ProductMinResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasBeenVisible, setHasBeenVisible] = useState(false);
    const { addToCart } = useCart();
    const sectionRef = React.useRef<HTMLDivElement>(null);

    // Intersection Observer to detect visibility
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setHasBeenVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Fetch categories only when visible
    useEffect(() => {
        if (!hasBeenVisible) return;

        const fetchCategories = async () => {
            try {
                // Use the new service that returned lightweight DTOs
                const cats = await categoryService.getAllCategories() as CategoryMinResponse[];
                const parentCats = cats.filter(c => !c.parentId);
                setCategories(parentCats.slice(0, 4));

                if (parentCats.length > 0) {
                    setSelectedCategorySlug(parentCats[0].slug);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, [hasBeenVisible]);

    // Fetch products when category changes (and already visible)
    useEffect(() => {
        if (selectedCategorySlug !== null && hasBeenVisible) {
            fetchProductsByCategory(selectedCategorySlug);
        }
    }, [selectedCategorySlug, hasBeenVisible]);

    const fetchProductsByCategory = async (categorySlug: string) => {
        setLoading(true);
        try {
            // Use ProductService for paginated/lightweight products
            const result = await ProductService.getProductsByCategorySlug(categorySlug, 0, 8);
            if ('content' in result) {
                setProducts(result.content);
            } else {
                setProducts(result.slice(0, 8));
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (product: ProductMinResponse) => {
        const url = product.imageUrl;

        if (!url) return '/assets/img/2-1.png';

        if (url.startsWith('http') || url.startsWith('data:')) {
            return url;
        }

        // Ensure we don't double the prefix if it's already there
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || '';
        return `${baseUrl}${url}`;
    };

    return (
        <div ref={sectionRef} className="container mx-auto px-2 md:px-4 min-h-[400px]">
            {/* Header with title and category buttons */}
            <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 py-6 md:py-10">
                <div className="text-wiki-btn text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
                    Nos produits {categories.find(c => c.slug === selectedCategorySlug)?.name || 'Populaires'}
                </div>
                <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3">
                    {categories.map((category) => (
                        <Button
                            key={category.slug}
                            onClick={() => setSelectedCategorySlug(category.slug)}
                            className={`px-4 md:px-6 h-10 md:h-11 border text-sm md:text-base font-medium transition-colors ${selectedCategorySlug === category.slug
                                ? 'bg-wiki-btn text-white border-wiki-btn'
                                : 'border-wiki-btn text-wiki-btn hover:bg-slate-200'
                                }`}
                        >
                            {category.name}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Products Grid */}
            <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8 pb-6 md:pb-10 transition-all duration-500 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                {loading ? (
                    <div className="col-span-full text-center py-10 text-wiki-btn">Loading products...</div>
                ) : products.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-wiki-btn">No products found in this category.</div>
                ) : (
                    products.map((product, index) => (
                        <Link href={`/products/${product.slug || ''}`} key={product.slug || index}>
                            <Card className={`w-full h-72 md:h-80 relative cursor-pointer transition ease-in-out hover:-translate-y-1 hover:scale-105 flex flex-col ${product.stockStatus === 'HORS_STOCK' || product.stockStatus === 'EN_ARRIVAGE' ? 'opacity-75 grayscale-[0.5]' : ''}`}>
                                {product.stockStatus === 'HORS_STOCK' && (
                                    <div className="absolute top-4 right-4 z-10 bg-rose-600 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-md">
                                        Hors Stock
                                    </div>
                                )}
                                {product.stockStatus === 'EN_ARRIVAGE' && (
                                    <div className="absolute top-4 right-4 z-10 bg-blue-600 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-md">
                                        En Arrivage
                                    </div>
                                )}
                                {product.stockStatus === 'EN_COMMANDE' && (
                                    <div className="absolute top-4 right-4 z-10 bg-amber-500 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-md">
                                        Sur Commande
                                    </div>
                                )}
                                <div className="relative h-40 md:h-52 mb-4 bg-slate-50 flex items-center justify-center overflow-hidden">
                                    <img className="max-h-full max-w-full object-contain p-2 md:p-4 group-hover:scale-110 transition-transform duration-500" src={getImageUrl(product)} alt={product.title} />
                                    
                                    {/* Flash Sale Badge */}
                                    {(product as any).isFlashSale && (
                                        <div className="absolute top-4 left-4 z-20 bg-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1 animate-pulse">
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                                            Vente Flash
                                        </div>
                                    )}

                                    <div className="absolute top-3 right-3 z-10 transition-opacity">
                                        {/* @ts-ignore - Product type is slightly different here but compatible */}
                                        <ButtonLove product={product as any} />
                                    </div>
                                </div>
                                <div className="px-2 md:px-4 pb-3 md:pb-4 flex-col justify-start items-start gap-2 md:gap-4 flex mt-auto">
                                    <div className="text-wiki-btn text-sm md:text-lg lg:text-xl font-medium w-full truncate">{product.title}</div>
                                    <div className="text-slate-400 text-sm md:text-base font-medium">{formatPrice(product.regularPrice)}</div>
                                    <div className="justify-start items-start gap-1.5 md:gap-2.5 inline-flex">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="w-3 h-3 md:w-4 md:h-4 relative">
                                                <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FBBF24" />
                                                </svg>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        addToCart(product);
                                    }}
                                    className={`w-8 h-8 md:w-9 md:h-9 absolute bottom-3 right-3 md:bottom-4 md:right-4 bg-gray-200 rounded-full flex transition-colors ${product.stockStatus === 'HORS_STOCK' || product.stockStatus === 'EN_ARRIVAGE' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-wiki'}`}
                                >
                                    <div className="m-auto">
                                        <div className="w-5 h-5 md:w-6 md:h-6">
                                            <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M7.91992 19.57C8.58066 19.57 9.11992 19.0307 9.11992 18.37C9.11992 17.7093 8.58066 17.17 7.91992 17.17C7.25918 17.17 6.71992 17.7093 6.71992 18.37C6.71992 19.0307 7.25918 19.57 7.91992 19.57Z" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M17.84 19.57C18.5008 19.57 19.04 19.0307 19.04 18.37C19.04 17.7093 18.5008 17.17 17.84 17.17C17.1792 17.17 16.64 17.7093 16.64 18.37C16.64 19.0307 17.1792 19.57 17.84 19.57Z" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M3.20996 5.5H5.40996L7.99996 16.59C8.08639 16.9634 8.29744 17.2917 8.59828 17.5212C8.89912 17.7507 9.27181 17.8676 9.65496 17.85H17.43C17.8016 17.8693 18.1648 17.7601 18.463 17.5397C18.7613 17.3193 18.9778 16.9999 19.0799 16.632L21.0899 9.50001C21.1593 9.2317 21.1441 8.94827 21.0463 8.68863C20.9484 8.42899 20.7725 8.20593 20.5427 8.05009C20.3128 7.89425 20.0402 7.8132 19.762 7.81801H6.18996" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </div>
    )
}

export default PopularProduct