import { apiFetch } from "./auth.service";
import { Product, ProductCreateRequest, ProductUpdateRequest } from "../dtos/product.dto";

export const getProducts = async (): Promise<Product[]> => {
    return apiFetch("/api/v1/products");
};

export const getProductById = async (id: number): Promise<Product> => {
    return apiFetch(`/api/v1/products/${id}`);
};

export const createProduct = async (data: ProductCreateRequest): Promise<Product> => {
    return apiFetch("/api/v1/products", {
        method: "POST",
        body: JSON.stringify(data),
    });
};

export const updateProduct = async (id: number, data: ProductUpdateRequest): Promise<Product> => {
    return apiFetch(`/api/v1/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
};

export const deleteProduct = async (id: number): Promise<void> => {
    return apiFetch(`/api/v1/products/${id}`, {
        method: "DELETE",
    });
};

export const uploadImage = async (file: File): Promise<{ url: string }> => {
    // Current requirement: Base64 upload
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve({ url: reader.result as string });
        reader.onerror = (error) => reject(error);
    });
};
