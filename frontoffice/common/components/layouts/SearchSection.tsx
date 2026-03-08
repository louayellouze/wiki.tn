'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ProductService, ProductSearchResult } from '@/common/services/productService'
import { formatPrice } from '@/common/utils/format'

const SearchSection = () => {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<ProductSearchResult[]>([])
    const [isFocused, setIsFocused] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const searchRef = useRef<HTMLDivElement>(null)
    const abortRef = useRef<AbortController | null>(null)

    // Debounce search — triggers after 300ms from last keystroke, min 3 chars
    useEffect(() => {
        if (query.trim().length < 3) {
            setResults([])
            return
        }

        const timer = setTimeout(() => {
            performSearch(query.trim())
        }, 250) // reduced from 300ms

        return () => clearTimeout(timer)
    }, [query])

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsFocused(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const performSearch = async (q: string) => {
        // Cancel any in-flight request
        if (abortRef.current) abortRef.current.abort()
        abortRef.current = new AbortController()

        setLoading(true)
        try {
            const data = await ProductService.searchProductsAutocomplete(q)
            setResults(data)
        } catch (error: any) {
            if (error?.name !== 'CanceledError') {
                console.error('Search failed', error)
            }
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        const trimmedQuery = query.trim()
        if (trimmedQuery) {
            router.push(`/products?q=${encodeURIComponent(trimmedQuery)}`)
            setIsFocused(false)
        }
    }

    const getImageUrl = (imageUrl?: string) => {
        if (!imageUrl) return '/assets/img/2-1.png'
        if (imageUrl.startsWith('http') || imageUrl.startsWith('data:')) return imageUrl
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || ''
        return `${baseUrl}${imageUrl}`
    }

    return (
        <div ref={searchRef} className="relative w-full z-[100]">
            {/* Overlay */}
            {isFocused && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[-1] transition-all duration-300 pointer-events-none"
                    aria-hidden="true"
                />
            )}

            <form onSubmit={handleSearch} className="relative flex items-center group">
                <div className="absolute left-4 text-slate-400 group-focus-within:text-wiki transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </div>
                <input
                    type="text"
                    value={query}
                    onFocus={() => setIsFocused(true)}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Qu'est-ce que vous cherchez ?"
                    className={`w-full h-11 md:h-12 pl-12 pr-28 bg-white border-2 rounded-2xl outline-none transition-all duration-300 font-medium ${isFocused ? 'border-wiki shadow-2xl scale-[1.01]' : 'border-transparent text-slate-600'}`}
                />
                <button
                    type="submit"
                    className="absolute right-1.5 h-[85%] px-6 bg-wiki-btn text-white text-sm font-bold rounded-xl hover:bg-emerald-950 transition-all hover:shadow-lg active:scale-95"
                >
                    RECHERCHE
                </button>
            </form>

            {/* Results Dropdown */}
            {isFocused && query.trim().length >= 3 && (
                <div className="absolute top-full mt-3 w-full bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Résultats suggérés</span>
                        {loading && <div className="w-4 h-4 border-2 border-wiki border-t-transparent rounded-full animate-spin" />}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {results.length > 0 ? (
                            <>
                                {results.map((product) => (
                                    <Link
                                        href={`/products/${product.id}`}
                                        key={product.id}
                                        onClick={() => setIsFocused(false)}
                                        className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group border-b border-slate-50 last:border-0"
                                    >
                                        <div className="w-16 h-16 bg-white rounded-xl border border-slate-100 p-1 flex-shrink-0 flex items-center justify-center">
                                            <img src={getImageUrl(product.imageUrl)} alt="" className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-slate-900 font-bold text-sm truncate group-hover:text-wiki transition-colors">
                                                {product.title}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-wiki font-black text-sm">{formatPrice(product.discountPrice || product.regularPrice)}</span>
                                                {(product.discountPrice ?? 0) > 0 && (
                                                    <span className="text-slate-400 line-through text-[10px] font-medium">{formatPrice(product.regularPrice)}</span>
                                                )}
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto ${product.stockStatus === 'EN_STOCK' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                    {product.stockStatus === 'EN_STOCK' ? 'En Stock' : product.stockStatus === 'EN_ARRIVAGE' ? 'En Arrivage' : 'Hors Stock'}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                                <Link
                                    href={`/products?q=${encodeURIComponent(query)}`}
                                    onClick={() => setIsFocused(false)}
                                    className="block p-4 text-center text-sm font-bold text-wiki hover:bg-emerald-50 transition-colors bg-white border-t border-slate-50"
                                >
                                    Voir tous les résultats pour "{query}"
                                </Link>
                            </>
                        ) : !loading && (
                            <div className="p-8 text-center text-slate-400 italic text-sm">
                                Aucun produit trouvé pour "{query}"
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default SearchSection