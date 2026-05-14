"use client";

import {
  Package, ShoppingCart, Users, MessageSquare,
  Wrench, Tag, BarChart2, Star, FileText
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const actions = [
  {
    title: "Commandes",
    description: "Suivi des ventes",
    icon: ShoppingCart,
    href: "/orders",
    accent: "primary",
  },
  {
    title: "Clients",
    description: "Base utilisateurs",
    icon: Users,
    href: "/users",
    accent: "blue",
  },
  {
    title: "Produits",
    description: "Catalogue",
    icon: Package,
    href: "/products",
    accent: "violet",
  },
  {
    title: "Réparations",
    description: "Demandes SAV",
    icon: Wrench,
    href: "/repair-requests",
    accent: "orange",
  },
  {
    title: "Coupons",
    description: "Promotions",
    icon: Tag,
    href: "/coupons",
    accent: "pink",
  },
  {
    title: "Avis",
    description: "Feedback clients",
    icon: Star,
    href: "/reviews",
    accent: "amber",
  },
  {
    title: "Support",
    description: "Messages contact",
    icon: MessageSquare,
    href: "/contact-messages",
    accent: "cyan",
  },
  {
    title: "Paiements",
    description: "Transactions",
    icon: FileText,
    href: "/payments",
    accent: "emerald",
  },
];

const ACCENT: Record<string, { bg: string; text: string; glow: string }> = {
  primary:  { bg: 'bg-primary/10 border-primary/20',     text: 'text-primary',     glow: 'hover:shadow-primary/10' },
  blue:     { bg: 'bg-blue-500/10 border-blue-500/20',   text: 'text-blue-400',    glow: 'hover:shadow-blue-500/10' },
  violet:   { bg: 'bg-violet-500/10 border-violet-500/20', text: 'text-violet-400', glow: 'hover:shadow-violet-500/10' },
  orange:   { bg: 'bg-orange-500/10 border-orange-500/20', text: 'text-orange-400', glow: 'hover:shadow-orange-500/10' },
  pink:     { bg: 'bg-pink-500/10 border-pink-500/20',   text: 'text-pink-400',    glow: 'hover:shadow-pink-500/10' },
  amber:    { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400',   glow: 'hover:shadow-amber-500/10' },
  cyan:     { bg: 'bg-cyan-500/10 border-cyan-500/20',   text: 'text-cyan-400',    glow: 'hover:shadow-cyan-500/10' },
  emerald:  { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400', glow: 'hover:shadow-emerald-500/10' },
};

export function QuickActions() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart2 size={14} className="text-primary" />
          <span className="section-header">Accès rapide</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {actions.map((action, i) => {
          const a = ACCENT[action.accent];
          return (
            <Link
              key={i}
              href={action.href}
              className={cn(
                "group relative flex flex-col items-center gap-3 p-4 rounded-2xl",
                "glass-premium border border-white/[0.06] transition-all duration-300",
                "hover:-translate-y-1 hover:shadow-lg hover:border-white/10",
                a.glow,
                "text-center"
              )}
            >
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300",
                a.bg, a.text,
                "group-hover:scale-110"
              )}>
                <action.icon size={18} />
              </div>
              <div>
                <p className="text-[11px] font-black text-white uppercase tracking-tight leading-none mb-0.5">
                  {action.title}
                </p>
                <p className="text-[9px] text-slate-600 font-medium">{action.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
