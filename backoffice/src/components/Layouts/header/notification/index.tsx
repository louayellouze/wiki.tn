"use client";

import { Dropdown, DropdownContent, DropdownTrigger } from "@/components/ui/dropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { BellIcon } from "./icons";
import { getUnreadNotifications, markAsRead, markAllAsRead, NotificationResponse } from "@/services/notification.service";
import {
  ShoppingCart, User, Wrench, Package, MessageSquare,
  AlertCircle, CheckCheck, Bell
} from "lucide-react";

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  NEW_CLIENT:           { icon: User,          color: "text-blue-400 bg-blue-400/10 border-blue-400/20",     label: "Nouveau client" },
  NEW_ORDER:            { icon: ShoppingCart,   color: "text-primary bg-primary/10 border-primary/20",        label: "Nouvelle commande" },
  REPAIR_QUOTE_SENT:    { icon: Wrench,         color: "text-orange-400 bg-orange-400/10 border-orange-400/20", label: "Devis envoyé" },
  REPAIR_QUOTE_ACCEPTED:{ icon: CheckCheck,     color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", label: "Devis accepté" },
  REPAIR_QUOTE_REJECTED:{ icon: AlertCircle,    color: "text-red-400 bg-red-400/10 border-red-400/20",        label: "Devis refusé" },
  LOW_STOCK:            { icon: Package,        color: "text-amber-400 bg-amber-400/10 border-amber-400/20",  label: "Stock faible" },
  NEW_MESSAGE:          { icon: MessageSquare,  color: "text-violet-400 bg-violet-400/10 border-violet-400/20", label: "Nouveau message" },
};

function getConfig(type: string) {
  return TYPE_CONFIG[type] ?? { icon: Bell, color: "text-slate-400 bg-slate-400/10 border-slate-400/20", label: type };
}

function relativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h}h`;
  return `il y a ${Math.floor(h / 24)}j`;
}

export function Notification() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setNotifications(await getUnreadNotifications());
    } catch {}
  };

  const handleRead = async (id: number) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch {}
  };

  const handleReadAll = async () => {
    try {
      await markAllAsRead();
      setNotifications([]);
      setIsOpen(false);
    } catch {}
  };

  return (
    <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
      <DropdownTrigger
        className="relative grid size-10 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-slate-400 outline-none hover:text-white hover:border-white/20 hover:bg-white/[0.07] transition-all duration-200"
        aria-label="Notifications"
      >
        <BellIcon className="size-[18px]" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-black text-white shadow-lg shadow-primary/30">
            {notifications.length > 9 ? "9+" : notifications.length}
            <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-primary opacity-40" />
          </span>
        )}
      </DropdownTrigger>

      <DropdownContent
        align={isMobile ? "end" : "center"}
        className="min-w-[340px] rounded-2xl border border-white/[0.08] bg-[#080f1d] shadow-2xl p-0 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Notifications</h3>
            <p className="text-[10px] text-slate-600 mt-0.5">Centre d&apos;alertes Wiki</p>
          </div>
          {notifications.length > 0 && (
            <span className="badge badge-primary">{notifications.length} nouvelles</span>
          )}
        </div>

        {/* List */}
        <ul className="max-h-[380px] overflow-y-auto custom-scrollbar divide-y divide-white/[0.04]">
          {notifications.length === 0 ? (
            <li className="flex flex-col items-center justify-center py-14 gap-3 text-center">
              <div className="size-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                <Bell className="size-5 text-slate-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tout est à jour</p>
                <p className="text-[10px] text-slate-700 mt-0.5">Aucune nouvelle notification</p>
              </div>
            </li>
          ) : (
            notifications.map((n) => {
              const cfg = getConfig(n.type);
              const Icon = cfg.icon;
              return (
                <li key={n.id}>
                  <button
                    onClick={() => handleRead(n.id)}
                    className="group w-full flex items-start gap-3.5 px-5 py-4 text-left hover:bg-white/[0.03] transition-colors"
                  >
                    <div className={`shrink-0 size-9 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105 ${cfg.color}`}>
                      <Icon size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[11px] font-black text-white uppercase tracking-tight">
                          {cfg.label}
                        </span>
                        <span className="text-[9px] text-slate-600 shrink-0 font-medium">
                          {relativeTime(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed group-hover:text-slate-300 transition-colors">
                        {n.message}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })
          )}
        </ul>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-3 border-t border-white/[0.05]">
            <button
              onClick={handleReadAll}
              className="btn-ghost w-full justify-center gap-2"
            >
              <CheckCheck size={13} />
              Tout marquer comme lu
            </button>
          </div>
        )}
      </DropdownContent>
    </Dropdown>
  );
}
