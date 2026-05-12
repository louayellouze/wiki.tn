'use client'

import React, { useEffect, useState } from 'react'
import Slider from './Slider'
import Category from './Category'
import PopularProduct from './PopularProduct'
import BannerPromotion from './BannerPromotion'
import TopSeller from './TopSeller'
import Features from './Features'
import Testimoni from './Testimoni'
import Partner from './Partner'
import { BlogList } from '@/modules/blog/components/BlogList'
import { getActiveBanners } from '@/common/services/heroBanner.service'
import { HeroBanner } from '@/common/types/hero-banner'
import ChatBot from './ChatBot'
import WheelOfFortune from '@/common/components/gamification/WheelOfFortune'


const Homepage = () => {
    const [banners, setBanners] = useState<HeroBanner[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllBanners = async () => {
            setLoading(true);
            try {
                const data = await getActiveBanners();
                console.log("Fetched banners:", data);
                setBanners(data || []);
            } catch (error) {
                console.error("Failed to fetch all active banners", error);
                setBanners([]);
            } finally {
                setLoading(false);
            }
        };
        fetchAllBanners();
    }, []);

    // Normalized banner distribution logic
    const sliderBanners = banners.filter(b => b.emplacement === 'HOME_SLIDER' || b.emplacement === 'SLIDER');
    const promotionBanners = banners.filter(b => b.emplacement === 'HOME_PROMOTION' || b.emplacement === 'PROMOTION');
    const unassigned = banners.filter(b => !b.emplacement);

    let finalSliderBanners = [...sliderBanners];
    let finalPromotionBanners = [...promotionBanners];

    if (unassigned.length > 0) {
        if (finalSliderBanners.length === 0) {
            finalSliderBanners.push(unassigned[0]);
            if (finalPromotionBanners.length === 0 && unassigned.length > 1) {
                finalPromotionBanners.push(unassigned[1]);
            }
        } else if (finalPromotionBanners.length === 0) {
            finalPromotionBanners.push(unassigned[0]);
        }
    }

    return (
        <>
            <Slider banners={finalSliderBanners} loading={loading} />
            <Category />
            <BannerPromotion banners={finalPromotionBanners} />
            <PopularProduct />
            <TopSeller />
            <Features />
            <Testimoni />
            <Partner />
            <BlogList title="Latest news" showViewAll limit={3} className="py-16 md:py-24 bg-white" />
            <ChatBot />
            <WheelOfFortune />
        </>

    )
}

export default Homepage