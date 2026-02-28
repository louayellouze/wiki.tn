'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import api from '@/common/utils/api'

interface Category {
    id: number;
    name: string;
    subCategories: Category[];
}

interface NavigationProps {
    mobileMenuOpen?: boolean;
    setMobileMenuOpen?: (open: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({ mobileMenuOpen = false, setMobileMenuOpen }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCategory, setActiveCategory] = useState<Category | null>(null);
    const [mobileActiveCategory, setMobileActiveCategory] = useState<number | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/v1/categories/tree');
                setCategories(response.data);
            } catch (error) {
                console.error("Failed to fetch category tree", error);
            }
        };
        fetchCategories();
    }, []);

    const toggleMobileCategory = (categoryId: number) => {
        setMobileActiveCategory(mobileActiveCategory === categoryId ? null : categoryId);
    };

    return (
        <>
            {/* Desktop Navigation */}
            <div className="w-full h-16 bg-zinc-100 hidden lg:block relative">
                <div className="flex justify-between">
                    <div className='flex flex-wrap items-center'>
                        <div className="group relative">
                            <Link href="/products" className="ml-16 w-52 h-16 bg-wiki flex items-center justify-center hover:bg-wiki-dark cursor-pointer">
                                <div className="text-white font-semibold text-base mr-3">Browse categories</div>
                                <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20.42 9.45001L13.9 15.97C13.13 16.74 11.87 16.74 11.1 15.97L4.58002 9.45001" stroke="white" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </Link>

                            {/* Mega Menu Dropdown */}
                            <div className="absolute left-16 w-[800px] h-[400px] bg-white shadow-lg hidden group-hover:flex z-50 top-16 border-t border-gray-100">
                                <div className="w-1/3 border-r h-full overflow-y-auto bg-gray-50 p-2">
                                    {categories.map(category => (
                                        <Link
                                            href={`/products?category=${category.id}`}
                                            key={category.id}
                                            onMouseEnter={() => setActiveCategory(category)}
                                            className={`p-3 px-4 cursor-pointer flex justify-between items-center text-sm font-medium hover:bg-white hover:text-wiki-dark hover:shadow-sm rounded-md transition-all ${activeCategory?.id === category.id ? 'bg-white text-wiki-dark shadow-sm' : 'text-slate-600'}`}
                                        >
                                            <span>{category.name}</span>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M9 18l6-6-6-6" />
                                            </svg>
                                        </Link>
                                    ))}
                                </div>

                                <div className="w-2/3 p-6 h-full overflow-y-auto">
                                    {activeCategory ? (
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-800 mb-6 border-b pb-2">{activeCategory.name}</h3>
                                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                                {activeCategory.subCategories && activeCategory.subCategories.length > 0 ? (
                                                    activeCategory.subCategories.map(sub => (
                                                        <Link href={`/products?category=${sub.id}`} key={sub.id} className="text-slate-600 hover:text-wiki transition-colors block py-1 text-sm">
                                                            {sub.name}
                                                        </Link>
                                                    ))
                                                ) : (
                                                    <div className="col-span-2 text-slate-400 italic">No subcategories found</div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-400">
                                            Hover over a category to see subcategories
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className='mr-20' />
                        <Link href="#" className="px-6 h-16 flex items-center justify-center hover:bg-wiki cursor-pointer group">
                            <div className="text-slate-500 font-semibold text-sm group-hover:text-white text-center">Wiki Repair</div>
                        </Link>
                        <Link href="#" className="px-6 h-16 flex items-center justify-center hover:bg-wiki cursor-pointer group">
                            <div className="text-slate-500 font-semibold text-sm group-hover:text-white text-center">Service Entreprise</div>
                        </Link>
                        <Link href="#" className="px-6 h-16 flex items-center justify-center hover:bg-wiki cursor-pointer group">
                            <div className="text-slate-500 font-semibold text-sm group-hover:text-white text-center">Nos Magasins</div>
                        </Link>
                        <Link href="#" className="px-6 h-16 flex items-center justify-center hover:bg-wiki cursor-pointer group">
                            <div className="text-slate-500 font-semibold text-sm group-hover:text-white text-center">Blog</div>
                        </Link>
                        <Link href="#" className="px-6 h-16 flex items-center justify-center hover:bg-wiki cursor-pointer group">
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
                            <Link href="#" className="block px-4 py-3 text-slate-700 hover:bg-wiki-light/20 hover:text-wiki-dark rounded-lg font-medium" onClick={() => setMobileMenuOpen?.(false)}>
                                Wiki Repair
                            </Link>
                            <Link href="#" className="block px-4 py-3 text-slate-700 hover:bg-wiki-light/20 hover:text-wiki-dark rounded-lg font-medium" onClick={() => setMobileMenuOpen?.(false)}>
                                Service Entreprise
                            </Link>
                            <Link href="#" className="block px-4 py-3 text-slate-700 hover:bg-wiki-light/20 hover:text-wiki-dark rounded-lg font-medium" onClick={() => setMobileMenuOpen?.(false)}>
                                Nos Magasins
                            </Link>
                            <Link href="#" className="block px-4 py-3 text-slate-700 hover:bg-wiki-light/20 hover:text-wiki-dark rounded-lg font-medium" onClick={() => setMobileMenuOpen?.(false)}>
                                Blog
                            </Link>
                            <Link href="#" className="block px-4 py-3 text-slate-700 hover:bg-wiki-light/20 hover:text-wiki-dark rounded-lg font-medium" onClick={() => setMobileMenuOpen?.(false)}>
                                Nous Contacter
                            </Link>

                            {/* Categories Accordion */}
                            <div className="border-t pt-4 mt-4">
                                <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Categories</div>
                                {categories.map((category) => (
                                    <div key={category.id} className="mb-2">
                                        <div className="w-full h-12 flex items-center justify-between px-4 hover:bg-wiki-light/10 rounded-lg">
                                            <Link
                                                href={`/products?category=${category.id}`}
                                                className="flex-1 text-slate-700 font-medium py-3"
                                                onClick={() => setMobileMenuOpen?.(false)}
                                            >
                                                {category.name}
                                            </Link>
                                            <button
                                                onClick={() => toggleMobileCategory(category.id)}
                                                className="p-3 text-slate-400"
                                            >
                                                <svg
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    className={`transform transition-transform ${mobileActiveCategory === category.id ? 'rotate-180' : ''}`}
                                                >
                                                    <polyline points="6 9 12 15 18 9"></polyline>
                                                </svg>
                                            </button>
                                        </div>
                                        {mobileActiveCategory === category.id && category.subCategories && (
                                            <div className="ml-4 mt-2 space-y-2">
                                                {category.subCategories.map((sub) => (
                                                    <Link
                                                        key={sub.id}
                                                        href={`/products?category=${sub.id}`}
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