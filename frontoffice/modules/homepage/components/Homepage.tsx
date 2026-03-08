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

    // Unified banner distribution logic
    const sliderBanners = banners.filter(b => b.emplacement === 'HOME_SLIDER');
    let promotionBanner = banners.find(b => b.emplacement === 'HOME_PROMOTION') || null;

    // Fallback: If emplacement is missing, distribute logically
    const unassigned = banners.filter(b => !b.emplacement);

    let finalSliderBanners = sliderBanners.length > 0 ? sliderBanners : [];

    if (unassigned.length > 0) {
        if (finalSliderBanners.length === 0) {
            // If nothing in slider, the first unassigned goes to slider
            finalSliderBanners.push(unassigned[0]);
            // If we have more and no promotion, the second unassigned goes to promotion
            if (!promotionBanner && unassigned.length > 1) {
                promotionBanner = unassigned[1];
            }
        } else if (!promotionBanner) {
            // Slider has some, unassigned can fill promotion
            promotionBanner = unassigned[0];
        }
    }

    return (
        <>
            <Slider banners={finalSliderBanners} loading={loading} />
            <Category />
            <BannerPromotion banner={promotionBanner} />
            <PopularProduct />
            <TopSeller />
            <Features />
            <Testimoni />
            <Partner />
            <BlogList title="Latest news" showViewAll limit={3} className="py-16 md:py-24 bg-white" />
        </>
    )
}

export default Homepage