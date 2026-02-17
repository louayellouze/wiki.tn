import { apiFetch } from "./auth.service";
import { SpecKey } from "../dtos/product.dto";

export const getSpecKeys = async (): Promise<SpecKey[]> => {
    return apiFetch("/api/v1/spec-keys");
};

export const createSpecKey = async (name: string, type?: string): Promise<SpecKey> => {
    return apiFetch("/api/v1/spec-keys", {
        method: "POST",
        body: JSON.stringify({ name, type }),
    });
};

export const deleteSpecKey = async (id: number): Promise<void> => {
    return apiFetch(`/api/v1/spec-keys/${id}`, {
        method: "DELETE",
    });
};
