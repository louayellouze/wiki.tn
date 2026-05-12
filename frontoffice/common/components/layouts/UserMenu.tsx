'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/common/services/authService'
import { User as UserType } from '@/app/dtos/auth'
import { User, Mail, ShieldCheck } from 'lucide-react'

const UserMenu = () => {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<UserType | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        setIsLoggedIn(!!token);

        if (token) {
            AuthService.getCurrentUser()
                .then(data => setUser(data))
                .catch(err => console.error("Failed to fetch user profile", err));
        }
    }, []);

    if (isLoggedIn) {
        return (
            <div className="flex items-center gap-3 md:gap-4">
                <Link
                    href="/profile"
                    className="flex items-center gap-3 cursor-pointer group transition-all duration-300"
                    title="Mon profil"
                >
                    <div className="relative">
                        <div className="absolute -inset-1 bg-wiki opacity-0 group-hover:opacity-40 blur-lg rounded-full transition-opacity"></div>
                        <div className="relative flex justify-center items-center text-white bg-white/10 p-2 rounded-xl group-hover:bg-wiki/20 group-hover:scale-110 transition-all border border-white/5">
                            <User size={20} className="group-hover:animate-bounce-slow" />
                        </div>
                    </div>
                    <div className="flex flex-col hidden md:flex">
                        <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest leading-none">Bonjour</span>
                        <span className="text-white text-sm font-black truncate max-w-[100px] group-hover:text-wiki transition-colors">
                            {user ? `${user.firstName}` : 'Compte'}
                        </span>
                    </div>
                </Link>

                {(user?.role === 'ADMIN' || user?.role === 'WEBMASTER' || user?.role === 'INFOLINE') && (
                    <Link
                        href="/admin/contact-messages"
                        className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-white/20 text-white transition-all hover:scale-110 border border-white/5 group"
                        title="Messages Contact"
                    >
                        <Mail size={18} className="group-hover:rotate-12 transition-transform" />
                    </Link>
                )}
            </div>
        )
    }

    return (
        <div className="flex justify-center items-center">
            <Link href="/auth/login">
                <button className="h-10 px-6 bg-white/[0.08] hover:bg-wiki text-white rounded-xl border border-white/10 hover:border-wiki transition-all duration-300 font-bold text-xs uppercase tracking-widest flex items-center gap-2 group overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-wiki/0 via-white/10 to-wiki/0 -translate-x-full group-hover:animate-shimmer" />
                    <User size={16} className="group-hover:scale-125 transition-transform" />
                    <span>Se connecter</span>
                </button>
            </Link>
        </div>
    )
}

export default UserMenu
