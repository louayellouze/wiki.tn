'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ProductService, ProductSearchResult } from '@/common/services/productService'
import { formatPrice } from '@/common/utils/format'
import { Search, Loader2, Star, Zap } from 'lucide-react'

const SearchSection = () => {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<ProductSearchResult[]>([])
    const [isFocused, setIsFocused] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const searchRef = useRef<HTMLDivElement>(null)
    const abortRef = useRef<AbortController | null>(null)

    useEffect(() => {
        if (query.trim().length < 3) {
            setResults([])
            return
        }

        const timer = setTimeout(() => {
            performSearch(query.trim())
        }, 250)

        return () => clearTimeout(timer)
    }, [query])

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
                    className="fixed inset-0 bg-black/40 backdrop-blur-[4px] z-[-1] transition-all duration-300"
                    aria-hidden="true"
                    onClick={() => setIsFocused(false)}
                />
            )}

            <form onSubmit={handleSearch} className="relative flex items-center group">
                <div className="absolute left-4 text-slate-400 group-focus-within:text-wiki transition-all duration-300">
                    {loading ? <Loader2 size={20} className="animate-spin text-wiki" /> : <Search size={20} />}
                </div>
                <input
                    type="text"
                    value={query}
                    onFocus={() => setIsFocused(true)}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Chercher un produit, une marque..."
                    className={`w-full h-11 md:h-12 pl-12 pr-32 bg-white/10 text-white border-2 rounded-2xl outline-none transition-all duration-300 font-medium placeholder:text-white/40 ${isFocused ? 'bg-white text-slate-900 border-wiki shadow-[0_0_40px_rgba(16,185,129,0.3)] scale-[1.01]' : 'border-transparent hover:bg-white/20'}`}
                />
                <button
                    type="submit"
                    className={`absolute right-1.5 h-[80%] px-6 bg-wiki text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-all shadow-lg active:scale-95 ${isFocused ? 'opacity-100' : 'opacity-80'}`}
                >
                    Recherche
                </button>
            </form>

            {/* Results Dropdown */}
            {isFocused && query.trim().length >= 3 && (
                <div className="absolute top-full mt-4 w-full bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.5)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="p-5 bg-slate-50/80 border-b border-slate-100 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Zap size={14} className="text-orange-500 fill-orange-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Suggestions intelligentes</span>
                        </div>
                        {loading && <Loader2 size={16} className="animate-spin text-wiki" />}
                    </div>

                    <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                        {results.length > 0 ? (
                            <>
                                {results.map((product) => (
                                    <Link
                                        href={`/products/${product.slug || product.id}`}
                                        key={product.id}
                                        onClick={() => setIsFocused(false)}
                                        className="flex items-center gap-5 p-5 hover:bg-wiki/5 transition-all group border-b border-slate-50 last:border-0 relative overflow-hidden"
                                    >
                                        <div className="absolute inset-y-0 left-0 w-1 bg-wiki -translate-x-full group-hover:translate-x-0 transition-transform" />
                                        <div className="w-20 h-20 bg-white rounded-2xl border border-slate-100 p-2 flex-shrink-0 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all group-hover:scale-105">
                                            <img src={getImageUrl(product.imageUrl)} alt="" className="max-h-full max-w-full object-contain mix-blend-multiply" />
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <h4 className="text-slate-900 font-black text-sm truncate group-hover:text-wiki transition-colors">
                                                {product.title}
                                            </h4>
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={10} className="fill-orange-400 text-orange-400" />
                                                ))}
                                                <span className="text-[10px] font-bold text-slate-400 ml-1">(4.8)</span>
                                            </div>
                                            <div className="flex items-center gap-3 pt-1">
                                                <span className="text-wiki font-black text-base italic">{formatPrice(product.discountPrice || product.regularPrice)}</span>
                                                {(product.discountPrice ?? 0) > 0 && (
                                                    <span className="text-slate-400 line-through text-xs font-bold">{formatPrice(product.regularPrice)}</span>
                                                )}
                                                <span className={`text-[10px] font-black px-3 py-1 rounded-full ml-auto uppercase tracking-tighter ${product.stockStatus === 'EN_STOCK' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                                    {product.stockStatus === 'EN_STOCK' ? 'En Stock' : product.stockStatus === 'EN_ARRIVAGE' ? 'Arrivage' : 'Hors Stock'}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                                <Link
                                    href={`/products?q=${encodeURIComponent(query)}`}
                                    onClick={() => setIsFocused(false)}
                                    className="block p-6 text-center text-xs font-black text-white hover:bg-emerald-950 transition-all bg-wiki-btn uppercase tracking-[0.2em]"
                                >
                                    Voir tous les résultats pour <span className="text-wiki italic">"{query}"</span>
                                </Link>
                            </>
                        ) : !loading && (
                            <div className="p-12 text-center space-y-4">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                                    <Search size={24} className="text-slate-300" />
                                </div>
                                <p className="text-slate-400 font-bold italic text-sm">
                                    Aucun produit trouvé pour "{query}"
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default SearchSection