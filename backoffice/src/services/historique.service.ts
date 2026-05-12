import { apiFetch } from "./auth.service";
import { Historique } from "../dtos/historique.dto";
import { PageResponse } from "../dtos/product.dto";

export const getHistorique = async (page = 0, size = 20): Promise<PageResponse<Historique>> => {
    return apiFetch<PageResponse<Historique>>(`/historique?page=${page}&size=${size}`);
};

export const searchHistorique = async (filters: Record<string, any>, page = 0, size = 20): Promise<PageResponse<Historique>> => {
    // Clean filters to avoid sending empty strings for Enums
    const cleanFilters: Record<string, any> = { ...filters };
    if (!cleanFilters.actionType) delete cleanFilters.actionType;
    if (!cleanFilters.entityType) delete cleanFilters.entityType;

    return apiFetch<PageResponse<Historique>>(`/historique/search?page=${page}&size=${size}`, {
        method: "POST",
        body: JSON.stringify(cleanFilters)
    });
};
