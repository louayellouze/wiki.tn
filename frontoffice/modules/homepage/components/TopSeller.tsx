'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ProductService } from '@/common/services/productService'
import { ProductMinResponse } from '@/app/dtos/product'
import { formatPrice } from '@/common/utils/format'
import { useCart } from '@/common/context/CartContext'
import ButtonLove from '@/common/components/elements/ButtonLove'
import { Zap, Clock, TrendingUp, ShoppingCart, Eye, ArrowRight } from 'lucide-react'

const TopSeller = () => {
    const [products, setProducts] = useState<ProductMinResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasBeenVisible, setHasBeenVisible] = useState(false);
    const { addToCart } = useCart();
    const sectionRef = React.useRef<HTMLElement>(null);
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    // Intersection Observer
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
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    // Fetch flash sale products
    useEffect(() => {
        if (!hasBeenVisible) return;
        const fetchTopProducts = async () => {
            setLoading(true);
            try {
                const result = await ProductService.getFlashSaleProducts(0, 4);
                if ('content' in result) {
                    setProducts(result.content);
                } else {
                    setProducts(result.slice(0, 4));
                }
            } catch (err) {
                console.error("Failed to fetch flash sale products", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTopProducts();
    }, [hasBeenVisible]);

    // Countdown timer
    useEffect(() => {
        const target = new Date();
        target.setHours(23, 59, 59, 999);
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = target.getTime() - now;
            if (distance < 0) {
                clearInterval(timer);
            } else {
                setTimeLeft({
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000)
                });
            }
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const getImageUrl = (product: ProductMinResponse) => {
        const url = product.imageUrl;
        if (!url) return '/assets/img/jbl-bar.png';
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || '';
        return `${baseUrl}${url}`;
    };

    const getDiscount = (product: ProductMinResponse) => {
        if (product.discountPrice && product.regularPrice && product.discountPrice < product.regularPrice) {
            return Math.round(((product.regularPrice - product.discountPrice) / product.regularPrice) * 100);
        }
        return 0;
    };

    if (loading) {
        return (
            <section ref={sectionRef} className="py-24 bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-emerald-600">
                    <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                    <p className="font-black uppercase tracking-[0.2em] text-xs">Synchronisation Flash...</p>
                </div>
            </section>
        );
    }

    if (products.length === 0) return null;

    return (
        <section ref={sectionRef} className="py-20 bg-white relative">
            <div className="container mx-auto px-4 relative z-10">
                {/* Header Section — Pro Dashboard Style but White/Green */}
                <div className="flex flex-col lg:flex-row justify-between items-center lg:items-end gap-8 mb-16">
                    <div className="space-y-4 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em]">
                            <Zap size={12} fill="currentColor" />
                            Offres en direct
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
                            Ventes <span className="text-neon-green">Flash</span>
                        </h2>
                        <p className="text-slate-500 font-bold max-w-md">
                            Des réductions exceptionnelles valables uniquement aujourd'hui. Profitez-en avant l'expiration !
                        </p>
                    </div>

                    {/* Pro Countdown — Light Version */}
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest mr-2">
                            <Clock size={16} className="text-emerald-600" />
                            Expire dans
                        </div>
                        {[
                            { val: timeLeft.hours, label: 'HRS' },
                            { val: timeLeft.minutes, label: 'MIN' },
                            { val: timeLeft.seconds, label: 'SEC' }
                        ].map((unit, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <div className="text-2xl font-black text-slate-900 min-w-[40px] text-center">
                                    {unit.val.toString().padStart(2, '0')}
                                </div>
                                <span className="text-[8px] font-black text-emerald-600">{unit.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Grid of Pro Cards — Light/Green Version */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product, idx) => (
                        <div key={product.id || `flash-${idx}`} className="group glass-premium-light rounded-2xl p-4 glow-card-light flex flex-col h-full bg-white border border-slate-100">
                            {/* Card Badges */}
                            <div className="flex justify-between items-start mb-4">
                                {getDiscount(product) > 0 ? (
                                    <div className="bg-rose-50 text-rose-600 border border-rose-100 px-2 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase">
                                        -{getDiscount(product)}% OFF
                                    </div>
                                ) : <div />}
                                <div className="z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ButtonLove product={product as any} />
                                </div>
                            </div>

                            {/* Product Image Stage */}
                            <Link href={`/products/${product.slug}`} className="relative h-48 mb-6 flex items-center justify-center rounded-xl bg-slate-50/50 overflow-hidden group-hover:bg-emerald-50/30 transition-colors">
                                <img 
                                    className="relative z-10 max-h-[80%] max-w-[80%] object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110" 
                                    src={getImageUrl(product)} 
                                    alt={product.title} 
                                />
                                <div className="absolute bottom-2 right-2 bg-emerald-600/10 text-emerald-600 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
                                    <Eye size={16} />
                                </div>
                            </Link>

                            {/* Product Info */}
                            <div className="space-y-4 flex-1 flex flex-col">
                                <div className="space-y-1">
                                    <h3 className="text-slate-900 font-black tracking-tight group-hover:text-emerald-600 transition-colors truncate">
                                        {product.title}
                                    </h3>
                                    <div className="flex items-center gap-1.5">
                                        <TrendingUp size={12} className="text-emerald-500" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tendance</span>
                                    </div>
                                </div>

                                <div className="flex items-end justify-between mt-auto">
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-black text-emerald-600 tracking-tighter">
                                            {formatPrice(product.discountPrice || product.regularPrice)}
                                        </span>
                                        {getDiscount(product) > 0 && (
                                            <span className="text-[10px] font-bold text-slate-400 line-through">
                                                {formatPrice(product.regularPrice)}
                                            </span>
                                        )}
                                    </div>

                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            addToCart(product);
                                        }}
                                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600 transition-all group-hover:bg-emerald-600 group-hover:text-white group-hover:shadow-lg active:scale-90"
                                    >
                                        <ShoppingCart size={18} />
                                    </button>
                                </div>
                                
                                {/* Progress Bar — Green Version */}
                                <div className="space-y-1.5 pt-2">
                                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-400">
                                        <span>Stock restant</span>
                                        <span className="text-rose-500 animate-pulse">Limité</span>
                                    </div>
                                    <div className="premium-progress-light">
                                        <div 
                                            className="premium-progress-bar-green" 
                                            style={{ width: '65%' }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* View All Button — Integrated with style */}
                <div className="mt-16 flex justify-center">
                    <Link 
                        href="/products?flash=true" 
                        className="group flex items-center gap-3 px-8 py-3 rounded-full bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-[10px] hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95"
                    >
                        Toutes les opportunités
                        <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default TopSeller;