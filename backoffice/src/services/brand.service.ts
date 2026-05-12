import { apiFetch } from "./auth.service";
import { Brand, BrandRequest } from "../dtos/brand.dto";
import { PageResponse } from "../dtos/product.dto";

export const getBrands = async (page?: number, size?: number): Promise<PageResponse<Brand> | Brand[]> => {
    const query = page !== undefined && size !== undefined ? `?page=${page}&size=${size}` : "";
    return apiFetch<PageResponse<Brand> | Brand[]>(`/v1/brands${query}`);
};

export const getAllBrandsList = async (): Promise<Brand[]> => {
    return apiFetch<Brand[]>("/v1/brands/all");
};

export const getBrandById = async (id: number): Promise<Brand> => {
    return apiFetch<Brand>(`/v1/brands/${id}`);
};

export const createBrand = async (data: BrandRequest): Promise<Brand> => {
    return apiFetch<Brand>("/v1/brands", {
        method: "POST",
        body: JSON.stringify(data),
    });
};

export const updateBrand = async (id: number, data: Partial<BrandRequest>): Promise<Brand> => {
    return apiFetch<Brand>(`/v1/brands/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
};

export const deleteBrand = async (id: number): Promise<void> => {
    return apiFetch<void>(`/v1/brands/${id}`, {
        method: "DELETE",
    });
};
