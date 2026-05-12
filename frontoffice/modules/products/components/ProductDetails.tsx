'use client'

import { Card } from '@/common/components/elements/Card'
import { Separator } from '@/common/components/elements/Separator'
import Star from '@/common/components/elements/Star'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ProductService } from '@/common/services/productService'
import { ProductResponse, ProductMinResponse, ReviewResponse } from '@/app/dtos/product'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/common/context/CartContext'
import { useWishlist } from '@/common/context/WishlistContext'
import Image from 'next/image'

import { ReviewService } from '@/common/services/reviewService'
import { formatPrice } from '@/common/utils/format'

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'specifications' | 'reviews'>('specifications');
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [similarProducts, setSimilarProducts] = useState<ProductMinResponse[]>([]);

  const isLoved = product ? isInWishlist(product.id) : false;

  // Review state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [userRating, setUserRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(5);

  const getImageUrl = (url: string | null | undefined) => {
    if (!url) return '/assets/img/2-1.png';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || '';
    return `${baseUrl}${url}`;
  };

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    setIsLoggedIn(!!token);

    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(decodeURIComponent(atob(base64).split('').map(c =>
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join('')));
        setCurrentUsername(payload.sub || null);
      } catch {
        setCurrentUsername(null);
      }
    }

    const fetchProduct = async () => {
      if (!id) return;
      try {
        const idStrLocal = id as string;
        const isNumeric = /^\d+$/.test(idStrLocal);
        let data;

        if (isNumeric) {
          data = await ProductService.getProductById(Number(idStrLocal));
        } else {
          data = await ProductService.getProductBySlug(idStrLocal);
        }

        if (isNumeric && data.slug && typeof data.slug === 'string' && data.slug.trim() !== '') {
          router.replace(`/products/${data.slug}`);
          return;
        }

        setProduct(data);

        if (data.images && data.images.length > 0) {
          setMainImage(getImageUrl(data.images[0].imageUrl));
        } else if (data.imageUrl) {
          setMainImage(getImageUrl(data.imageUrl));
        } else {
          setMainImage('/assets/img/2-1.png');
        }
      } catch (error) {
        console.error("Failed to fetch product details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchSimilar = async () => {
      if (product && product.categories && product.categories.length > 0) {
        try {
          const categoryId = product.categories[0].id;
          const data = await ProductService.getProductsByCategory(categoryId, 0, 4);
          const products = Array.isArray(data) ? data : data.content;
          // Filter out current product
          setSimilarProducts(products.filter(p => p.id !== product.id));
        } catch (error) {
          console.error("Failed to fetch similar products", error);
        }
      }
    };
    fetchSimilar();
  }, [product]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !isLoggedIn) return;

    setIsSubmittingReview(true);
    setReviewError('');

    try {
      await ReviewService.addReview({
        productId: product.id,
        rating: userRating,
        comment: "" // Comment removed as per user request
      });

      // Reload product to show new review
      if (product) {
        const idStrLocal = id as string;
        const isNumeric = /^\d+$/.test(idStrLocal);
        const updatedProduct = isNumeric
          ? await ProductService.getProductById(Number(idStrLocal))
          : await ProductService.getProductBySlug(idStrLocal);
        setProduct(updatedProduct);
      }

      // Clear form
      setUserRating(5);
    } catch (err) {
      console.error("Failed to submit review", err);
      setReviewError("Une erreur est survenue lors de l'envoi de votre avis.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleUpdateReview = async (reviewId: number) => {
    if (!product) return;
    try {
      await ReviewService.updateReview(reviewId, { rating: editRating });
      const idStrLocal = id as string;
      const isNumeric = /^\d+$/.test(idStrLocal);
      const updatedProduct = isNumeric
        ? await ProductService.getProductById(Number(idStrLocal))
        : await ProductService.getProductBySlug(idStrLocal);
      setProduct(updatedProduct);
      setEditingReviewId(null);
    } catch (err) {
      console.error('Failed to update review', err);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!product || !confirm('Êtes-vous sûr de vouloir supprimer votre avis ?')) return;
    try {
      await ReviewService.deleteReview(reviewId);
      const idStrLocal = id as string;
      const isNumeric = /^\d+$/.test(idStrLocal);
      const updatedProduct = isNumeric
        ? await ProductService.getProductById(Number(idStrLocal))
        : await ProductService.getProductBySlug(idStrLocal);
      setProduct(updatedProduct);
    } catch (err) {
      console.error('Failed to delete review', err);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    router.push('/checkout');
  };

  const highlightTechnicalTerms = (text: string) => {
    if (!text) return "";
    // Regex matches numbers+units, common tech brands, and models
    const techRegex = /(\d+(?:\.\d+)?\s*(?:Go|Mo|GHz|Hz|Mo|Cores?|SSD|To|To|W|Ah|DT|V|cm|pouces?|ms|fps|TB|GB|MB|KB|DDR\d?|NVMe|PCIe|HDMI|USB|RTX|GTX|Core|i\d|Ryzen|Intel|AMD|NVIDIA|MSI|HP|Dell|Lenovo|ASUS|Acer|FreeDos|Windows))/gi;

    return text.replace(techRegex, (match) => {
      return `<span style="color: #059669; font-weight: 600;">${match}</span>`;
    });
  };

  const autoFormatDescription = (text: string) => {
    if (!text) return "";
    if (/<[a-z][\s\S]*>/i.test(text)) return text;

    const segments = text.split(/ - | \/ | \n/);

    return segments.map(segment => {
      const trimmed = segment.trim();
      if (!trimmed) return "";

      const colonIndex = trimmed.indexOf(':');
      if (colonIndex !== -1) {
        const key = trimmed.substring(0, colonIndex).trim();
        const value = trimmed.substring(colonIndex + 1).trim();

        if (key && value) {
          const highlightedValue = highlightTechnicalTerms(value);
          return `<p class="mb-1 text-slate-700">
            <strong style="color: #064e3b; font-weight: 700;">${key}:</strong> 
            <span>${highlightedValue}</span>
          </p>`;
        }
      }

      // Default standard text but still run highlight for "hidden" keywords
      return `<p class="text-slate-600 mb-1 leading-relaxed">${highlightTechnicalTerms(trimmed)}</p>`;
    }).filter(Boolean).join("");
  };

  if (loading) {
    return (
      <div className="container mx-auto py-32 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-wiki-btn border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Chargement des détails du produit...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-32 text-center">
        <h2 className="text-2xl font-bold text-slate-800">C'est embarrassant...</h2>
        <p className="text-slate-500 mt-2">Le produit que vous recherchez semble introuvable.</p>
        <button onClick={() => window.history.back()} className="mt-6 px-6 py-2 bg-wiki-btn text-white rounded-full">Retour</button>
      </div>
    );
  }

  return (
    <div className='bg-white selection:bg-wiki-light/30'>
      <div className='container mx-auto px-4 py-8 md:py-12'>
        <div className='flex flex-col lg:flex-row gap-12'>
          {/* Left Side: Images */}
          <div className="w-full lg:w-[45%] flex flex-col gap-6">
            <div className="relative group rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center h-[500px]">
              <Image
                className='p-8 max-h-full object-contain transition-transform duration-700 group-hover:scale-105'
                src={mainImage || '/assets/img/2-1.png'}
                alt={product.title}
                width={500}
                height={500}
                priority
              />
              {(product.discountPrice ?? 0) > 0 && (
                <div className="absolute top-6 left-6 bg-rose-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                  SALE -{Math.round((1 - (product.discountPrice || 0) / product.regularPrice) * 100)}%
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              {product.images?.map((img, index) => (
                <button
                  key={img.id || index}
                  onClick={() => setMainImage(getImageUrl(img.imageUrl))}
                  className={`w-24 h-24 rounded-2xl bg-slate-50 border-2 transition-all p-2 overflow-hidden flex items-center justify-center ${mainImage === getImageUrl(img.imageUrl) ? 'border-wiki-btn shadow-md scale-105' : 'border-slate-100 hover:border-slate-300'}`}
                >
                  <Image className="max-h-full object-contain" src={getImageUrl(img.imageUrl)} alt={`${product.title} - ${index}`} width={96} height={96} />
                </button>
              ))}
            </div>
          </div>

          {/* Right Side: Info */}
          <div className="w-full lg:w-[55%] flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                {product.categories?.[0] && (
                  <Link
                    href={`/${product.categories[0].slug || product.categories[0].id}`}
                    className="text-xs font-bold uppercase tracking-widest text-wiki-dark bg-wiki-light/20 px-3 py-1 rounded-full hover:bg-wiki hover:text-white transition-all"
                  >
                    {product.categories[0].name}
                  </Link>
                )}
                {product.brand && (
                  <Link
                    href={`/products?brand=${product.brand.slug}`}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-600 bg-slate-100 px-3 py-1 rounded-full hover:bg-slate-200 transition-all border border-slate-200"
                  >
                    {product.brand.logoUrl && (
                      <Image src={getImageUrl(product.brand.logoUrl)} alt={product.brand.name} className="h-4 w-auto object-contain" width={40} height={16} />
                    )}
                    <span>{product.brand.name}</span>
                  </Link>
                )}
                <div className="flex items-center gap-1.5 ml-auto">
                  {(() => {
                    const status = product.stockStatus;
                    let colorClass = 'bg-rose-500';
                    let textClass = 'text-rose-600';
                    let label = 'Hors stock';
                    let dotClass = '';

                    switch (status) {
                      case 'EN_STOCK':
                        colorClass = 'bg-emerald-500';
                        textClass = 'text-emerald-600';
                        label = 'En stock';
                        dotClass = 'animate-pulse';
                        break;
                      case 'EN_COMMANDE':
                        colorClass = 'bg-amber-500';
                        textClass = 'text-amber-600';
                        label = 'Sur commande';
                        break;
                      case 'EN_ARRIVAGE':
                        colorClass = 'bg-blue-500';
                        textClass = 'text-blue-600';
                        label = 'En arrivage';
                        break;
                    }

                    return (
                      <>
                        <div className={`w-2 h-2 rounded-full ${colorClass} ${dotClass}`} />
                        <span className={`text-sm font-bold ${textClass}`}>
                          {label}
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>

              <h1 className="text-slate-900 font-extrabold text-3xl md:text-4xl lg:text-5xl leading-tight">
                {product.title}
              </h1>

              <div className="flex items-center gap-3 flex-wrap">
                {product.reference && (
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 shadow-sm mr-2">
                    Réf : {product.reference}
                  </span>
                )}
                <Star rating={Math.round(product.averageRating || 0)} />
                <span className="text-slate-400 text-sm">
                  {product.reviews?.length > 0
                    ? `(${product.reviews.length} avis client${product.reviews.length > 1 ? 's' : ''})`
                    : '(Aucun avis pour le moment)'}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <div className="flex items-baseline gap-4">
                <div className="text-wiki-btn text-4xl md:text-5xl font-black">
                  {formatPrice(product.discountPrice || product.regularPrice)}
                </div>
                {(product.discountPrice ?? 0) > 0 && (
                  <div className="text-slate-400 text-xl line-through font-medium">
                    {formatPrice(product.regularPrice)}
                  </div>
                )}
              </div>
              {product.quantity > 0 && product.quantity < 5 && (
                <div className="mt-4 flex items-center gap-2 text-rose-600 text-sm font-semibold italic bg-rose-50 p-2 rounded-lg">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" /></svg>
                  Attention ! Il ne reste plus que {product.quantity} exemplaire{product.quantity > 1 ? 's' : ''} !
                </div>
              )}
            </div>

            {/* Formatted Description */}
            <div className="prose prose-slate max-w-none">
              <div
                className="html-description"
                dangerouslySetInnerHTML={{ __html: autoFormatDescription(product.description) }}
              />
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-6">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quantité</span>
                  <div className="flex items-center bg-slate-100 rounded-2xl p-1 w-fit">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-xl transition-all font-bold text-lg"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-bold text-slate-800">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-xl transition-all font-bold text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stockStatus === 'HORS_STOCK' || product.stockStatus === 'EN_ARRIVAGE'}
                  className='flex-1 lg:flex-none lg:w-64 h-16 bg-wiki-btn hover:bg-emerald-950 transition-all text-white text-lg font-bold rounded-2xl shadow-xl hover:shadow-wiki-light/50 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-wiki-btn disabled:active:scale-100'
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  {product.stockStatus === 'HORS_STOCK' ? 'Indisponible' : product.stockStatus === 'EN_ARRIVAGE' ? 'Bientôt disponible' : 'Ajouter au panier'}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stockStatus === 'HORS_STOCK' || product.stockStatus === 'EN_ARRIVAGE'}
                  className='flex-1 lg:flex-none lg:w-64 h-16 bg-white border-2 border-wiki-btn text-wiki-btn hover:bg-wiki-btn hover:text-white transition-all text-lg font-bold rounded-2xl shadow-lg active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-wiki-btn disabled:active:scale-100'
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Acheter maintenant
                </button>
                <button
                  onClick={() => {
                    if (product) {
                      isLoved ? removeFromWishlist(product.id) : addToWishlist(product);
                    }
                  }}
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all group border ${isLoved ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100 hover:bg-rose-50'}`}>
                  <svg className={`w-7 h-7 transition-all ${isLoved ? 'stroke-rose-500 fill-rose-500' : 'stroke-slate-400 group-hover:stroke-rose-500 group-hover:fill-rose-500'}`} fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 py-8 border-t border-slate-100">
              <div className="flex flex-col items-center gap-2 text-center group">
                <div className="w-12 h-12 rounded-2xl bg-wiki-light/10 flex items-center justify-center text-wiki-dark group-hover:bg-wiki group-hover:text-white transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Livraison Rapide</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center group">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">1 An Garantie</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Paiement Sécurisé</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center group">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Support 24/7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Improved Tabs Section */}
        <div className="mt-20">
          <div className="flex justify-center border-b border-slate-100">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('specifications')}
                className={`py-6 px-4 font-black uppercase tracking-widest text-sm transition-all relative ${activeTab === 'specifications' ? 'text-wiki-btn' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Spécifications Techniques
                {activeTab === 'specifications' && <div className="absolute bottom-0 left-0 w-full h-1 bg-wiki-btn rounded-t-full transition-all" />}
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-6 px-4 font-black uppercase tracking-widest text-sm transition-all relative ${activeTab === 'reviews' ? 'text-wiki-btn' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Avis Clients ({product.reviews?.length || 0})
                {activeTab === 'reviews' && <div className="absolute bottom-0 left-0 w-full h-1 bg-wiki-btn rounded-t-full transition-all" />}
              </button>
            </div>
          </div>

          <div className="py-12 max-w-4xl mx-auto">
            {activeTab === 'specifications' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {product.specifications && product.specifications.length > 0 ? (
                  <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <tbody>
                        {product.specifications.map((spec, index) => (
                          <tr key={spec.id || index} className={index % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}>
                            <td className="px-8 py-5 font-bold text-slate-900 border-r border-slate-100 w-1/3 italic">{spec.keyName}</td>
                            <td className="px-8 py-5 text-slate-600 font-medium">{spec.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 italic font-medium">Aucune spécification technique détaillée pour le moment.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
                {/* Review Form (Authenticated Only) */}
                {isLoggedIn ? (
                  <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <svg className="w-6 h-6 text-wiki-btn" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      Donner votre avis
                    </h3>
                    <form onSubmit={handleSubmitReview} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Note globale</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setUserRating(star)}
                              className="focus:outline-none transition-transform active:scale-90"
                            >
                              <Star rating={star <= userRating ? star : 0} size={28} activeColor="#059669" />
                            </button>
                          ))}
                        </div>
                      </div>
                      {reviewError && <p className="text-rose-600 text-sm font-medium">{reviewError}</p>}
                      <button
                        type="submit"
                        disabled={isSubmittingReview}
                        className="bg-wiki-btn text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-950 transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {isSubmittingReview ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : 'Publier mon avis'}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center">
                    <p className="text-slate-600 font-medium mb-4">Vous devez être connecté pour donner votre avis.</p>
                    <Link href="/auth/login">
                      <button className="bg-wiki-btn text-white px-8 py-2.5 rounded-full font-bold hover:bg-emerald-950 transition-all">Se connecter</button>
                    </Link>
                  </div>
                )}

                {/* Reviews List */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 italic">
                    Avis récents
                    <div className="h-1 flex-1 bg-slate-100 rounded-full"></div>
                  </h3>

                  {product.reviews && product.reviews.length > 0 ? (
                    <div className="grid gap-6">
                      {product.reviews.map((review) => {
                        const isOwner = currentUsername && review.username === currentUsername;
                        const isEditing = editingReviewId === review.id;
                        return (
                          <div key={review.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-wiki-light/10 rounded-2xl flex items-center justify-center text-wiki-dark font-black text-xl">
                                  {review.userFullName.charAt(0)}
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-800">{review.userFullName}</h4>
                                  <p className="text-xs text-slate-400 font-medium">{new Date(review.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {isEditing ? (
                                  <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                      {[1, 2, 3, 4, 5].map(s => (
                                        <button key={s} type="button" onClick={() => setEditRating(s)} className="focus:outline-none">
                                          <Star rating={s <= editRating ? s : 0} size={18} activeColor="#059669" />
                                        </button>
                                      ))}
                                    </div>
                                    <button onClick={() => handleUpdateReview(review.id)} className="text-xs bg-wiki-btn text-white px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-950 transition-all">
                                      Sauvegarder
                                    </button>
                                    <button onClick={() => setEditingReviewId(null)} className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-200 transition-all">
                                      Annuler
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <Star rating={review.rating} size={16} activeColor="#059669" />
                                    {isOwner && (
                                      <div className="flex items-center gap-1.5 ml-2">
                                        <button
                                          onClick={() => { setEditingReviewId(review.id); setEditRating(review.rating); }}
                                          className="w-8 h-8 bg-slate-100 hover:bg-wiki-light/20 rounded-lg flex items-center justify-center transition-colors"
                                          title="Modifier"
                                        >
                                          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        </button>
                                        <button
                                          onClick={() => handleDeleteReview(review.id)}
                                          className="w-8 h-8 bg-rose-50 hover:bg-rose-100 rounded-lg flex items-center justify-center transition-colors"
                                          title="Supprimer"
                                        >
                                          <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-slate-400 italic">Soyez le premier à donner votre avis sur ce produit !</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Similar Products Section */}
      {similarProducts.length > 0 && (
        <div className="bg-slate-50 py-20 border-t border-slate-100">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <h2 className="text-3xl font-black text-slate-900 italic tracking-tight">PRODUITS SIMILAIRES</h2>
                <p className="text-slate-500 font-medium mt-2">D'autres articles qui pourraient vous intéresser</p>
              </div>
              <Link 
                href={`/${product.categories?.[0]?.slug || product.categories?.[0]?.id || ''}`}
                className="text-wiki-btn font-bold flex items-center gap-2 hover:gap-3 transition-all"
              >
                Voir tout <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {similarProducts.map((p, idx) => (
                <Link key={p.id || idx} href={`/products/${p.slug || p.id}`} className="group bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
                  <div className="relative aspect-square mb-6 bg-slate-50 rounded-3xl overflow-hidden flex items-center justify-center p-6">
                    <Image 
                      src={getImageUrl(p.imageUrl)} 
                      alt={p.title} 
                      width={300}
                      height={300}
                      className="max-h-full object-contain group-hover:scale-110 transition-transform duration-700"
                    />
                    {p.discountPrice && p.discountPrice < p.regularPrice && (
                       <div className="absolute top-4 left-4 bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
                          -{Math.round((1 - p.discountPrice / p.regularPrice) * 100)}%
                       </div>
                    )}
                  </div>
                  <h3 className="text-slate-800 font-bold text-sm line-clamp-2 min-h-[40px] mb-4 group-hover:text-wiki-btn transition-colors">
                    {p.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                       <span className="text-wiki-btn font-black text-lg">
                          {formatPrice(p.discountPrice || p.regularPrice)}
                       </span>
                       {p.discountPrice && p.discountPrice < p.regularPrice && (
                          <span className="text-slate-300 text-xs line-through font-bold">
                             {formatPrice(p.regularPrice)}
                          </span>
                       )}
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-wiki-btn group-hover:text-white transition-all text-slate-400">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetails
