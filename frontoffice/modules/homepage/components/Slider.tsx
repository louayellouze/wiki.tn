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

const Slider = ({ banners, loading }: SliderProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (banners.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [banners.length]);

    const getImageUrl = (url: string) => {
        if (!url) return '/assets/img/jbl-bar.png'; // Use a valid existing asset as fallback

        if (url.startsWith('http') || url.startsWith('data:')) {
            return url;
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || '';
        return `${baseUrl}${url}`;
    };

    if (loading) {
        return (
            <div className="container mx-auto px-2 md:px-4 py-4 md:py-8 lg:py-16">
                <div className="flex animate-pulse flex-col md:flex-row items-center justify-between gap-4 md:gap-8 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 md:p-6 lg:p-12 min-h-[280px] md:min-h-[320px] lg:min-h-[420px]">
                    <div className="flex-1 space-y-3 md:space-y-6">
                        <div className="h-10 bg-cyan-100 rounded-md w-3/4"></div>
                        <div className="h-6 bg-cyan-50 rounded-md w-1/2"></div>
                        <div className="h-12 bg-amber-200 rounded-md w-32"></div>
                    </div>
                    <div className="flex-1 w-full h-48 bg-cyan-100 rounded-lg"></div>
                </div>
            </div>
        )
    }

    if (banners.length === 0) {
        return null; // Don't show anything if no banners exist
    }

    const banner = banners[currentIndex];

    return (
        <div className="container mx-auto px-4 py-8 md:py-16">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 md:p-12 min-h-[300px] md:min-h-[420px] transition-all duration-500 ease-in-out">
                <div className="flex-1 space-y-6">
                    <h1
                        className="text-cyan-800 text-3xl md:text-4xl lg:text-5xl font-bold transition-all duration-500"
                        dangerouslySetInnerHTML={{ __html: banner.title }}
                    />
                    <div className="text-gray-600 text-lg md:text-xl line-clamp-2">
                        {banner.description}
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <Button
                            onClick={() => handleClick(banner.linkUrl)}
                            type="submit"
                            className="w-32 h-14 bg-amber-500 justify-center text-white text-base font-semibold hover:bg-amber-600 transition-colors">
                            {banner.buttonText || 'Shop Now'}
                        </Button>
                    </div>
                    <div className="flex justify-start items-center gap-2 mt-6">
                        {banners.map((_, index) => (
                            <div
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-3 h-3 cursor-pointer rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-amber-500 w-8' : 'bg-zinc-300 hover:bg-zinc-400'}`}
                            />
                        ))}
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <img
                        key={banner.id}
                        className="max-w-full h-auto rounded-lg max-h-[350px] object-contain transition-opacity duration-500"
                        src={getImageUrl(banner.imageUrl)}
                        alt={banner.title}
                    />
                </div>
            </div>
        </div>
    )
}

export default Slider