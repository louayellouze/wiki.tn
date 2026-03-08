'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/common/services/authService'
import { User as UserType } from '@/app/dtos/auth'

const UserMenu = () => {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<UserType | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);

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
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                    title="Mon profil"
                >
                    <div className="flex justify-center items-center text-white">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className="text-white text-sm font-medium hidden md:block">
                        {user ? `${user.firstName}` : 'Compte'}
                    </div>
                </Link>

                {(user?.role === 'ADMIN' || user?.role === 'WEBMASTER' || user?.role === 'INFOLINE') && (
                    <Link
                        href="/admin/contact-messages"
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title="Messages Contact"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                        </svg>
                    </Link>
                )}
            </div>
        )
    }

    return (
        <div className="flex justify-center items-center">
            <Link href="/auth/login">
                <button className="btn-liquid btn-liquid-login text-sm shadow-md">
                    <span className="liquid"></span>
                    <span className="button_text">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Connexion
                    </span>
                </button>
            </Link>
        </div>
    )
}

export default UserMenu
