"use client";

import React, { useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SystemMonitor() {
    const [stats, setStats] = useState({
        cpu: 24,
        ram: 42,
        latency: 124,
        uptime: '99.9%'
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({
                ...prev,
                cpu: Math.floor(Math.random() * 20) + 15,
                latency: Math.floor(Math.random() * 50) + 100
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="glass-premium rounded-3xl p-6 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-xl">
                        <Activity className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tighter">État du Système</h3>
                </div>
                <span className="flex items-center gap-2 text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full animate-pulse">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
                    OPÉRATIONNEL
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                        <Cpu className="w-4 h-4 text-indigo-400" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">CPU Load</span>
                    </div>
                    <div className="flex items-end gap-1">
                        <span className="text-2xl font-black text-white">{stats.cpu}%</span>
                        <div className="h-4 w-1 bg-indigo-500 rounded-full mb-1.5"></div>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                        <HardDrive className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">RAM</span>
                    </div>
                    <div className="flex items-end gap-1">
                        <span className="text-2xl font-black text-white">{stats.ram}%</span>
                        <div className="h-4 w-1 bg-emerald-500 rounded-full mb-1.5"></div>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-amber-500/30 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Latence API</span>
                    </div>
                    <div className="flex items-end gap-1">
                        <span className="text-2xl font-black text-white">{stats.latency}ms</span>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-indigo-400" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Uptime</span>
                    </div>
                    <div className="flex items-end gap-1">
                        <span className="text-2xl font-black text-white">{stats.uptime}</span>
                    </div>
                </div>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                <p className="text-[10px] text-indigo-300 font-bold leading-relaxed">
                    INFO: La base de données PostgreSQL répond normalement. Aucun goulot d'étranglement détecté sur les requêtes `/api/v1/orders`.
                </p>
            </div>
        </div>
    );
}
