import { apiFetch } from "./auth.service";
import { Category, CategoryRequest } from "../dtos/category.dto";

export const getCategories = async (): Promise<Category[]> => {
    return apiFetch("/api/categories");
};

export const getCategoryTree = async (): Promise<Category[]> => {
    return apiFetch("/api/categories/tree");
};

export const createCategory = async (data: CategoryRequest): Promise<Category> => {
    return apiFetch("/api/categories", {
        method: "POST",
        body: JSON.stringify(data),
    });
};

export const updateCategory = async (id: number, data: CategoryRequest): Promise<Category> => {
    return apiFetch(`/api/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
};

export const deleteCategory = async (id: number): Promise<void> => {
    return apiFetch(`/api/categories/${id}`, {
        method: "DELETE",
    });
};
