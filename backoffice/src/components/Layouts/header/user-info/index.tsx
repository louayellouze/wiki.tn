"use client";

import { ChevronUpIcon } from "@/assets/icons";
import { Dropdown, DropdownContent, DropdownTrigger } from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";
import { logout, getUserFromToken, apiFetch } from "@/services/auth.service";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LogOutIcon } from "./icons";
import { User, Shield, LayoutDashboard, History } from "lucide-react";

interface UserProfile {
  firstName?: string;
  lastName?: string;
  username?: string;
  role?: string;
  email?: string;
}

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(" ");
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
  return (
    <div className="size-full flex items-center justify-center bg-gradient-to-br from-primary/30 to-emerald-600/20 text-primary font-black text-sm">
      {initials}
    </div>
  );
}

export function UserInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState<{ username: string; role: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    setToken(getUserFromToken());
    apiFetch<UserProfile>("/v1/users/me")
      .then(setProfile)
      .catch(() => {});
  }, []);

  const displayName = profile?.firstName && profile?.lastName
    ? `${profile.firstName} ${profile.lastName}`
    : token?.username ?? "Admin";

  const role = profile?.role ?? token?.role ?? "—";
  const email = profile?.email ?? "";

  const ROLE_COLOR: Record<string, string> = {
    ADMIN:     "text-primary",
    WEBMASTER: "text-blue-400",
    INFOLINE:  "text-amber-400",
  };

  return (
    <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
      <DropdownTrigger className="rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all">
        <figure className="flex items-center gap-2.5 p-1 pr-3 rounded-xl hover:bg-white/[0.05] transition-colors border border-transparent hover:border-white/[0.08]">
          <div className="relative size-9 rounded-xl overflow-hidden border border-white/10 shrink-0">
            <Initials name={displayName} />
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-[#030712]" />
          </div>
          <figcaption className="hidden lg:flex items-center gap-2">
            <div className="text-left">
              <div className="text-[11px] font-black text-white leading-none truncate max-w-[100px]">{displayName}</div>
              <div className={cn("text-[9px] font-black uppercase tracking-widest leading-none mt-0.5", ROLE_COLOR[role] ?? "text-slate-500")}>
                {role}
              </div>
            </div>
            <ChevronUpIcon className={cn("size-3.5 text-slate-600 rotate-180 transition-transform duration-200", isOpen && "rotate-0 text-primary")} />
          </figcaption>
        </figure>
      </DropdownTrigger>

      <DropdownContent
        className="min-w-[260px] rounded-2xl border border-white/[0.08] bg-[#080f1d] shadow-2xl p-0 overflow-hidden mt-2"
        align="end"
      >
        {/* Profile header */}
        <div className="p-5 border-b border-white/[0.05]">
          <div className="flex items-center gap-3.5">
            <div className="size-12 rounded-xl overflow-hidden border border-white/10 shrink-0">
              <Initials name={displayName} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-black text-white truncate">{displayName}</div>
              {email && <div className="text-[10px] text-slate-500 truncate mt-0.5">{email}</div>}
              <div className={cn("inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border", {
                "bg-primary/10 text-primary border-primary/20": role === "ADMIN",
                "bg-blue-400/10 text-blue-400 border-blue-400/20": role === "WEBMASTER",
                "bg-amber-400/10 text-amber-400 border-amber-400/20": role === "INFOLINE",
                "bg-slate-400/10 text-slate-400 border-slate-400/20": !["ADMIN","WEBMASTER","INFOLINE"].includes(role),
              })}>
                <Shield size={8} />
                {role}
              </div>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="p-2 space-y-0.5">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all group text-[11px] font-bold uppercase tracking-widest"
          >
            <LayoutDashboard size={14} className="group-hover:text-primary transition-colors" />
            Tableau de bord
          </Link>
          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all group text-[11px] font-bold uppercase tracking-widest"
          >
            <User size={14} className="group-hover:text-primary transition-colors" />
            Mon profil
          </Link>
          <Link
            href="/historique"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all group text-[11px] font-bold uppercase tracking-widest"
          >
            <History size={14} className="group-hover:text-primary transition-colors" />
            Historique
          </Link>
        </div>

        {/* Logout */}
        <div className="p-2 border-t border-white/[0.05]">
          <button
            onClick={() => { setIsOpen(false); logout(); }}
            className="btn-danger w-full justify-center"
          >
            <LogOutIcon className="size-3.5" />
            Déconnexion
          </button>
        </div>
      </DropdownContent>
    </Dropdown>
  );
}
