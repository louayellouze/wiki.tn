import { apiFetch } from "./auth.service";
import { Category, CategoryRequest } from "../dtos/category.dto";
import { PageResponse } from "../dtos/product.dto";

export const getCategories = async (page?: number, size?: number): Promise<PageResponse<Category> | Category[]> => {
    const query = page !== undefined && size !== undefined ? `?page=${page}&size=${size}` : "";
    return apiFetch<PageResponse<Category> | Category[]>(`/v1/categories${query}`);
};

export const getCategoriesList = async (): Promise<Category[]> => {
    return apiFetch<Category[]>("/v1/categories");
};

export const getCategoryById = async (id: number): Promise<Category> => {
    return apiFetch<Category>(`/v1/categories/${id}`);
};

export const getCategoryTree = async (): Promise<Category[]> => {
    return apiFetch<Category[]>("/v1/categories/tree");
};

export const createCategory = async (data: CategoryRequest): Promise<Category> => {
    return apiFetch<Category>("/v1/categories", {
        method: "POST",
        body: JSON.stringify(data),
    });
};

export const updateCategory = async (id: number, data: Partial<CategoryRequest>): Promise<Category> => {
    return apiFetch<Category>(`/v1/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
};

export const deleteCategory = async (id: number): Promise<void> => {
    return apiFetch<void>(`/v1/categories/${id}`, {
        method: "DELETE",
    });
};
