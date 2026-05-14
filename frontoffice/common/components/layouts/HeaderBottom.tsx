'use client'

import React, { useState, useEffect } from 'react'
import SearchSection from './SearchSection'
import Link from 'next/link'
import CartSection from '@/common/components/layouts/CartSection'
import Navigation from '@/common/components/layouts/Navigation'
import UserMenu from '@/common/components/layouts/UserMenu'
import { Menu, X } from 'lucide-react'

const HeaderBottom = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-wiki-btn/90 backdrop-blur-xl shadow-2xl py-2' : 'bg-wiki-btn py-4'}`}>
            <div className="container mx-auto px-4 lg:px-6">
                <div className="flex items-center justify-between gap-4 md:gap-8">
                    {/* Hamburger Menu Button - Mobile Only */}
                    <button
                        className="lg:hidden text-white p-2 hover:bg-white/10 rounded-xl transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    {/* Logo */}
                    <Link href="/" className='cursor-pointer flex-shrink-0 group'>
                        <div className="relative">
                            <div className="absolute -inset-2 bg-wiki opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></div>
                            <img 
                                src="/assets/img/logo-wiki.svg" 
                                alt="WIKI Logo" 
                                className={`transition-all duration-300 ${isScrolled ? 'h-10 md:h-12' : 'h-12 md:h-16'}`} 
                            />
                        </div>
                    </Link>

                    {/* Search - Desktop */}
                    <div className="hidden md:block flex-1 max-w-2xl">
                        <SearchSection />
                    </div>

                    {/* User Menu and Cart */}
                    <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
                        <UserMenu />
                        <CartSection />
                    </div>
                </div>

                {/* Mobile Search Bar */}
                <div className="md:hidden mt-4 pb-1">
                    <SearchSection />
                </div>
            </div>

            {/* Desktop Navigation */}
            <Navigation mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        </div>
    )
}

export default HeaderBottom