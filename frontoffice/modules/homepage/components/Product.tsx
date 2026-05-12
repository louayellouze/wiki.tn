'use client'

import { Card } from '@/common/components/elements/Card'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import api from '@/common/utils/api'
import ButtonLove from '@/common/components/elements/ButtonLove'

interface Product {
    id: number;
    title: string;
    slug: string;
    description: string;
    regularPrice: number;
    discountPrice?: number;
    imageUrl?: string;
    images?: { imageUrl: string }[];
    stockStatus?: string;
}

const Product = () => {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get('/v1/products');
                setProducts(response.data.slice(0, 8));
            } catch (error) {
                console.error("Failed to fetch products", error);
            }
        };

        fetchProducts();
    }, []);

    const getImageUrl = (product: Product) => {
        const url = product.imageUrl || (product.images && product.images.length > 0 ? product.images[0].imageUrl : null);

        if (!url) return '/assets/img/3-1.png';

        if (url.startsWith('http') || url.startsWith('data:')) {
            return url;
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || '';
        return `${baseUrl}${url}`;
    };

    return (
        <div className="container mx-auto px-2 md:px-4">
            <div className="flex flex-wrap pt-6 md:pt-10 justify-center items-center">
                <div className="flex flex-col md:flex-row w-full justify-between items-center mb-4 md:mb-6 px-2 md:px-4">
                    <div className="text-cyan-800 text-xl md:text-2xl font-semibold mb-3 md:mb-0">Popular products</div>
                    <div className="w-24 md:w-28 h-9 md:h-10 px-6 md:px-8 py-2 md:py-3 rounded-3xl border border-cyan-800 justify-center items-center gap-10 inline-flex hover:bg-slate-200 cursor-pointer">
                        <Link href="/products" className="text-cyan-800 text-sm md:text-base font-medium">View all</Link>
                    </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8 mt-2 md:mt-4 w-full px-1 md:px-0">
                    {products.map((product) => (
                        <Link href={`/products/${product.slug}`} key={product.slug}>
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
                                    <div className="absolute top-3 left-3 z-10 transition-opacity">
                                        {/* @ts-ignore - Product type is slightly different here but compatible */}
                                        <ButtonLove product={product as any} />
                                    </div>
                                </div>
                                <div className="px-2 md:px-4 pb-3 md:pb-4 flex-col justify-start items-start gap-2 md:gap-4 flex mt-auto">
                                    <div className="text-cyan-800 text-sm md:text-lg lg:text-xl font-medium w-full truncate">{product.title}</div>
                                    <div className="text-slate-400 text-sm md:text-base font-medium">{product.regularPrice} DT</div>
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
                                <div className={`w-8 h-8 md:w-9 md:h-9 absolute bottom-3 right-3 md:bottom-4 md:right-4 bg-gray-200 rounded-full flex transition-colors ${product.stockStatus === 'HORS_STOCK' || product.stockStatus === 'EN_ARRIVAGE' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-amber-400'}`}>
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
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Product