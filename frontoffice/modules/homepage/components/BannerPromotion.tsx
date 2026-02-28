import React from 'react'
import Button from '@/common/components/elements/Button'
import { HeroBanner } from '@/common/types/hero-banner'

interface BannerPromotionProps {
    banner: HeroBanner | null;
}

const BannerPromotion = ({ banner }: BannerPromotionProps) => {
    if (!banner) return null;

    const getImageUrl = (url: string) => {
        if (!url) return '/assets/img/jbl-bar.png';

        if (url.startsWith('http') || url.startsWith('data:')) {
            return url;
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || '';
        return `${baseUrl}${url}`;
    };

    return (
        <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
            <div className="relative w-full rounded-lg overflow-hidden h-48 md:h-64 lg:h-96 bg-gray-100">
                <img
                    className="w-full h-full object-cover"
                    src={getImageUrl(banner.imageUrl)}
                    alt={banner.title}
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 transition-opacity hover:bg-opacity-10"></div>

                {/* Content overlay */}
                <div className="absolute inset-0 flex flex-col items-end justify-center px-4 md:px-8 lg:px-16 gap-3 md:gap-6">
                    {/* Title */}
                    <div className="flex flex-col items-end gap-2 max-w-[60%]">
                        <div
                            className="text-white text-xl md:text-3xl lg:text-4xl font-bold text-right drop-shadow-md"
                            dangerouslySetInnerHTML={{ __html: banner.title }}
                        />
                        <div className="text-white text-sm md:text-base lg:text-lg font-medium text-right drop-shadow-sm opacity-90">
                            {banner.description}
                        </div>
                    </div>

                    {/* CTA Button */}
                    {banner.linkUrl && (
                        <Button
                            onClick={() => window.location.href = banner.linkUrl}
                            className="bg-amber-500 hover:bg-amber-600 text-white text-xs md:text-sm font-medium px-4 md:px-6 py-2 md:py-3 rounded-lg shadow-lg transition-all transform hover:scale-105"
                        >
                            {banner.buttonText || 'Shop now'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default BannerPromotion