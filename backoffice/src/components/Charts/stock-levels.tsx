"use client";

import React, { useEffect, useState } from "react";
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { getProducts } from "@/services/product.service";
import { Product } from "@/dtos/product.dto";
import { cn } from "@/lib/utils";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export function StockLevels({ className }: { className?: string }) {
    const [data, setData] = useState<{ x: string; y: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const productsResponse = await getProducts(0, 500);
                const products = (productsResponse && 'content' in productsResponse) ? productsResponse.content : (productsResponse as Product[] || []);
                const sorted = [...products]
                    .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
                    .map((p) => ({
                        x: p.title,
                        y: p.quantity,
                    }));
                setData(sorted);
            } catch (error) {
                console.error("Error fetching stock levels:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const options: ApexOptions = {
        chart: {
            type: "bar",
            toolbar: { show: false },
            fontFamily: "Satoshi, sans-serif",
        },
        plotOptions: {
            bar: {
                horizontal: true,
                borderRadius: 6,
                barHeight: "50%",
                distributed: true,
            },
        },
        colors: ["#10B981", "#3758F9", "#F2994A", "#F09595", "#8155FF", "#05C1FF", "#22AD5C", "#FF9C55", "#8155FF", "#18BFFF"],
        dataLabels: {
            enabled: true,
            formatter: (val) => val.toString(),
            offsetX: -6,
            style: {
                fontSize: "12px",
                fontWeight: 700,
                colors: ["#fff"],
            },
        },
        xaxis: {
            categories: data.map((d) => d.x),
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: {
                style: {
                    colors: "#64748B",
                    fontSize: "12px",
                }
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: "#64748B",
                    fontSize: "12px",
                    fontWeight: 500,
                }
            }
        },
        grid: {
            borderColor: "#E2E8F0",
            strokeDashArray: 5,
            xaxis: {
                lines: { show: true }
            },
            yaxis: {
                lines: { show: false }
            }
        },
        tooltip: {
            theme: "dark",
        },
        legend: {
            show: false
        }
    };

    const [searchTerm, setSearchTerm] = useState("");

    const filteredData = data.filter(item =>
        item.x.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div
            className={cn(
                "glass-premium rounded-2xl p-7.5 shadow-card-2 glow-card flex flex-col h-full",
                className,
            )}
        >
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-body-2xlg font-bold text-white uppercase tracking-wider">
                        Niveaux de Stock
                    </h2>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Inventaire en temps réel</p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
                </div>
            </div>

            <div className="mb-6 relative">
                <input
                    type="text"
                    placeholder="Rechercher un produit..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-emerald-500/50 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-6 max-h-[350px]">
                {!loading && filteredData.length > 0 ? (
                    filteredData.map((item, idx) => {
                        const percentage = Math.min((item.y / 100) * 100, 100);
                        return (
                            <div key={idx} className="group/item">
                                <div className="flex justify-between items-center mb-2.5">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-white group-hover/item:text-emerald-400 transition-colors truncate max-w-[200px]">
                                            {item.x}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-black text-white">{item.y} <span className="text-[10px] opacity-40 uppercase">Unités</span></span>
                                        <span className={cn(
                                            "text-[10px] font-black uppercase px-2 py-0.5 rounded-md border",
                                            item.y > 50 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                item.y > 10 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                    "bg-red-500/10 text-red-500 border-red-500/20"
                                        )}>
                                            {item.y > 50 ? "Optimal" : item.y > 10 ? "Alerte" : "Critique"}
                                        </span>
                                    </div>
                                </div>
                                <div className="premium-progress">
                                    <div
                                        className="premium-progress-bar bg-gradient-to-r from-emerald-600 to-cyan-400"
                                        style={{
                                            width: `${percentage}%`,
                                            color: percentage > 50 ? '#10B981' : percentage > 20 ? '#F59E0B' : '#EF4444'
                                        }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })
                ) : loading ? (
                    <div className="flex h-full items-center justify-center py-20">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-solid border-emerald-500 border-t-transparent shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                    </div>
                ) : (
                    <div className="flex h-full items-center justify-center text-gray-500 font-bold uppercase text-xs py-20">
                        Aucune donnée d'inventaire
                    </div>
                )}
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
                <div className="flex justify-between items-center text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    <span>Statut Global</span>
                    <span className="text-emerald-400">Opérationnel</span>
                </div>
            </div>
        </div>
    );
}
