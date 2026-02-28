'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/common/services/authService'

const UserMenu = () => {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<{ firstName: string; lastName: string } | null>(null);
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

    const handleLogout = async () => {
        try {
            await AuthService.logout();
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setIsLoggedIn(false);
            router.push('/'); // Redirect to homepage instead of login
        }
    };

    if (isLoggedIn) {
        return (
            <div className="relative">
                <div
                    className="flex justify-center items-center gap-3 cursor-pointer"
                    onClick={() => setShowDropdown(!showDropdown)}
                >
                    <div className="flex justify-center items-center text-white">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="stroke-white" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className="text-white text-sm font-normal hidden md:block">
                        {user ? `${user.firstName}` : 'Compte'}
                    </div>
                </div>

                {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                        <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Profile
                        </Link>
                        <div
                            onClick={handleLogout}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                        >
                            Sign out
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="flex justify-center items-center gap-2 md:gap-4">
            <Link href="/auth/login" className="flex justify-center items-center gap-2 cursor-pointer">
                <div className="flex justify-center items-center text-white">
                    <svg width="20" height="20" className="md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <div className="text-white text-xs md:text-sm font-normal hidden sm:block">Sign in</div>
            </Link>
            <Link href="/auth/signup" className="hidden sm:block">
                <button className="bg-wiki-btn hover:bg-emerald-950 text-white text-xs md:text-sm font-semibold py-1.5 px-3 md:py-2 md:px-4 rounded-full transition-colors">
                    Sign Up
                </button>
            </Link>
        </div>
    )
}

export default UserMenu
