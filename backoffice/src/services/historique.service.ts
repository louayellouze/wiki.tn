import { apiFetch } from "./auth.service";
import { Historique } from "../dtos/historique.dto";

export const getHistorique = async (page = 0, size = 20): Promise<Historique[]> => {
    const data = await apiFetch<{ content: Historique[] }>(`/historique?page=${page}&size=${size}`);
    return data.content || [];
};

export const searchHistorique = async (filters: Record<string, any>): Promise<Historique[]> => {
    // Clean filters to avoid sending empty strings for Enums
    const cleanFilters: Record<string, any> = { ...filters };
    if (!cleanFilters.actionType) delete cleanFilters.actionType;
    if (!cleanFilters.entityType) delete cleanFilters.entityType;

    const data = await apiFetch<{ content: Historique[] }>(`/historique/search`, {
        method: "POST",
        body: JSON.stringify(cleanFilters)
    });
    return data.content || [];
};
