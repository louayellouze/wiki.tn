"use client";

import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AIInsightCard() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className={cn(
            "glass-premium rounded-3xl p-6 relative overflow-hidden group transition-all duration-700 delay-300 transform",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        )}>
            {/* Animated Glow */}
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-neon-cyan/20 blur-[60px] group-hover:bg-neon-cyan/30 transition-colors duration-500"></div>
            
            <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-neon-cyan blur-md opacity-50 rounded-full animate-pulse"></div>
                    <div className="relative bg-[#020d1a] p-3 rounded-full border border-neon-cyan/50">
                        <Sparkles className="w-6 h-6 text-neon-cyan" />
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white tracking-wide">Wiki AI Insights</h3>
                    <p className="text-sm text-gray-400">Analyse en temps réel</p>
                </div>
            </div>

            <div className="space-y-4 relative z-10 mt-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-4 items-start hover:bg-white/10 transition-colors">
                    <div className="bg-emerald-500/20 p-2 rounded-lg mt-1">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h4 className="text-white font-medium mb-1">Croissance des Ventes</h4>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Les ventes de <span className="text-emerald-400 font-bold">PC Portables Gamer</span> sont en hausse de 15% cette semaine. Prévoyez un réapprovisionnement d'ici 3 jours.
                        </p>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-4 items-start hover:bg-white/10 transition-colors">
                    <div className="bg-neon-red/20 p-2 rounded-lg mt-1">
                        <AlertTriangle className="w-5 h-5 text-neon-red" />
                    </div>
                    <div>
                        <h4 className="text-white font-medium mb-1">Alerte Stock</h4>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            <span className="text-neon-red font-bold">3 articles</span> critiques nécessitent votre attention immédiate dans la catégorie Composants.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
