"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, TrendingUp, ShoppingBag, Users, Zap } from 'lucide-react';
import { apiFetch } from '@/services/auth.service';

export const WelcomeBanner = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [mounted, setMounted] = useState(false);
    const [stats, setStats] = useState({ orders: 0, users: 0, revenue: 0 });

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);

        // Charger les stats rapides
        Promise.allSettled([
            apiFetch<any[]>('/v1/orders'),
            apiFetch<any[]>('/v1/users'),
        ]).then(([ordersRes, usersRes]) => {
            const orders = ordersRes.status === 'fulfilled' ? ordersRes.value : [];
            const users  = usersRes.status === 'fulfilled'  ? usersRes.value  : [];
            const revenue = Array.isArray(orders)
                ? orders.reduce((s: number, o: any) => s + (o.totalAmount || 0), 0)
                : 0;
            setStats({
                orders: Array.isArray(orders) ? orders.length : 0,
                users:  Array.isArray(users)  ? users.length  : 0,
                revenue,
            });
        });

        return () => clearInterval(timer);
    }, []);

    const formatDate = (d: Date) =>
        new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(d);

    const formatTime = (d: Date) =>
        d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    const getGreeting = () => {
        if (!mounted) return 'Bonjour';
        const h = currentTime.getHours();
        if (h < 12) return 'Bonjour';
        if (h < 18) return 'Bon après-midi';
        return 'Bonsoir';
    };

    const quickStats = [
        { label: 'Commandes', value: stats.orders, icon: ShoppingBag, color: 'text-primary' },
        { label: 'Clients',   value: stats.users,  icon: Users,       color: 'text-blue-400' },
        { label: 'CA Total',  value: `${stats.revenue.toFixed(0)} TND`, icon: TrendingUp, color: 'text-emerald-400' },
    ];

    return (
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-slate-900 via-[#0c1523] to-slate-950 p-8 md:p-10 shadow-2xl animate-fade-in">
            {/* Ambient glow */}
            <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-600/5 blur-[80px]" />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
                {/* Left */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="live-dot"><span /><span /></div>
                        <span className="section-header">Wiki Administration</span>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium mb-1">{getGreeting()},</p>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
                            Wiki{' '}
                            <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
                                Team
                            </span>
                        </h1>
                    </div>
                    <p className="text-slate-400 text-sm max-w-md leading-relaxed">
                        Centre de commande opérationnel. Toutes les métriques sont en temps réel.
                    </p>

                    {/* Quick stats inline */}
                    <div className="flex flex-wrap gap-4 pt-2">
                        {quickStats.map((s, i) => (
                            <div key={i} className="flex items-center gap-2.5 bg-white/[0.04] border border-white/[0.06] rounded-2xl px-4 py-2.5">
                                <s.icon size={14} className={s.color} />
                                <span className="text-white font-black text-sm tabular-nums">{mounted ? s.value : '—'}</span>
                                <span className="text-slate-500 text-[10px] font-bold uppercase">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right — clock */}
                <div className="flex shrink-0 flex-col gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-xl lg:min-w-[260px]">
                    <div className="flex items-center gap-2 text-primary">
                        <Zap size={14} />
                        <span className="section-header text-primary">Temps réel</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-slate-500 shrink-0" />
                        <span className="text-slate-300 text-sm font-semibold capitalize truncate">
                            {mounted ? formatDate(currentTime) : '—'}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Clock size={16} className="text-slate-500 shrink-0" />
                        <span className="text-white text-3xl font-black tracking-tighter tabular-nums font-mono">
                            {mounted ? formatTime(currentTime) : '--:--'}
                        </span>
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Système opérationnel
                    </div>
                </div>
            </div>
        </div>
    );
};
