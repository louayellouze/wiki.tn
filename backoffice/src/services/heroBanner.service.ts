import { apiFetch } from "./auth.service";
import { HeroBanner, HeroBannerCreateRequest, HeroBannerUpdateRequest } from "../dtos/hero-banner.dto";

export const getHeroBanners = async (): Promise<HeroBanner[]> => {
    return apiFetch<HeroBanner[]>("/v1/hero-banners/all");
};

export const createHeroBanner = async (data: HeroBannerCreateRequest): Promise<HeroBanner> => {
    return apiFetch<HeroBanner>("/v1/hero-banners", {
        method: "POST",
        body: JSON.stringify(data),
    });
};

export const updateHeroBanner = async (id: number, data: HeroBannerUpdateRequest): Promise<HeroBanner> => {
    return apiFetch<HeroBanner>(`/v1/hero-banners/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
};

export const deleteHeroBanner = async (id: number): Promise<void> => {
    return apiFetch<void>(`/v1/hero-banners/${id}`, {
        method: "DELETE",
    });
};

export const toggleHeroBannerActive = async (id: number): Promise<HeroBanner> => {
    return apiFetch<HeroBanner>(`/v1/hero-banners/${id}/toggle`, {
        method: "PATCH",
    });
};
