"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
    PlusCircle, 
    Wrench, 
    ShoppingCart, 
    MessageSquare, 
    Plus,
    ChevronRight,
    Settings,
    FileBarChart,
    Users
} from 'lucide-react';
import { getUserRole } from '@/services/auth.service';

const ACTION_CARDS = [
    {
        title: "Nouveau Produit",
        desc: "Ajouter au catalogue",
        icon: PlusCircle,
        href: "/products",
        color: "from-blue-500 to-indigo-600",
        roles: ["ADMIN", "INFOLINE"]
    },
    {
        title: "Wiki Repair",
        desc: "Tarifs et demandes",
        icon: Wrench,
        href: "/repair",
        color: "from-orange-400 to-red-500",
        roles: ["ADMIN", "INFOLINE"]
    },
    {
        title: "Commandes",
        desc: "Ventes récentes",
        icon: ShoppingCart,
        href: "/orders",
        color: "from-emerald-400 to-teal-600",
        roles: ["ADMIN", "INFOLINE"]
    },
    {
        title: "Gestion Système",
        desc: "Configuration avancée",
        icon: Settings,
        href: "/settings",
        color: "from-gray-700 to-black",
        roles: ["ADMIN"]
    },
    {
        title: "Rapports",
        desc: "Analyse profonde",
        icon: FileBarChart,
        href: "/analytics",
        color: "from-indigo-600 to-purple-700",
        roles: ["ADMIN"]
    },
    {
        title: "Utilisateurs",
        desc: "Gérer l'équipe",
        icon: Users,
        href: "/users",
        color: "from-cyan-500 to-blue-600",
        roles: ["ADMIN"]
    }
];

export const QuickActions = () => {
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        setUserRole(getUserRole());
    }, []);

    const filteredActions = ACTION_CARDS.filter(action => {
        if (!userRole) return true; // Show all if no role yet
        const normalizedRole = userRole.toUpperCase().replace('ROLE_', '');
        return action.roles.includes(normalizedRole);
    });

    return (
        <div className="mt-8 mb-12">
            <h2 className="mb-6 text-xl font-bold text-white flex items-center gap-3">
                <div className="h-8 w-1 bg-indigo-500 rounded-full"></div>
                Commandes Rapides
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md border border-white/10">
                    {userRole || 'Anonyme'}
                </span>
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {filteredActions.map((action, idx) => (
                    <Link 
                        key={idx} 
                        href={action.href}
                        className="group relative glass-premium rounded-2xl p-5 transition-all duration-300 hover:-translate-y-2 glow-card overflow-hidden"
                    >
                        {/* Decorative Background Icon */}
                        <action.icon className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 rotate-12 transition-transform group-hover:scale-110" />

                        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${action.color} text-white shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                            <action.icon size={24} />
                        </div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-black text-white text-sm tracking-tight">{action.title}</h3>
                                {action.roles.length === 1 && action.roles[0] === "ADMIN" && (
                                    <span className="text-[8px] font-black bg-indigo-500 text-white px-1.5 py-0.5 rounded uppercase">Elite</span>
                                )}
                            </div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest group-hover:text-gray-400 transition-colors">{action.desc}</p>
                        </div>

                        <div className="mt-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter">Ouvrir</span>
                            <ChevronRight className="text-indigo-400" size={14} />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};
