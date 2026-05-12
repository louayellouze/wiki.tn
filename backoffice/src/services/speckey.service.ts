import { apiFetch } from "./auth.service";
import { SpecKey, PageResponse } from "../dtos/product.dto";

export const getSpecKeys = async (page?: number, size?: number): Promise<PageResponse<SpecKey> | SpecKey[]> => {
    if (page !== undefined && size !== undefined) {
        return apiFetch<PageResponse<SpecKey>>(`/v1/spec-keys?page=${page}&size=${size}`);
    }
    return apiFetch<SpecKey[]>("/v1/spec-keys/list");
};

export const getSpecKeysList = async (): Promise<SpecKey[]> => {
    return apiFetch<SpecKey[]>("/v1/spec-keys/list");
};

export const createSpecKey = async (data: Partial<SpecKey>): Promise<SpecKey> => {
    return apiFetch<SpecKey>("/v1/spec-keys", {
        method: "POST",
        body: JSON.stringify(data),
    });
};

export const updateSpecKey = async (id: number, data: Partial<SpecKey>): Promise<SpecKey> => {
    return apiFetch<SpecKey>(`/v1/spec-keys/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
};

export const deleteSpecKey = async (id: number): Promise<void> => {
    return apiFetch<void>(`/v1/spec-keys/${id}`, {
        method: "DELETE",
    });
};

export const getSpecKeyValues = async (id: number): Promise<string[]> => {
    return apiFetch<string[]>(`/v1/spec-keys/${id}/values`);
};
