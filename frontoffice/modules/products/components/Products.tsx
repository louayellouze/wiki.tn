'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import SideSpecFilter from './SideSpecFilter'
import Star from '@/common/components/elements/Star'
import ButtonLove from '@/common/components/elements/ButtonLove'
import BannerPromotion from '@/modules/homepage/components/BannerPromotion'
import Link from 'next/link'
import { ProductService } from '@/common/services/productService'
import { Category, categoryService } from '@/common/services/categoryService'
import { ProductResponse } from '@/app/dtos/product'
import { useCart } from '@/common/context/CartContext'
import { formatPrice } from '@/common/utils/format'
import Image from 'next/image'
import api from '@/common/utils/api'

interface ProductsProps {
    categorySlug?: string;
}

const Products: React.FC<ProductsProps> = ({ categorySlug: propCategorySlug }) => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const query = searchParams.get('q')
    const categoryParam = propCategorySlug || searchParams.get('category')
    const brandParam = searchParams.get('brand')

    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [categoryName, setCategoryName] = useState<string | null>(null)
    const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string[]>>({})
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000])
    const [minPrice, setMinPrice] = useState(0)
    const [maxPrice, setMaxPrice] = useState(100000)
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const pageSize = 12

    const { addToCart } = useCart()

    const fetchProductsData = useCallback(async () => {
        setLoading(true)
        try {
            // Determine if categoryParam is ID or Slug
            const isId = categoryParam && !isNaN(Number(categoryParam))
            let categorySlug: string | undefined = undefined

            if (categoryParam) {
                try {
                    const category = isId
                        ? await categoryService.getCategoryById(categoryParam)
                        : await categoryService.getCategoryBySlug(categoryParam)

                    setCategoryName(category.name)
                    categorySlug = category.slug
                } catch (e) {
                    console.error("Failed to fetch category info", e);
                }
            }

            const filterParams: Record<string, any> = {
                page: currentPage,
                size: pageSize,
                categorySlug: categorySlug,
                brandSlug: brandParam || undefined,
                minPrice: priceRange[0] !== minPrice ? priceRange[0] : undefined,
                maxPrice: priceRange[1] !== maxPrice ? priceRange[1] : undefined,
                ...selectedSpecs
            }

            if (query) {
                // If it's a search, we might still use the search endpoint or combine it
                // For now, let's keep it simple: if query exists, use search, otherwise use filter
                // Ideally, the filter endpoint should support 'q' too.
                // Assuming we'll add 'q' to filter endpoint or keep them separate.
                // Let's use the search endpoint for now if query exists, without pagination (as before)
                const res = await api.get<ProductResponse[]>(`/v1/products/search?q=${encodeURIComponent(query)}`);
                setProducts(res.data)
                setTotalPages(1)
                setTotalElements(res.data.length)
            } else {
                const pageData = await ProductService.getFilteredProducts(filterParams)
                setProducts(pageData.content)
                setTotalPages(pageData.totalPages)
                setTotalElements(pageData.totalElements)

                // Update price bounds once on first load if not set
                if (pageData.content.length > 0 && minPrice === 0 && maxPrice === 100000) {
                    // This is tricky with pagination, but let's assume reasonable bounds
                }
            }
        } catch (error) {
            console.error('Error fetching products:', error)
            setProducts([])
        } finally {
            setLoading(false)
        }
    }, [categoryParam, brandParam, query, selectedSpecs, priceRange, currentPage, minPrice, maxPrice])

    useEffect(() => {
        fetchProductsData()
    }, [fetchProductsData])

    const handleSpecChange = (keyName: string, value: string, checked: boolean) => {
        setSelectedSpecs(prev => {
            const current = prev[keyName] || []
            let next: Record<string, string[]>
            if (checked) {
                next = { ...prev, [keyName]: [...current, value] }
            } else {
                const updated = current.filter(v => v !== value)
                if (updated.length === 0) {
                    const { [keyName]: _, ...rest } = prev
                    next = rest
                } else {
                    next = { ...prev, [keyName]: updated }
                }
            }
            return next
        })
        setCurrentPage(0) // Reset to first page on filter change
    }

    const handleResetSpecs = () => {
        setSelectedSpecs({})
        setPriceRange([minPrice, maxPrice])
        setIsMobileFiltersOpen(false)
        setCurrentPage(0)
    }

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const activeFilterCount = Object.values(selectedSpecs).reduce((sum, arr) => sum + arr.length, 0)
    const isPriceFiltered = priceRange[0] > minPrice || priceRange[1] < maxPrice

    const getImageUrl = (product: ProductResponse) => {
        const url = product.imageUrl || (product.images && product.images.length > 0 ? product.images[0].imageUrl : null);
        if (!url) return '/assets/img/2-1.png';
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || '';
        return `${baseUrl}${url}`;
    };

    return (
        <>
            {/* Mobile Filter Drawer */}
            <div className={`fixed inset-0 z-[1000] lg:hidden transition-opacity duration-300 ${isMobileFiltersOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileFiltersOpen(false)} />
                <div className={`absolute right-0 top-0 h-full w-[300px] bg-white shadow-2xl transition-transform duration-300 ease-out p-6 overflow-y-auto ${isMobileFiltersOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-slate-900">Filtres</h3>
                        <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                    </div>
                    <SideSpecFilter
                        selectedSpecs={selectedSpecs}
                        onSpecChange={handleSpecChange}
                        onReset={handleResetSpecs}
                        priceRange={priceRange}
                        onPriceChange={setPriceRange}
                        minPrice={minPrice}
                        maxPrice={maxPrice}
                        categoryId={categoryParam}
                        searchQuery={query}
                    />
                    <button
                        onClick={() => setIsMobileFiltersOpen(false)}
                        className="w-full mt-6 bg-wiki-btn text-white font-bold py-4 rounded-xl shadow-lg shadow-wiki-btn/20 active:scale-95 transition-all text-sm uppercase tracking-wide"
                    >
                        Appliquer
                    </button>
                </div>
            </div>

            <div className="mx-auto min-h-full container mt-10 md:mt-20 px-4 md:px-6 flex gap-8">
                {/* Sidebar (Desktop) */}
                <aside className="w-[260px] flex-shrink-0 hidden lg:block pt-4 h-fit sticky top-32">
                    <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                        <SideSpecFilter
                            selectedSpecs={selectedSpecs}
                            onSpecChange={handleSpecChange}
                            onReset={handleResetSpecs}
                            priceRange={priceRange}
                            onPriceChange={setPriceRange}
                            minPrice={minPrice}
                            maxPrice={maxPrice}
                            categoryId={categoryParam}
                            searchQuery={query}
                        />
                    </div>
                </aside>

                {/* Main content */}
                <div className="flex-1 min-w-0 pt-4">
                    {/* Header row */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                                {query
                                    ? `Résultats pour "${query}"`
                                    : brandParam
                                        ? `Produits de la marque ${brandParam.charAt(0).toUpperCase() + brandParam.slice(1)}`
                                        : categoryName
                                            ? categoryName
                                            : 'Tous les produits'}
                            </h2>
                            <p className="text-sm font-medium text-slate-400 mt-1">{totalElements} produit{totalElements !== 1 ? 's' : ''} trouvé{totalElements !== 1 ? 's' : ''}</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsMobileFiltersOpen(true)}
                                className="lg:hidden flex items-center justify-center gap-2 bg-white border-2 border-slate-100 text-slate-700 font-bold px-5 py-2.5 rounded-2xl hover:border-wiki-btn transition-all text-sm active:scale-95"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" /></svg>
                                Filtres
                                {activeFilterCount > 0 && <span className="w-5 h-5 flex items-center justify-center bg-wiki-btn text-white text-[10px] rounded-full">{activeFilterCount}</span>}
                            </button>

                            {(activeFilterCount > 0 || isPriceFiltered) && (
                                <button
                                    onClick={handleResetSpecs}
                                    className="text-sm text-rose-500 hover:text-rose-700 font-bold border-2 border-rose-50 hover:border-rose-100 px-5 py-2.5 rounded-2xl transition-all active:scale-95"
                                >
                                    Effacer tout
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Active filter chips */}
                    {(activeFilterCount > 0 || isPriceFiltered) && (
                        <div className="flex flex-wrap gap-2 mb-8">
                            {isPriceFiltered && (
                                <span className="inline-flex items-center gap-2 bg-wiki-btn/5 border border-wiki-btn/10 text-wiki-btn text-xs font-bold px-4 py-2 rounded-2xl">
                                    Prix: {formatPrice(priceRange[0])} – {formatPrice(priceRange[1])}
                                    <button onClick={() => setPriceRange([minPrice, maxPrice])} className="hover:text-rose-500 font-black text-lg pb-0.5">×</button>
                                </span>
                            )}
                            {Object.entries(selectedSpecs).map(([keyName, values]) =>
                                values.map(val => (
                                    <span key={`${keyName}-${val}`} className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-2xl">
                                        <span className="text-slate-400 font-medium">{keyName}:</span> {val}
                                        <button onClick={() => handleSpecChange(keyName, val, false)} className="hover:text-rose-500 font-black text-lg pb-0.5">×</button>
                                    </span>
                                ))
                            )}
                        </div>
                    )}

                    {loading ? (
                        <div className="w-full h-80 flex flex-col justify-center items-center gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-slate-100 border-t-wiki-btn"></div>
                            <span className="text-slate-400 text-sm font-medium">Chargement des produits...</span>
                        </div>
                    ) : products.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
                                {products.map((product, index) => (
                                    <Link href={`/products/${product.slug || product.id}`} key={product.id || index} className="group">
                                        <div className={`bg-white p-3 md:p-5 rounded-[2rem] border border-slate-100 hover:border-wiki-btn transition-all duration-300 hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.08)] flex flex-col h-full relative group ${product.stockStatus === 'HORS_STOCK' || product.stockStatus === 'EN_ARRIVAGE' ? 'opacity-75' : ''}`}>

                                            <div className="relative h-40 md:h-52 mb-4 bg-slate-50 rounded-3xl p-4 flex items-center justify-center overflow-hidden">
                                                <Image
                                                    className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500 px-2"
                                                    src={getImageUrl(product as any)}
                                                    alt={product.title}
                                                    width={200}
                                                    height={200}
                                                />

                                                {/* Status Badge */}
                                                <div className="absolute top-3 right-3 flex flex-col gap-2">
                                                    {product.isFlashSale && (
                                                        <span className="bg-amber-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter shadow-sm whitespace-nowrap flex items-center gap-1 animate-pulse border border-amber-400/50">
                                                            <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                                                            Vente Flash
                                                        </span>
                                                    )}
                                                    {product.stockStatus === 'HORS_STOCK' && (
                                                        <span className="bg-rose-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter shadow-sm whitespace-nowrap">Hors Stock</span>
                                                    )}
                                                    {product.stockStatus === 'EN_ARRIVAGE' && (
                                                        <span className="bg-blue-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter shadow-sm whitespace-nowrap">En Arrivage</span>
                                                    )}
                                                    {product.stockStatus === 'EN_COMMANDE' && (
                                                        <span className="bg-amber-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter shadow-sm whitespace-nowrap">Sur Commande</span>
                                                    )}
                                                </div>

                                                <div className="absolute top-3 left-3 z-10 transition-opacity">
                                                    <ButtonLove product={product} />
                                                </div>
                                            </div>

                                            <div className="flex flex-col flex-1 px-1">
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Wiki.tn</div>
                                                <h3 className="text-slate-900 text-sm md:text-base font-bold leading-snug line-clamp-2 mb-2 group-hover:text-wiki-btn transition-colors">
                                                    {product.title}
                                                </h3>

                                                <div className="mt-auto">
                                                    <div className="flex items-center gap-1.5 mb-3">
                                                        <Star count={4.5} />
                                                        <span className="text-[10px] text-slate-400 font-medium">(24)</span>
                                                    </div>

                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex flex-col">
                                                            {(product.discountPrice ?? 0) > 0 ? (
                                                                <>
                                                                    <span className="text-wiki-btn text-base md:text-lg font-black tracking-tight">{formatPrice(product.discountPrice || 0)}</span>
                                                                    <span className="line-through text-slate-300 text-[10px] font-bold">{formatPrice(product.regularPrice)}</span>
                                                                </>
                                                            ) : (
                                                                <span className="text-slate-900 text-base md:text-lg font-black tracking-tight">{formatPrice(product.regularPrice)}</span>
                                                            )}
                                                        </div>

                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                addToCart(product);
                                                            }}
                                                            disabled={product.stockStatus === 'HORS_STOCK' || product.stockStatus === 'EN_ARRIVAGE'}
                                                            className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-90 ${product.stockStatus === 'HORS_STOCK' || product.stockStatus === 'EN_ARRIVAGE' ? 'bg-slate-50 text-slate-300 cursor-not-allowed shadow-none' : 'bg-wiki-btn text-white hover:bg-emerald-950 shadow-wiki-btn/20'}`}
                                                        >
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Pagination UI */}
                            {totalPages > 1 && (
                                <div className="mt-12 flex justify-center items-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 0}
                                        className="p-2 rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                                    </button>

                                    <div className="flex gap-1">
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handlePageChange(i)}
                                                className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${currentPage === i ? 'bg-wiki-btn text-white shadow-lg shadow-wiki-btn/20' : 'bg-white border border-slate-200 text-slate-600 hover:border-wiki-btn'}`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages - 1}
                                        className="p-2 rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="w-full py-20 flex flex-col justify-center items-center gap-6 text-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl shadow-slate-200/50 text-4xl">🔍</div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-slate-800">Aucun produit trouvé</h3>
                                <p className="text-slate-400 text-sm max-w-[280px] mx-auto">
                                    {(activeFilterCount > 0 || isPriceFiltered)
                                        ? "Aucun produit ne correspond à vos filtres actuels."
                                        : "Essayez de rechercher avec d'autres mots-clés."}
                                </p>
                            </div>
                            {(activeFilterCount > 0 || isPriceFiltered) && (
                                <button
                                    onClick={handleResetSpecs}
                                    className="bg-wiki-btn text-white px-8 py-3 rounded-2xl font-bold text-sm hover:shadow-lg transition-all active:scale-95"
                                >
                                    Réinitialiser les filtres
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <BannerPromotion banners={[]} />
        </>
    )
}

export default Products