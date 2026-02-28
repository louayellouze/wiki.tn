import api from '../utils/api';
import { HeroBanner } from '../types/hero-banner';

export const getActiveBanners = async (emplacement?: string): Promise<HeroBanner[]> => {
    const url = emplacement
        ? `/v1/hero-banners?emplacement=${emplacement}`
        : '/v1/hero-banners';
    const response = await api.get<HeroBanner[]>(url);
    return response.data;
};
