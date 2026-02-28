'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import SideCategories from './SideCategories'
import SideSpecFilter from './SideSpecFilter'
import { Card } from '@/common/components/elements/Card'
import ButtonLove from '@/common/components/elements/ButtonLove'
import Star from '@/common/components/elements/Star'
import BannerPromotion from '@/modules/homepage/components/BannerPromotion'
import Link from 'next/link'
import { ProductService } from '@/common/services/productService'
import { ProductResponse } from '@/app/dtos/product'
import { useCart } from '@/common/context/CartContext'
import { formatPrice } from '@/common/utils/format'

const Products = () => {
    const searchParams = useSearchParams()
    const query = searchParams.get('q')
    const categoryId = searchParams.get('category')
    const [products, setProducts] = useState<ProductResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string[]>>({})
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000])
    const [minPrice, setMinPrice] = useState(0)
    const [maxPrice, setMaxPrice] = useState(100000)
    const { addToCart } = useCart()

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true)
            try {
                let data: ProductResponse[]
                if (query) {
                    data = await ProductService.searchProducts(query)
                } else if (categoryId) {
                    data = await ProductService.getProductsByCategory(Number(categoryId))
                } else {
                    data = await ProductService.getAllProducts()
                }
                setProducts(data)
                // Compute price bounds from fetched products
                if (data.length > 0) {
                    const prices = data.map(p => p.discountPrice || p.regularPrice)
                    const min = Math.floor(Math.min(...prices))
                    const max = Math.ceil(Math.max(...prices))
                    setMinPrice(min)
                    setMaxPrice(max)
                    setPriceRange([min, max])
                }
            } catch (error) {
                console.error('Error fetching products:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchProducts()
        setSelectedSpecs({})
    }, [query, categoryId])

    const handleSpecChange = (keyName: string, value: string, checked: boolean) => {
        setSelectedSpecs(prev => {
            const current = prev[keyName] || []
            if (checked) {
                return { ...prev, [keyName]: [...current, value] }
            } else {
                const updated = current.filter(v => v !== value)
                if (updated.length === 0) {
                    const { [keyName]: _, ...rest } = prev
                    return rest
                }
                return { ...prev, [keyName]: updated }
            }
        })
    }

    const handleResetSpecs = () => {
        setSelectedSpecs({})
        setPriceRange([minPrice, maxPrice])
    }

    const filteredProducts = useMemo(() => {
        const activeKeys = Object.keys(selectedSpecs).filter(k => selectedSpecs[k].length > 0)
        return products.filter(product => {
            // Price filter
            const price = product.discountPrice || product.regularPrice
            if (price < priceRange[0] || price > priceRange[1]) return false
            // Spec filters (AND across keys, OR within a key)
            return activeKeys.every(keyName => {
                const allowedValues = selectedSpecs[keyName]
                return product.specifications?.some(
                    spec => spec.keyName === keyName && allowedValues.includes(spec.value)
                )
            })
        })
    }, [products, selectedSpecs, priceRange])

    const activeFilterCount = Object.values(selectedSpecs).reduce((sum, arr) => sum + arr.length, 0)
    const isPriceFiltered = priceRange[0] > minPrice || priceRange[1] < maxPrice

    const getImageUrl = (product: ProductResponse) => {
        const url = product.imageUrl || (product.images && product.images.length > 0 ? product.images[0].imageUrl : null);

        if (!url) return '/assets/img/2-1.png';

        if (url.startsWith('http') || url.startsWith('data:')) {
            return url;
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || '';
        return `${baseUrl}${url}`;
    };

    return (
        <>
            <div className="mx-auto min-h-full container mt-20 p-4 flex gap-8">
                {/* Sidebar */}
                <div className="w-[260px] flex-shrink-0 hidden lg:block pt-4">
                    <SideSpecFilter
                        selectedSpecs={selectedSpecs}
                        onSpecChange={handleSpecChange}
                        onReset={handleResetSpecs}
                        priceRange={priceRange}
                        onPriceChange={setPriceRange}
                        minPrice={minPrice}
                        maxPrice={maxPrice}
                        categoryId={categoryId}
                        searchQuery={query}
                    />
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0 pt-4">
                    {/* Header row */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">
                                {query
                                    ? `Résultats pour "${query}"`
                                    : categoryId
                                        ? 'Produits par catégorie'
                                        : 'Tous les produits'}
                            </h2>
                            <p className="text-sm text-slate-400 mt-0.5">{filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''}</p>
                        </div>
                        {(activeFilterCount > 0 || isPriceFiltered) && (
                            <button
                                onClick={handleResetSpecs}
                                className="text-xs text-rose-500 hover:text-rose-700 font-medium border border-rose-200 hover:border-rose-400 px-3 py-1.5 rounded transition-colors"
                            >
                                Tout effacer
                            </button>
                        )}
                    </div>

                    {/* Active filter chips */}
                    {(activeFilterCount > 0 || isPriceFiltered) && (
                        <div className="flex flex-wrap gap-2 mb-5">
                            {isPriceFiltered && (
                                <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-full">
                                    Prix: {formatPrice(priceRange[0])} – {formatPrice(priceRange[1])}
                                    <button onClick={() => setPriceRange([minPrice, maxPrice])} className="hover:text-rose-500 ml-1">×</button>
                                </span>
                            )}
                            {Object.entries(selectedSpecs).map(([keyName, values]) =>
                                values.map(val => (
                                    <span key={`${keyName}-${val}`} className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-full">
                                        <span className="text-slate-400">{keyName}:</span> {val}
                                        <button onClick={() => handleSpecChange(keyName, val, false)} className="hover:text-rose-500 ml-1">×</button>
                                    </span>
                                ))
                            )}
                        </div>
                    )}

                    {loading ? (
                        <div className="w-full h-80 flex justify-center items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wiki-btn"></div>
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <div className="flex flex-wrap gap-5">
                            {filteredProducts.map((product, index) => (
                                <Link href={`/products/${product.id}`} key={index}>
                                    <Card className={`w-72 h-80 justify-center flex relative cursor-pointer hover:bg-slate-100 transition-colors ${product.stockStatus === 'HORS_STOCK' || product.stockStatus === 'EN_ARRIVAGE' ? 'opacity-75 grayscale-[0.5]' : ''}`}>
                                        <div className="h-44 mt-7 flex items-center justify-center p-4">
                                            <img
                                                className="max-h-full max-w-full object-contain rounded-lg"
                                                src={getImageUrl(product)}
                                                alt={product.title}
                                            />
                                            {product.stockStatus === 'HORS_STOCK' && (
                                                <div className="absolute top-4 right-4 z-10 bg-rose-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-md">
                                                    Hors Stock
                                                </div>
                                            )}
                                            {product.stockStatus === 'EN_ARRIVAGE' && (
                                                <div className="absolute top-4 right-4 z-10 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-md">
                                                    En Arrivage
                                                </div>
                                            )}
                                            {product.stockStatus === 'EN_COMMANDE' && (
                                                <div className="absolute top-4 right-4 z-10 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-md">
                                                    Sur Commande
                                                </div>
                                            )}
                                        </div>
                                        <ButtonLove />
                                        <div className="gap-2 flex flex-col absolute bottom-5 left-3 right-3">
                                            <div className="text-wiki-btn text-base font-medium truncate">{product.title}</div>
                                            <div className="text-neutral-600 text-base font-semibold">
                                                {product.discountPrice ? (
                                                    <span className="flex gap-2 items-baseline">
                                                        <span>{formatPrice(product.discountPrice)}</span>
                                                        <span className="line-through text-zinc-400 text-sm">{formatPrice(product.regularPrice)}</span>
                                                    </span>
                                                ) : (
                                                    <span>{formatPrice(product.regularPrice)}</span>
                                                )}
                                            </div>
                                            <Star count={4.5} />
                                        </div>

                                        {/* Add to Cart Icon Overlay */}
                                        <div
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                addToCart(product);
                                            }}
                                            className={`w-9 h-9 absolute bottom-4 right-3 bg-gray-200 rounded-full flex transition-colors z-20 ${product.stockStatus === 'HORS_STOCK' || product.stockStatus === 'EN_ARRIVAGE' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-wiki-btn group/cart'}`}
                                        >
                                            <div className="m-auto">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover/cart:hidden">
                                                    <path d="M7.5 19C8.32843 19 9 18.3284 9 17.5C9 16.6716 8.32843 16 7.5 16C6.67157 16 6 16.6716 6 17.5C6 18.3284 6.67157 19 7.5 19Z" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M16.5 19C17.3284 19 18 18.3284 18 17.5C18 16.6716 17.3284 16 16.5 16C15.6716 16 15 16.6716 15 17.5C15 18.3284 15.6716 19 16.5 19Z" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M2.5 4.5H5.4L8.7 15.15C8.8 15.55 9.15 15.85 9.55 15.85H17.2C17.6 15.85 17.95 15.55 18.05 15.15L20.1 8H6.5" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="hidden group-hover/cart:block">
                                                    <path d="M7.5 19C8.32843 19 9 18.3284 9 17.5C9 16.6716 8.32843 16 7.5 16C6.67157 16 6 16.6716 6 17.5C6 18.3284 6.67157 19 7.5 19Z" stroke="white" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M16.5 19C17.3284 19 18 18.3284 18 17.5C18 16.6716 17.3284 16 16.5 16C15.6716 16 15 16.6716 15 17.5C15 18.3284 15.6716 19 16.5 19Z" stroke="white" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M2.5 4.5H5.4L8.7 15.15C8.8 15.55 9.15 15.85 9.55 15.85H17.2C17.6 15.85 17.95 15.55 18.05 15.15L20.1 8H6.5" stroke="white" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="w-full h-80 flex flex-col justify-center items-center gap-4 text-center">
                            <div className="text-zinc-400 text-6xl">🔍</div>
                            <div className="text-zinc-600 text-xl font-medium">Aucun produit trouvé</div>
                            {(activeFilterCount > 0 || isPriceFiltered) ? (
                                <div className="flex flex-col items-center gap-2">
                                    <p className="text-zinc-400">Aucun produit ne correspond aux filtres sélectionnés.</p>
                                    <button onClick={handleResetSpecs} className="text-sm text-wiki-btn hover:underline font-medium">
                                        Effacer les filtres
                                    </button>
                                </div>
                            ) : (
                                <p className="text-zinc-400">Essayez avec d'autres mots clés.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <BannerPromotion banner={null} />
        </>
    )
}

export default Products