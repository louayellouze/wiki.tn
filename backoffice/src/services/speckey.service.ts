import { apiFetch } from "./auth.service";
import { SpecKey } from "../dtos/product.dto";

export const getSpecKeys = async (): Promise<SpecKey[]> => {
    return apiFetch<SpecKey[]>("/v1/spec-keys");
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
