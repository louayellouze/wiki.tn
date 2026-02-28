'use client'

import React, { useState } from 'react';
import { useCart } from '@/common/context/CartContext';
import { formatPrice } from '@/common/utils/format';
import { createOrder } from '@/common/services/orderService';
import HeaderTop from '@/common/components/layouts/HeaderTop';
import HeaderBottom from '@/common/components/layouts/HeaderBottom';
import Footer from '@/common/components/layouts/Footer';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus } from 'lucide-react';

export default function CheckoutPage() {
    const { cart, totalPrice, clearCart, removeFromCart, updateQuantity } = useCart();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [address, setAddress] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [phone, setPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cart.length === 0) return;

        setLoading(true);
        setError(null);

        try {
            const orderRequest = {
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity
                })),
                address,
                postalCode,
                phone,
                paymentMethod
            };

            await createOrder(orderRequest);
            clearCart();
            router.push('/profile?order_success=true');
        } catch (err: any) {
            const errorData = err.response?.data;
            const errorMessage = typeof errorData === 'string'
                ? errorData
                : errorData?.message || errorData?.error || "Failed to place order. Please try again.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <main className="bg-white min-h-screen">
                <HeaderTop />
                <HeaderBottom />
                <div className="container mx-auto py-20 text-center">
                    <h1 className="text-3xl font-bold mb-5">Votre panier est vide</h1>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-wiki text-white px-6 py-2 rounded-lg"
                    >
                        Continuer vos achats
                    </button>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="bg-white min-h-screen">
            <HeaderTop />
            <HeaderBottom />

            <div className="container mx-auto py-10 px-4 md:px-0">
                <h1 className="text-3xl font-bold mb-8">Paiement</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Left side: Form */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <h2 className="text-xl font-semibold mb-6">Détails de livraison</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Adresse complète</label>
                                <textarea
                                    required
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-wiki outline-none"
                                    placeholder="Ex: 123 Rue de la Technologie, Tunis"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Code Postal</label>
                                <input
                                    required
                                    type="text"
                                    value={postalCode}
                                    onChange={(e) => setPostalCode(e.target.value)}
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-wiki outline-none"
                                    placeholder="Ex: 1000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Numéro de Téléphone</label>
                                <input
                                    required
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-wiki outline-none"
                                    placeholder="Ex: +216 22 333 444"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Mode de paiement</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'CASH_ON_DELIVERY' ? 'border-wiki bg-wiki/5 ring-1 ring-wiki' : 'border-slate-200 hover:border-slate-300'}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="CASH_ON_DELIVERY"
                                            checked={paymentMethod === 'CASH_ON_DELIVERY'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="accent-wiki w-4 h-4"
                                        />
                                        <div>
                                            <p className="font-bold text-sm">Paiement à la livraison</p>
                                            <p className="text-xs text-slate-500">Payez en espèces à la réception</p>
                                        </div>
                                    </label>
                                    <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'CARD' ? 'border-wiki bg-wiki/5 ring-1 ring-wiki' : 'border-slate-200 hover:border-slate-300'}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="CARD"
                                            checked={paymentMethod === 'CARD'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="accent-wiki w-4 h-4"
                                        />
                                        <div>
                                            <p className="font-bold text-sm">Carte Bancaire</p>
                                            <p className="text-xs text-slate-500">Paiement sécurisé en ligne</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${loading ? 'bg-slate-300' : 'bg-wiki text-white hover:bg-wiki-dark shadow-lg shadow-wiki/20'}`}
                            >
                                {loading ? 'Traitement en cours...' : 'Confirmer la commande'}
                            </button>
                        </form>
                    </div>

                    {/* Right side: Summary */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
                        <h2 className="text-xl font-semibold mb-6">Récapitulatif</h2>
                        <div className="space-y-4 mb-6">
                            {cart.map((item) => (
                                <div key={item.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl gap-2">
                                    <div className="flex gap-3 items-center flex-1">
                                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1 border border-slate-100 flex-shrink-0">
                                            <img src={item.imageUrl || '/assets/img/logo.png'} className="max-h-full object-contain" alt={item.title} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold line-clamp-1 truncate">{item.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden h-7">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="px-2 h-full hover:bg-slate-50 text-slate-500 transition-colors"
                                                    >
                                                        <Minus size={12} />
                                                    </button>
                                                    <span className="px-2 text-xs font-bold text-slate-700 border-x border-slate-100 min-w-[24px] text-center">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="px-2 h-full hover:bg-slate-50 text-wiki transition-colors"
                                                    >
                                                        <Plus size={12} />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-red-400 hover:text-red-600 transition-colors p-1"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="font-bold text-wiki text-sm whitespace-nowrap">{(item.price * item.quantity).toFixed(3)} TND</p>
                                </div>
                            ))}
                        </div>

                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between text-slate-600">
                                <span>Sous-total</span>
                                <span>{totalPrice.toFixed(3)} TND</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Livraison</span>
                                <span className="text-green-600 font-medium">Gratuite</span>
                            </div>
                            <div className="flex justify-between items-center bg-wiki-light/10 p-4 rounded-2xl border border-wiki-btn/20">
                                <span className="text-xl font-black text-slate-800 tracking-tight">Total à payer</span>
                                <span className="text-2xl font-black text-wiki-btn tracking-tight">{formatPrice(totalPrice)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
