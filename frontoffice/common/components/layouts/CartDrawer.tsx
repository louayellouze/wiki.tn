'use client'

import React from 'react';
import { useCart } from '@/common/context/CartContext';
import { Trash2, ShoppingBag, X, Plus, Minus, ArrowRight } from 'lucide-react'
import { formatPrice } from '@/common/utils/format'
import Link from 'next/link';

export const CartDrawer = () => {
    const { cart, isDrawerOpen, setIsDrawerOpen, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();

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

                        {/* Cart Items */}
                        <div className="flex-1 py-4 overflow-y-auto px-6">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center">
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
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex gap-4 group">
                                            <div className="w-24 h-24 bg-slate-50 rounded-2xl flex-shrink-0 flex items-center justify-center p-2 border border-slate-100">
                                                <img
                                                    src={item.imageUrl || '/assets/img/logo.png'}
                                                    alt={item.title}
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
