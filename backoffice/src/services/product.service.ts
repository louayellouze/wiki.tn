import { apiFetch } from "./auth.service";
import { Product, ProductCreateRequest, ProductUpdateRequest, PageResponse } from "../dtos/product.dto";

export const getProducts = async (page?: number, size?: number, search?: string, categoryId?: number | "all", stockStatus?: string, isFlashSale?: boolean): Promise<PageResponse<Product> | Product[]> => {
    const params = new URLSearchParams();
    if (page !== undefined) params.append("page", page.toString());
    if (size !== undefined) params.append("size", size.toString());
    if (search) params.append("search", search);
    if (categoryId && categoryId !== "all") params.append("categoryId", categoryId.toString());
    if (stockStatus && stockStatus !== "all") params.append("stockStatus", stockStatus);
    if (isFlashSale !== undefined) params.append("isFlashSale", isFlashSale.toString());
    
    const query = params.toString() ? `?${params.toString()}` : "";
    return apiFetch<PageResponse<Product> | Product[]>(`/v1/products${query}`);
};

export const getProductsList = async (): Promise<Product[]> => {
    return apiFetch<Product[]>("/v1/products");
};

export const getProductById = async (id: number): Promise<Product> => {
    return apiFetch<Product>(`/v1/products/${id}`);
};

export const createProduct = async (data: ProductCreateRequest): Promise<Product> => {
    return apiFetch<Product>("/v1/products", {
        method: "POST",
        body: JSON.stringify(data),
    });
};

export const updateProduct = async (id: number, data: ProductUpdateRequest): Promise<Product> => {
    return apiFetch<Product>(`/v1/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
};

export const deleteProduct = async (id: number): Promise<void> => {
    return apiFetch<void>(`/v1/products/${id}`, {
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

export const getLowStockProducts = async (threshold: number = 5): Promise<Product[]> => {
    return apiFetch<Product[]>(`/v1/products/low-stock?threshold=${threshold}`);
};
