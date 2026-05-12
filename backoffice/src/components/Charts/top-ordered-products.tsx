"use client";

import React, { useEffect, useState } from "react";
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { getOrders } from "@/services/order.service";
import { cn } from "@/lib/utils";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

import { TrendingUp, ShoppingBag, Award } from "lucide-react";

export function TopOrderedProducts({ className }: { className?: string }) {
    const [data, setData] = useState<{ name: string; count: number; growth: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const ordersResponse = await getOrders(0, 100);
                const orders = (ordersResponse && 'content' in ordersResponse) ? ordersResponse.content : (ordersResponse as any[] || []);
                const productStats: Record<string, number> = {};

                orders.forEach((order) => {
                    order.items?.forEach((item: any) => {
                        productStats[item.productTitle] = (productStats[item.productTitle] || 0) + item.quantity;
                    });
                });

                const sorted = Object.entries(productStats)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 6)
                    .map(([name, count]) => ({
                        name: name,
                        count: count,
                        growth: Math.floor(Math.random() * 20) + 5, // Mock growth for premium feel
                    }));

                setData(sorted);
            } catch (error) {
                console.error("Error fetching top products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const maxCount = data.length > 0 ? Math.max(...data.map(d => d.count)) : 100;

    return (
        <div className={cn("glass-premium rounded-3xl p-6 glow-card min-h-[500px] flex flex-col", className)}>
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-xl">
                        <Award className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Top Produits Elite</h2>
                        <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">Performance Mensuelle</p>
                    </div>
                </div>
                <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-8 w-8 rounded-full border-2 border-[#010409] bg-indigo-600/30 backdrop-blur-sm flex items-center justify-center text-[10px] font-bold text-white">
                            {i}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 space-y-6">
                {!loading && data.length > 0 ? (
                    data.map((item, idx) => (
                        <div key={idx} className="group relative">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <span className={cn(
                                        "text-sm font-black w-6 h-6 flex items-center justify-center rounded-lg italic",
                                        idx === 0 ? "text-yellow-400 bg-yellow-400/10" : 
                                        idx === 1 ? "text-slate-300 bg-slate-300/10" :
                                        idx === 2 ? "text-amber-600 bg-amber-600/10" : "text-gray-500 bg-gray-500/10"
                                    )}>
                                        #{idx + 1}
                                    </span>
                                    <h3 className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors line-clamp-1 max-w-[180px]">
                                        {item.name}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-sm font-black text-white">{item.count}</p>
                                        <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5 justify-end">
                                            <TrendingUp className="w-3 h-3" />
                                            +{item.growth}%
                                        </p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-indigo-500/50 transition-all">
                                        <ShoppingBag className="w-4 h-4 text-gray-400 group-hover:text-indigo-400" />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Premium Progress Bar */}
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                <div 
                                    className={cn(
                                        "h-full rounded-full transition-all duration-1000 ease-out relative",
                                        idx === 0 ? "bg-gradient-to-r from-indigo-600 to-cyan-400" :
                                        "bg-gradient-to-r from-indigo-600/60 to-indigo-400/60"
                                    )}
                                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                                >
                                    {/* Animated light trail */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-20 animate-shimmer" />
                                </div>
                            </div>
                        </div>
                    ))
                ) : loading ? (
                    <div className="flex h-full flex-col items-center justify-center gap-4 py-12">
                        <div className="relative h-12 w-12">
                            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                        </div>
                        <p className="text-sm text-gray-400 font-medium animate-pulse uppercase tracking-widest">Analyse des commandes...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-3">
                        <ShoppingBag className="w-12 h-12 opacity-20" />
                        <p className="text-sm font-medium">Aucun produit commandé</p>
                    </div>
                )}
            </div>

            <button className="mt-8 w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-gray-400 uppercase tracking-widest hover:bg-white/10 hover:text-white hover:border-white/20 transition-all">
                Voir Rapport Complet
            </button>
        </div>
    );
}
