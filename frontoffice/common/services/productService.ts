import api from '@/common/utils/api';
import { ProductResponse, ProductMinResponse } from '@/app/dtos/product';

export interface ProductSearchResult {
    id: number;
    title: string;
    regularPrice: number;
    discountPrice?: number;
    stockStatus: string;
    slug: string;
    imageUrl?: string;
}

export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export const ProductService = {
    getAllProducts: async (page?: number, size?: number, sort?: string): Promise<PageResponse<ProductMinResponse> | ProductMinResponse[]> => {
        let url = '/v1/products';
        if (page !== undefined && size !== undefined) {
            url += `?page=${page}&size=${size}`;
            if (sort) url += `&sort=${sort}`;
            const response = await api.get<PageResponse<ProductMinResponse>>(url);
            return response.data;
        }
        const response = await api.get<ProductMinResponse[]>(url);
        return response.data;
    },

    getFlashSaleProducts: async (page?: number, size?: number): Promise<PageResponse<ProductMinResponse> | ProductMinResponse[]> => {
        let url = '/v1/products/flash-sale';
        if (page !== undefined && size !== undefined) {
            url += `?page=${page}&size=${size}`;
            const response = await api.get<PageResponse<ProductMinResponse>>(url);
            return response.data;
        }
        const response = await api.get<ProductMinResponse[]>(url);
        return response.data;
    },

    getProductById: async (id: number): Promise<ProductResponse> => {
        const response = await api.get<ProductResponse>(`/v1/products/${id}`);
        return response.data;
    },

    getProductBySlug: async (slug: string): Promise<ProductResponse> => {
        const response = await api.get<ProductResponse>(`/v1/products/slug/${slug}`);
        return response.data;
    },

    searchProducts: async (query: string, page?: number, size?: number): Promise<PageResponse<ProductMinResponse> | ProductMinResponse[]> => {
        let url = `/v1/products/search?q=${encodeURIComponent(query)}`;
        if (page !== undefined && size !== undefined) {
             url += `&page=${page}&size=${size}`;
             const response = await api.get<PageResponse<ProductMinResponse>>(url);
             return response.data;
        }
        const response = await api.get<ProductMinResponse[]>(url);
        return response.data;
    },

    searchProductsAutocomplete: async (query: string): Promise<ProductSearchResult[]> => {
        const response = await api.get<ProductSearchResult[]>(`/v1/products/search/autocomplete?q=${encodeURIComponent(query)}`);
        return response.data;
    },

    getProductsByCategory: async (categoryId: number, page?: number, size?: number): Promise<PageResponse<ProductMinResponse> | ProductMinResponse[]> => {
        let url = `/v1/products/category/${categoryId}`;
        if (page !== undefined && size !== undefined) {
             url += `?page=${page}&size=${size}`;
             const response = await api.get<PageResponse<ProductMinResponse>>(url);
             return response.data;
        }
        const response = await api.get<ProductMinResponse[]>(url);
        return response.data;
    },

    getProductsByCategorySlug: async (categorySlug: string, page?: number, size?: number): Promise<PageResponse<ProductMinResponse> | ProductMinResponse[]> => {
        return ProductService.getFilteredProducts({ categorySlug, page, size });
    },

    getFilteredProducts: async (params: Record<string, any>): Promise<PageResponse<ProductMinResponse>> => {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (Array.isArray(value)) {
                    queryParams.append(key, value.join(','));
                } else {
                    queryParams.append(key, value.toString());
                }
            }
        });
        const response = await api.get<PageResponse<ProductMinResponse>>(`/v1/products/filter?${queryParams.toString()}`);
        return response.data;
    }
};
