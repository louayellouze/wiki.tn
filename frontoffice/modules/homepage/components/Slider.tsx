'use client'

import Button from '@/common/components/elements/Button'
import React, { useEffect, useState } from 'react'

import { HeroBanner } from '@/common/types/hero-banner'

const handleClick = (linkUrl: string) => {
    if (linkUrl) {
        window.location.href = linkUrl;
    }
}

interface SliderProps {
    banners: HeroBanner[];
    loading?: boolean;
}

import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'

const Slider = ({ banners, loading }: SliderProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [subImageIndex, setSubImageIndex] = useState(0);

    useEffect(() => {
        if (banners.length <= 1) return;

        const interval = setInterval(() => {
            setIsAnimating(true);
            setCurrentIndex((prev) => (prev + 1) % banners.length);
            setTimeout(() => setIsAnimating(false), 800);
        }, 5000);

        return () => clearInterval(interval);
    }, [banners.length, currentIndex]);

    const handleNext = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev + 1) % banners.length);
        setTimeout(() => setIsAnimating(false), 800);
    };

    const handlePrev = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
        setTimeout(() => setIsAnimating(false), 800);
    };

    const getImageUrl = (url: string) => {
        if (!url) return '/assets/img/jbl-bar.png';
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || '';
        return `${baseUrl}${url}`;
    };

    // Sub-image cycling effect
    useEffect(() => {
        const banner = banners[currentIndex];
        if (!banner) return;

        // Reset sub-image index when moving to a new banner
        setSubImageIndex(0);

        const subImagesList = [banner.imageUrl, banner.secondaryImageUrl, banner.thirdImageUrl]
            .filter(img => img && typeof img === 'string' && img.trim() !== '');
        
        console.log(`Banner ${currentIndex} sub-images:`, subImagesList);

        if (subImagesList.length <= 1) return;

        const interval = setInterval(() => {
            setSubImageIndex((prev) => (prev + 1) % subImagesList.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [banners, currentIndex]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="h-[400px] md:h-[500px] w-full bg-slate-100 animate-pulse rounded-[3rem]" />
            </div>
        )
    }

    if (banners.length === 0) return null;

    const banner = banners[currentIndex];
    const subImages = [
        banner.imageUrl,
        banner.secondaryImageUrl,
        banner.thirdImageUrl
    ].filter(img => img && typeof img === 'string' && img.trim() !== '') as string[];

    return (
        <div className="relative group overflow-hidden py-8 md:py-12">
            <div className="container mx-auto px-4">
                <div className="relative h-[420px] md:h-[580px] w-full overflow-hidden rounded-2xl md:rounded-[3rem] bg-slate-900 shadow-2xl shadow-slate-200">
                    {/* Background Layer with Gradient & Animation */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 opacity-90" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />

                    {/* Animated Glow Circles */}
                    <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/20 blur-[120px] rounded-full animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full animate-pulse delay-700" />

                    <div className="relative h-full flex flex-col md:flex-row items-center px-6 md:px-20 gap-4 md:gap-12">
                        {/* Text Content */}
                        <div className="flex-none md:flex-1 z-10 text-center md:text-left pt-6 md:pt-0">
                            <div className="hidden md:inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full mb-4 animate-fade-in-up">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                                <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Offre Exclusive</span>
                            </div>

                            <h1
                                key={`title-${currentIndex}`}
                                className="text-white text-2xl md:text-5xl lg:text-6xl font-black leading-tight mb-3 md:mb-6 animate-fade-in-up drop-shadow-2xl"
                                style={{ animationDelay: '100ms' }}
                                dangerouslySetInnerHTML={{ __html: banner.title }}
                            />

                            <p
                                key={`desc-${currentIndex}`}
                                className="hidden md:block text-slate-400 text-lg md:text-xl max-w-xl mb-8 line-clamp-2 animate-fade-in-up"
                                style={{ animationDelay: '200ms' }}
                            >
                                {banner.description}
                            </p>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                                <button
                                    onClick={() => handleClick(banner.linkUrl)}
                                    className="group/btn relative bg-wiki-btn hover:bg-white text-white hover:text-wiki-btn px-6 py-3 md:px-10 md:py-5 rounded-xl md:rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest transition-all duration-500 flex items-center gap-2 md:gap-3 overflow-hidden shadow-xl shadow-wiki-btn/20"
                                >
                                    <span className="relative z-10">{banner.buttonText || 'Découvrir'}</span>
                                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                                    <div className="absolute inset-0 bg-white translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                                </button>
                            </div>
                        </div>

                        {/* Image Content */}
                        <div className="flex-1 relative h-[200px] md:h-full flex items-center justify-center p-4 md:p-0">
                            {/* Product Stage (Professional Display) */}
                            <div className="absolute inset-x-4 inset-y-10 md:inset-x-10 md:inset-y-20 bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-fade-in-up overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white opacity-50" />
                            </div>
                            
                            <div className="absolute inset-x-10 inset-y-20 bg-emerald-400/20 blur-[100px] rounded-full animate-pulse" />
                            
                            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8">
                                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                                    {subImages.length > 0 ? subImages.map((img, index) => (
                                        <img
                                            key={`sub-img-${currentIndex}-${index}`}
                                            src={getImageUrl(img)}
                                            alt={`${banner.title}-${index}`}
                                            className={`absolute max-h-full w-auto object-contain transition-all duration-700 mix-blend-multiply drop-shadow-2xl 
                                                ${index === subImageIndex ? 'opacity-100 scale-100 translate-x-0 animate-float' : 'opacity-0 scale-90 translate-x-10 pointer-events-none'}
                                            `}
                                            onClick={() => handleClick(banner.linkUrl)}
                                        />
                                    )) : (
                                        <div className="text-slate-200">Chargement de l'image...</div>
                                    )}

                                    {/* Manual Sub-image Navigation Arrows */}
                                    {subImages.length > 1 && (
                                        <>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setSubImageIndex(prev => (prev - 1 + subImages.length) % subImages.length); }}
                                                className="absolute left-0 z-40 p-2 bg-white/50 hover:bg-white rounded-full shadow-lg transition-all active:scale-90 md:-translate-x-4 border border-white/20 backdrop-blur-sm"
                                            >
                                                <ChevronLeft className="w-5 h-5 text-slate-800" />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setSubImageIndex(prev => (prev + 1) % subImages.length); }}
                                                className="absolute right-0 z-40 p-2 bg-white/50 hover:bg-white rounded-full shadow-lg transition-all active:scale-90 md:translate-x-4 border border-white/20 backdrop-blur-sm"
                                            >
                                                <ChevronRight className="w-5 h-5 text-slate-800" />
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Mini Thumbnails Indicator if multiple images */}
                                {subImages.length > 1 && (
                                    <div className="absolute bottom-12 flex gap-2 z-30">
                                        {subImages.map((_, index) => (
                                            <button
                                                key={`dot-${index}`}
                                                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === subImageIndex ? 'w-6 bg-emerald-500' : 'bg-slate-300'}`}
                                                onClick={(e) => { e.stopPropagation(); setSubImageIndex(index); }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {/* Floating Badge */}
                            <div className="absolute top-[20%] right-[5%] bg-white/10 backdrop-blur-3xl border border-white/20 p-4 rounded-3xl animate-float z-20 hidden md:block" style={{ animationDelay: '1s' }}>
                                <div className="text-emerald-400 font-black text-2xl">-40%</div>
                                <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Sur la sélection</div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation UI */}
                    <div className="absolute bottom-4 md:bottom-10 left-0 right-0 z-20 flex items-center justify-between px-6 md:px-20">
                        <div className="flex items-center gap-2">
                            {banners.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`h-1.5 rounded-full transition-all duration-500 ${index === currentIndex ? 'w-8 md:w-12 bg-wiki-btn' : 'w-3 md:w-4 bg-slate-700 hover:bg-slate-600'}`}
                                />
                            ))}
                        </div>

                        <div className="flex gap-2 md:gap-4">
                            <button
                                onClick={handlePrev}
                                className="w-9 h-9 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-all active:scale-95"
                            >
                                <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
                            </button>
                            <button
                                onClick={handleNext}
                                className="w-9 h-9 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-wiki-btn hover:bg-emerald-900 border border-wiki-btn/20 flex items-center justify-center text-white transition-all active:scale-95 shadow-lg shadow-wiki-btn/20"
                            >
                                <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Index Indicator */}
                    <div className="absolute top-10 right-10 text-white/5 text-[150px] font-black leading-none pointer-events-none select-none">
                        0{currentIndex + 1}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Slider