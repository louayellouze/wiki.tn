'use client'

import React, { useState } from 'react'
import SearchSection from './SearchSection'
import Link from 'next/link'
import CartSection from '@/common/components/layouts/CartSection'
import Navigation from '@/common/components/layouts/Navigation'
import UserMenu from '@/common/components/layouts/UserMenu'

const HeaderBottom = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="sticky top-0 z-50 w-full shadow-lg bg-wiki-btn">
            <div className="w-full h-16 bg-wiki-btn items-center justify-between px-4 md:px-8 lg:px-16 flex">
                {/* Hamburger Menu Button - Mobile Only */}
                <button
                    className="lg:hidden text-white p-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {mobileMenuOpen ? (
                            <>
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </>
                        ) : (
                            <>
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </>
                        )}
                    </svg>
                </button>

                <Link href="/" className='cursor-pointer'>
                    <img src="/assets/img/logo-wiki.svg" alt="WIKI Logo" className="h-12 md:h-16" />
                </Link>

                {/* Search - Hidden on small mobile, visible on md+ */}
                <div className="hidden md:block flex-1 max-w-2xl mx-4">
                    <SearchSection />
                </div>

                {/* User Menu and Cart */}
                <div className="flex items-center gap-2 md:gap-4 lg:gap-8">
                    <UserMenu />
                    <CartSection />
                </div>
            </div>

            {/* Mobile Search Bar - Inside sticky container */}
            <div className="md:hidden bg-wiki-btn px-4 pb-3">
                <SearchSection />
            </div>

            {/* Desktop Navigation */}
            <Navigation mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        </div>
    )
}

export default HeaderBottom