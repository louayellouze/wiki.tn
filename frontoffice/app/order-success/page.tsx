'use client'

import React, { useEffect, useState } from 'react';
import { CheckCircle2, ShoppingBag, User, Home, Package } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import HeaderTop from '@/common/components/layouts/HeaderTop';
import HeaderBottom from '@/common/components/layouts/HeaderBottom';
import Footer from '@/common/components/layouts/Footer';
import { getOrderById } from '@/common/services/orderService';
import { formatPrice } from '@/common/utils/format';

export default function OrderSuccessPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    
    const [orderDetails, setOrderDetails] = useState<any>(null);
    const [isLoadingOrder, setIsLoadingOrder] = useState(false);

    useEffect(() => {
        if (orderId) {
            setIsLoadingOrder(true);
            getOrderById(Number(orderId))
                .then(data => setOrderDetails(data))
                .catch(err => console.error("Failed to load order details", err))
                .finally(() => setIsLoadingOrder(false));
        }
    }, [orderId]);

    return (
        <main className="bg-gradient-to-br from-slate-50 via-white to-emerald-50 min-h-screen">
            <HeaderTop />
            <HeaderBottom />

            <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[70vh]">
                {/* Success Card */}
                <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl shadow-emerald-100 overflow-hidden border border-emerald-100">
                    {/* Green top banner */}
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-10 text-white text-center relative overflow-hidden">
                        {/* Decorative circles */}
                        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
                        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />

                        <div className="relative z-10 flex flex-col items-center gap-4">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-4 border-white/30 animate-bounce">
                                <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black tracking-tight mb-1">
                                    Commande Confirmée ! 🎉
                                </h1>
                                <p className="text-emerald-100 text-lg font-medium">
                                    Merci pour votre confiance
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-8 py-10">
                        {/* Order info */}
                        <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
                            <div className="flex flex-col items-center text-center mb-6">
                                <Package className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                                {orderId ? (
                                    <p className="text-slate-600 font-medium">
                                        Numéro de commande : <span className="font-black text-slate-900">#{orderId}</span>
                                    </p>
                                ) : null}
                                <p className="text-slate-500 text-sm mt-2 max-w-sm">
                                    Un email de confirmation vous a été envoyé. Notre équipe va traiter votre commande dans les plus brefs délais.
                                </p>
                            </div>

                            {isLoadingOrder ? (
                                <div className="flex justify-center p-4">
                                    <div className="w-8 h-8 border-4 border-wiki border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : orderDetails ? (
                                <div className="border-t border-slate-200 pt-6 mt-4">
                                    <h3 className="text-lg font-bold text-slate-800 mb-4">Récapitulatif de votre commande</h3>
                                    
                                    <div className="space-y-4 mb-6">
                                        {orderDetails.items?.map((item: any) => (
                                            <div key={item.id} className="flex justify-between items-center text-sm">
                                                <div className="flex gap-2">
                                                    <span className="font-semibold text-slate-700">{item.quantity}x</span>
                                                    <span className="text-slate-600 line-clamp-1">{item.productTitle}</span>
                                                </div>
                                                <span className="font-medium text-slate-900 whitespace-nowrap">{formatPrice(item.price * item.quantity)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t border-dashed border-slate-300 pt-4 mb-6 space-y-2">
                                        {orderDetails.discountAmount > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-emerald-600">Réduction ({orderDetails.couponCode})</span>
                                                <span className="text-emerald-600 font-medium">- {formatPrice(orderDetails.discountAmount)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-slate-800">Total payé</span>
                                            <span className="text-xl font-black text-wiki">{formatPrice(orderDetails.totalAmount)}</span>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl p-4 border border-slate-100 text-sm space-y-3">
                                        <div>
                                            <p className="text-slate-400 font-semibold mb-1 uppercase text-xs tracking-wider">Adresse de livraison</p>
                                            <p className="text-slate-700">{orderDetails.address}</p>
                                            <p className="text-slate-700">{orderDetails.postalCode} • {orderDetails.phone}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 font-semibold mb-1 uppercase text-xs tracking-wider">Paiement</p>
                                            <p className="text-slate-700">{orderDetails.paymentMethod === 'CASH_ON_DELIVERY' ? 'Paiement à la livraison' : 'Carte Bancaire (Stripe)'}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {/* Steps */}
                        <div className="flex items-start justify-between gap-4 mb-10">
                            {[
                                { icon: '✅', label: 'Commande reçue' },
                                { icon: '📦', label: 'Préparation' },
                                { icon: '🚚', label: 'En livraison' },
                                { icon: '🏠', label: 'Livré' },
                            ].map((step, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 flex-1 relative">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 z-10 ${i === 0 ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                                        {step.icon}
                                    </div>
                                    {i < 3 && <div className={`absolute top-5 left-1/2 w-full h-0.5 -z-0 ${i === 0 ? 'bg-emerald-300' : 'bg-slate-200'}`} />}
                                    <p className={`text-xs font-semibold text-center mt-1 ${i === 0 ? 'text-emerald-600' : 'text-slate-400'}`}>{step.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                href={`/track-order?orderId=${orderId}&email=${orderDetails?.userEmail || ''}`}
                                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-slate-900 text-white font-bold shadow-lg shadow-slate-200 transition-all hover:scale-[1.02] active:scale-95"
                            >
                                <Package className="w-5 h-5" />
                                Suivre ma commande
                            </Link>
                            <Link
                                href="/profile"
                                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg shadow-emerald-200 transition-all hover:scale-[1.02] active:scale-95"
                            >
                                <User className="w-5 h-5" />
                                Voir mon profil
                            </Link>
                        </div>

                        {/* Continue shopping */}
                        <div className="mt-6 text-center">
                            <Link
                                href="/products"
                                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 font-semibold transition-colors"
                            >
                                <ShoppingBag className="w-4 h-4" />
                                Continuer mes achats
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
