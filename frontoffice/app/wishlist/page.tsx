'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useWishlist } from '@/common/context/WishlistContext'
import { useCart } from '@/common/context/CartContext'
import { formatPrice } from '@/common/utils/format'
import { Trash2, ShoppingCart, Heart, ArrowLeft } from 'lucide-react'
import { Card } from '@/common/components/elements/Card'

export default function WishlistPage() {
    const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
    const { addToCart } = useCart();

    const handleAddToCart = (product: any) => {
        addToCart(product, 1);
        removeFromWishlist(product.id);
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] py-8 md:py-16">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header Section (Matching Profile Style) */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                    <div className="flex items-center gap-6">
                        <Link
                            href="/"
                            className="p-3 bg-white rounded-full shadow-md hover:shadow-lg text-gray-600 hover:text-wiki-btn transition-all group border border-gray-100"
                        >
                            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div>
                            <Image
                                src="/assets/img/logo-wiki.svg"
                                alt="Wiki Logo"
                                width={160}
                                height={50}
                                className="h-12 w-auto"
                            />
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                        <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 text-sm font-medium text-gray-500 flex items-center gap-2">
                            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                            {wishlist.length} Article{wishlist.length > 1 ? 's' : ''} Favori{wishlist.length > 1 ? 's' : ''}
                        </div>
                        {wishlist.length > 0 && (
                            <button
                                onClick={clearWishlist}
                                className="flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-all text-sm border border-red-100"
                            >
                                <Trash2 className="w-4 h-4" /> Vider la liste
                            </button>
                        )}
                    </div>
                </div>

                <div className="mb-10 pb-6 border-b border-gray-200">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        Ma Liste <span className="text-wiki-btn">d'Envies</span>
                    </h1>
                </div>

                {wishlist.length === 0 ? (
                    <Card className="p-16 text-center shadow-xl border-none bg-white flex flex-col items-center justify-center min-h-[400px] rounded-[2rem]">
                        <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-rose-50/50">
                            <Heart className="w-12 h-12 text-rose-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Votre liste d'envies est vide</h2>
                        <p className="text-gray-500 mb-8 max-w-sm font-medium">Découvrez nos produits et ajoutez vos coups de cœur pour les retrouver facilement plus tard !</p>
                        <Link href="/">
                            <button className="bg-wiki-btn hover:bg-emerald-900 text-white font-black py-4 px-10 rounded-2xl shadow-xl shadow-wiki-btn/30 transition-all hover:scale-105 active:scale-95">
                                Découvrir nos produits
                            </button>
                        </Link>
                    </Card>
                ) : (
                    <Card className="shadow-2xl border-none bg-white rounded-[2rem] overflow-hidden">
                        <div className="flex flex-col">
                            {wishlist.map((product, index) => (
                                <div
                                    key={product.id}
                                    className={`flex flex-col sm:flex-row items-center gap-8 p-8 transition-colors relative group bg-white hover:bg-slate-50/50 ${index !== wishlist.length - 1 ? 'border-b border-gray-100' : ''
                                        }`}
                                >
                                    {/* Product Image */}
                                    <div className="w-full sm:w-48 h-48 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center justify-center p-6 shrink-0 group-hover:shadow-md transition-all duration-300 relative">
                                        <img
                                            src={product.imageUrl || '/assets/img/2-1.png'}
                                            alt={product.title}
                                            className="max-h-full object-contain group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
                                        />
                                        <div className="absolute top-3 left-3">
                                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm border ${product.stockStatus === 'EN_STOCK' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                product.stockStatus === 'EN_ARRIVAGE' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                    'bg-rose-50 text-rose-700 border-rose-100'
                                                }`}>
                                                {product.stockStatus === 'EN_STOCK' ? 'EN STOCK' :
                                                    product.stockStatus === 'EN_ARRIVAGE' ? 'EN ARRIVAGE' : 'HORS STOCK'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex flex-col flex-1 w-full gap-4">
                                        <div className="flex justify-between items-start">
                                            <div className="max-w-xl">
                                                <Link href={`/products/${product.id}`} className="block">
                                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-wiki-btn transition-colors leading-snug">
                                                        {product.title}
                                                    </h3>
                                                </Link>
                                                <div className="mt-2 flex items-center gap-3">
                                                    <span className="text-2xl font-black text-wiki-btn tracking-tight">
                                                        {formatPrice(product.price)}
                                                    </span>
                                                    {product.discountPrice && (
                                                        <span className="text-sm font-bold text-gray-400 line-through">
                                                            {formatPrice(product.regularPrice || product.price)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => removeFromWishlist(product.id)}
                                                className="p-3 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all shadow-sm border border-gray-100"
                                                title="Retirer"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-6">
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                <div className="w-1.5 h-1.5 bg-wiki-btn rounded-full" />
                                                Wiki Certified Quality
                                            </div>

                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                disabled={product.stockStatus === 'HORS_STOCK'}
                                                className="w-full sm:w-64 text-sm font-black shadow-lg shadow-wiki-btn/20 btn-liquid btn-liquid-login"
                                            >
                                                <span className="liquid"></span>
                                                <span className="button_text">
                                                    <ShoppingCart className="w-4 h-4" />
                                                    Ajouter au panier
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>
        </div>
    )
}

function X(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    )
}
