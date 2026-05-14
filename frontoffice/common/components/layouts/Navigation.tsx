'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { categoryService, Category } from '@/common/services/categoryService'
import { Wrench } from 'lucide-react'

interface NavigationProps {
    mobileMenuOpen?: boolean;
    setMobileMenuOpen?: (open: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({ mobileMenuOpen = false, setMobileMenuOpen }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCategory, setActiveCategory] = useState<Category | null>(null);
    const [mobileActiveCategorySlug, setMobileActiveCategorySlug] = useState<string | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isManualOpen, setIsManualOpen] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            const data = await categoryService.getCategoryTree();
            setCategories(data);
        };
        fetchCategories();
    }, []);

    const toggleMobileCategory = (categorySlug: string) => {
        setMobileActiveCategorySlug(mobileActiveCategorySlug === categorySlug ? null : categorySlug);
    };

    return (
        <>
            {/* Desktop Navigation */}
            <div className="w-full h-16 bg-zinc-100 hidden lg:block relative">
                <div className="flex justify-between">
                    <div className='flex flex-wrap items-center'>
                        <div
                            className="relative"
                            onMouseEnter={() => setIsMenuOpen(true)}
                            onMouseLeave={() => {
                                if (!isManualOpen) {
                                    setIsMenuOpen(false);
                                }
                            }}
                        >
                            <div
                                onClick={(e) => {
                                    setIsManualOpen(!isManualOpen);
                                    setIsMenuOpen(!isManualOpen);
                                }}
                                className={`ml-16 w-56 h-12 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-500 shadow-lg ${isMenuOpen || isManualOpen ? 'bg-wiki-btn shadow-wiki/40 -translate-y-1' : 'bg-wiki hover:bg-wiki-dark'}`}
                            >
                                <div className="text-white font-black text-sm uppercase tracking-widest mr-3">Nos produits</div>
                                <div className={`p-1 rounded-full bg-white/20 transition-transform duration-500 ${isMenuOpen || isManualOpen ? 'rotate-180' : ''}`}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M6 9l6 6 6-6" />
                                    </svg>
                                </div>
                            </div>

                            {/* Mega Menu Dropdown */}
                            <div className={`absolute left-0 lg:left-4 xl:left-16 w-[min(1000px,calc(100vw-2rem))] h-[550px] bg-white/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-50 top-16 border border-slate-200 rounded-b-2xl overflow-hidden transition-all duration-300 flex ${isMenuOpen || isManualOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                                {/* Level 1: Main Categories */}
                                <div className="w-1/3 border-r border-slate-100 h-full overflow-y-auto bg-slate-50/50 p-4 scrollbar-thin scrollbar-thumb-slate-200">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Catégories</div>
                                    {categories.map(category => (
                                        <Link
                                            href={`/${category.slug}`}
                                            key={category.slug}
                                            onMouseEnter={() => setActiveCategory(category)}
                                            onClick={() => {
                                                if (isManualOpen) setIsManualOpen(false);
                                                setIsMenuOpen(false);
                                            }}
                                            className={`p-3 px-4 cursor-pointer flex justify-between items-center text-sm font-bold transition-all duration-200 rounded-xl mb-1 ${activeCategory?.slug === category.slug ? 'bg-wiki text-white shadow-md shadow-wiki/20' : 'text-slate-600 hover:bg-white hover:shadow-sm hover:text-wiki'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeCategory?.slug === category.slug ? 'bg-white/20' : 'bg-slate-100 text-slate-400'}`}>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="3" y="3" width="7" height="7"></rect>
                                                        <rect x="14" y="3" width="7" height="7"></rect>
                                                        <rect x="14" y="14" width="7" height="7"></rect>
                                                        <rect x="3" y="14" width="7" height="7"></rect>
                                                    </svg>
                                                </div>
                                                <span>{category.name}</span>
                                            </div>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={activeCategory?.slug === category.slug ? 'opacity-100' : 'opacity-0 -translate-x-2 transition-all'}>
                                                <path d="M9 18l6-6-6-6" />
                                            </svg>
                                        </Link>
                                    ))}
                                </div>

                                {/* Levels 2 & 3: Subcategories and Sub-subcategories */}
                                <div className="w-2/3 p-8 h-full overflow-y-auto bg-white scrollbar-thin scrollbar-thumb-slate-200">
                                    {activeCategory ? (
                                        <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                                            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                                                <div className="bg-wiki/10 p-3 rounded-2xl">
                                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-wiki">
                                                        <path d="M4 6h16M4 12h16M4 18h7" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{activeCategory.name}</h3>
                                                    <p className="text-slate-500 text-sm mt-1">{activeCategory.subCategories?.length || 0} sous-catégories disponibles</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-x-12 gap-y-10">
                                                {activeCategory.subCategories && activeCategory.subCategories.length > 0 ? (
                                                    activeCategory.subCategories.map(sub => (
                                                        <div key={sub.slug} className="relative">
                                                            <Link
                                                                href={`/${sub.slug}`}
                                                                className="flex items-center gap-3 mb-4 group"
                                                                onClick={() => {
                                                                    setIsManualOpen(false);
                                                                    setIsMenuOpen(false);
                                                                }}
                                                            >
                                                                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:bg-wiki group-hover:border-wiki group-hover:text-white text-slate-500 transition-all font-bold text-xs shadow-sm">
                                                                    {sub.name.substring(0, 2).toUpperCase()}
                                                                </div>
                                                                <span className="font-bold text-slate-700 group-hover:text-wiki transition-colors text-base tracking-tight">{sub.name}</span>
                                                            </Link>

                                                            <div className="flex flex-col gap-2 pl-8">
                                                                {sub.subCategories && sub.subCategories.length > 0 ? (
                                                                    sub.subCategories.map(subsub => (
                                                                        <Link
                                                                            href={`/${subsub.slug}`}
                                                                            key={subsub.slug}
                                                                            className="flex items-center gap-3 text-slate-500 hover:text-wiki hover:bg-slate-50 py-2 px-3 rounded-xl transition-all group/item border border-transparent hover:border-slate-100 relative"
                                                                            onClick={() => {
                                                                                setIsManualOpen(false);
                                                                                setIsMenuOpen(false);
                                                                            }}
                                                                        >
                                                                            {/* Horizontal line connector */}
                                                                            <div className="absolute -left-4 top-1/2 w-4 h-px bg-slate-100" />

                                                                            <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 group-hover/item:text-wiki group-hover/item:border-wiki/30 transition-all">
                                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                                                                    <polyline points="21 15 16 10 5 21" />
                                                                                </svg>
                                                                            </div>
                                                                            <span className="font-semibold text-sm">{subsub.name}</span>
                                                                        </Link>
                                                                    ))
                                                                ) : (
                                                                    <div className="text-slate-400 text-sm py-2 px-3 italic flex items-center gap-2">
                                                                        <div className="absolute -left-4 top-1/2 w-4 h-px bg-slate-100" />
                                                                        Voir tout dans {sub.name}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="col-span-2 flex flex-col items-center justify-center py-12 text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-4 text-slate-300">
                                                            <circle cx="12" cy="12" r="10" />
                                                            <line x1="8" y1="12" x2="16" y2="12" />
                                                        </svg>
                                                        <span className="font-medium">Aucune sous-catégorie disponible</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-6 animate-in fade-in duration-500">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-wiki/5 blur-3xl rounded-full" />
                                                <div className="bg-slate-50 border border-slate-100 shadow-sm p-8 rounded-[2rem] relative">
                                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
                                                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                                        <line x1="16" y1="2" x2="16" y2="22" className="text-slate-200" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <p className="font-bold text-slate-400 uppercase tracking-widest text-sm">Survolez une catégorie</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className='mr-20' />
                        <Link href="/repair" className="px-6 h-16 flex items-center justify-center hover:bg-wiki cursor-pointer group transition-all">
                            <div className="flex flex-col items-center gap-1">
                                <Wrench size={18} className="text-slate-400 group-hover:text-white transition-colors" />
                                <div className="text-slate-500 font-bold text-[10px] uppercase group-hover:text-white text-center tracking-tighter">Wiki Repair</div>
                            </div>
                        </Link>
                        <Link href="#" className="px-6 h-16 flex items-center justify-center hover:bg-wiki cursor-pointer group">
                            <div className="text-slate-500 font-semibold text-sm group-hover:text-white text-center">Service Entreprise</div>
                        </Link>
                        <Link href="/nos-magasins" className="px-6 h-16 flex items-center justify-center hover:bg-wiki cursor-pointer group">
                            <div className="text-slate-500 font-semibold text-sm group-hover:text-white text-center">Nos Magasins</div>
                        </Link>
                        <Link href="/blogs" className="px-6 h-16 flex items-center justify-center hover:bg-wiki cursor-pointer group">
                            <div className="text-slate-500 font-semibold text-sm group-hover:text-white text-center">Blog</div>
                        </Link>
                        <Link href="/contact" className="px-6 h-16 flex items-center justify-center hover:bg-wiki cursor-pointer group">
                            <div className="text-slate-500 font-semibold text-sm group-hover:text-white text-center">Nous Contacter</div>
                        </Link>
                    </div>
                    <div className='font-semibold items-center flex mr-16 text-sky-800'>
                        <a href="">30 Days Free Return</a>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            <div className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black bg-opacity-50"
                    onClick={() => setMobileMenuOpen?.(false)}
                />

                {/* Drawer */}
                <div className={`absolute left-0 top-0 bottom-0 w-80 bg-white shadow-xl overflow-y-auto transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="p-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800">Menu</h2>
                            <button onClick={() => setMobileMenuOpen?.(false)} className="p-2">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        {/* Navigation Links */}
                        <nav className="space-y-2">
                            <Link href="/repair" className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-wiki-light/20 hover:text-wiki-dark rounded-lg font-bold" onClick={() => setMobileMenuOpen?.(false)}>
                                <Wrench size={20} />
                                Wiki Repair
                            </Link>
                            <Link href="#" className="block px-4 py-3 text-slate-700 hover:bg-wiki-light/20 hover:text-wiki-dark rounded-lg font-medium" onClick={() => setMobileMenuOpen?.(false)}>
                                Service Entreprise
                            </Link>
                            <Link href="/nos-magasins" className="block px-4 py-3 text-slate-700 hover:bg-wiki-light/20 hover:text-wiki-dark rounded-lg font-medium" onClick={() => setMobileMenuOpen?.(false)}>
                                Nos Magasins
                            </Link>
                            <Link href="/blogs" className="block px-4 py-3 text-slate-700 hover:bg-wiki-light/20 hover:text-wiki-dark rounded-lg font-medium" onClick={() => setMobileMenuOpen?.(false)}>
                                Blog
                            </Link>
                            <Link href="/contact" className="block px-4 py-3 text-slate-700 hover:bg-wiki-light/20 hover:text-wiki-dark rounded-lg font-medium" onClick={() => setMobileMenuOpen?.(false)}>
                                Nous Contacter
                            </Link>

                            {/* Categories Accordion */}
                            <div className="border-t pt-4 mt-4">
                                <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Categories</div>
                                {categories.map((category) => (
                                    <div key={category.slug} className="mb-2">
                                        <div className="w-full h-12 flex items-center justify-between px-4 hover:bg-wiki-light/10 rounded-lg">
                                            <Link
                                                href={`/${category.slug}`}
                                                className="flex-1 text-slate-700 font-medium py-3"
                                                onClick={() => setMobileMenuOpen?.(false)}
                                            >
                                                {category.name}
                                            </Link>
                                            <button
                                                onClick={() => toggleMobileCategory(category.slug)}
                                                className="p-3 text-slate-400"
                                            >
                                                <svg
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    className={`transform transition-transform ${mobileActiveCategorySlug === category.slug ? 'rotate-180' : ''}`}
                                                >
                                                    <polyline points="6 9 12 15 18 9"></polyline>
                                                </svg>
                                            </button>
                                        </div>
                                        {mobileActiveCategorySlug === category.slug && category.subCategories && (
                                            <div className="ml-4 mt-2 space-y-2">
                                                {category.subCategories.map((sub) => (
                                                    <Link
                                                        key={sub.slug}
                                                        href={`/${sub.slug}`}
                                                        className="block px-4 py-2 text-sm text-slate-600 hover:text-wiki-dark"
                                                        onClick={() => setMobileMenuOpen?.(false)}
                                                    >
                                                        {sub.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </nav>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Navigation