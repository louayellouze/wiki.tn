"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Sparkles } from 'lucide-react';

export const WelcomeBanner = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [mounted, setMounted] = useState(false);
    const [particles, setParticles] = useState<{top: string, left: string, delay: string, duration: string}[]>([]);

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        
        // Initialize particles on client side only to avoid hydration mismatch
        const newParticles = [...Array(6)].map(() => ({
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 5}s`,
            duration: `${3 + Math.random() * 4}s`
        }));
        setParticles(newParticles);

        return () => clearInterval(timer);
    }, []);

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getGreeting = () => {
        if (!mounted) return "Bonjour";
        const hour = currentTime.getHours();
        if (hour < 12) return "Bonjour";
        if (hour < 18) return "Bon après-midi";
        return "Bonsoir";
    };

    return (
        <div className="relative mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-700 via-indigo-900 to-[#010409] p-10 text-white shadow-2xl border border-white/10 group">
            {/* Background Decoration */}
            <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-[100px] animate-pulse-slow"></div>
            <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-blue-600/20 blur-[100px] animate-pulse-slow"></div>
            
            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
                {particles.map((p, i) => (
                    <div 
                        key={i}
                        className="absolute h-1 w-1 bg-white rounded-full animate-pulse"
                        style={{
                            top: p.top,
                            left: p.left,
                            animationDelay: p.delay,
                            animationDuration: p.duration
                        }}
                    ></div>
                ))}
            </div>
            
            <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-center">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-indigo-200">
                        <div className="p-1.5 rounded-full bg-indigo-500/20">
                            <Sparkles size={16} className="animate-pulse" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-[0.3em]">Wiki Dashboard Elite</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter md:text-6xl">
                        {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-blue-400">Wiki Team</span>
                    </h1>
                    <p className="max-w-lg text-lg text-indigo-100/60 font-medium">
                        Propulsez votre boutique vers de nouveaux sommets. Voici les performances de votre écosystème aujourd'hui.
                    </p>
                </div>

                <div className="flex flex-col gap-5 rounded-3xl bg-white/5 p-8 backdrop-blur-xl border border-white/10 md:items-end shadow-2xl">
                    <div className="flex items-center gap-3">
                        <Calendar size={20} className="text-indigo-300" />
                        <span className="text-lg font-bold capitalize text-indigo-100">
                            {mounted ? formatDate(currentTime) : '--'}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Clock size={24} className="text-indigo-300" />
                        <span className="text-4xl font-black tracking-tight text-white">
                            {mounted ? formatTime(currentTime) : '--:--'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
