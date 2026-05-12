import React, { useState, useEffect } from 'react'
import { HeroBanner } from '@/common/types/hero-banner'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface BannerPromotionProps {
    banners: HeroBanner[];
}

const SinglePromotionBanner = ({ banner }: { banner: HeroBanner }) => {
    const [subImageIndex, setSubImageIndex] = useState(0);

    const getImageUrl = (url: string) => {
        if (!url) return '/assets/img/jbl-bar.png';
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || '';
        return `${baseUrl}${url}`;
    };

    const subImages = [
        banner.imageUrl,
        banner.secondaryImageUrl,
        banner.thirdImageUrl
    ].filter(img => img && typeof img === 'string' && img.trim() !== '') as string[];

    useEffect(() => {
        if (subImages.length <= 1) return;
        const interval = setInterval(() => {
            setSubImageIndex((prev) => (prev + 1) % subImages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [subImages.length]);

    return (
        <div 
            className="relative w-full rounded-3xl overflow-hidden h-72 lg:h-96 shadow-2xl group cursor-pointer bg-slate-900" 
            onClick={() => banner.linkUrl && (window.location.href = banner.linkUrl)}
        >
            {/* Background Images with Cross-fade */}
            {subImages.map((img, index) => (
                <img
                    key={`${banner.title}-img-${index}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 transform group-hover:scale-105
                        ${index === subImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}
                    `}
                    src={getImageUrl(img)}
                    alt={`${banner.title}-${index}`}
                />
            ))}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            
            {/* Content Area */}
            <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-10 gap-4">
                <div className="max-w-[90%] space-y-3">
                    <h3 
                        className="text-white text-3xl md:text-4xl font-black leading-tight drop-shadow-lg"
                        dangerouslySetInnerHTML={{ __html: banner.title }}
                    />
                    <p className="text-white/90 text-sm md:text-lg font-medium line-clamp-2 drop-shadow-md">
                        {banner.description}
                    </p>
                </div>
                
                {banner.buttonText && (
                    <div className="mt-2">
                        <span className="inline-block bg-wiki-btn text-white text-xs md:text-sm font-black px-8 py-3.5 rounded-2xl shadow-xl group-hover:bg-white group-hover:text-wiki-btn transition-all duration-300 uppercase tracking-widest">
                            {banner.buttonText}
                        </span>
                    </div>
                )}
            </div>

            {/* Manual Controls if multiple images */}
            {subImages.length > 1 && (
                <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setSubImageIndex(prev => (prev - 1 + subImages.length) % subImages.length); }}
                        className="p-2 bg-black/50 hover:bg-white hover:text-black text-white rounded-xl backdrop-blur-md transition-all"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setSubImageIndex(prev => (prev + 1) % subImages.length); }}
                        className="p-2 bg-black/50 hover:bg-white hover:text-black text-white rounded-xl backdrop-blur-md transition-all"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
};

const BannerPromotion = ({ banners }: BannerPromotionProps) => {
    if (!banners || banners.length === 0) return null;

    return (
        <div className="container mx-auto px-4 py-12 md:py-16">
            <div className={`grid gap-8 ${banners.length > 1 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                {banners.map((banner, index) => (
                    <SinglePromotionBanner key={banner.title || index} banner={banner} />
                ))}
            </div>
        </div>
    )
}

export default BannerPromotion