import api from '@/common/utils/api';
import { ProductResponse } from '@/app/dtos/product';

export interface ProductSearchResult {
    id: number;
    title: string;
    regularPrice: number;
    discountPrice?: number;
    stockStatus: string;
    imageUrl?: string;
}

export const ProductService = {
    getAllProducts: async (): Promise<ProductResponse[]> => {
        const response = await api.get<ProductResponse[]>('/v1/products');
        return response.data;
    },

    getProductById: async (id: number): Promise<ProductResponse> => {
        const response = await api.get<ProductResponse>(`/v1/products/${id}`);
        return response.data;
    },

    searchProducts: async (query: string): Promise<ProductResponse[]> => {
        const response = await api.get<ProductResponse[]>(`/v1/products/search?q=${encodeURIComponent(query)}`);
        return response.data;
    },

    searchProductsAutocomplete: async (query: string): Promise<ProductSearchResult[]> => {
        const response = await api.get<ProductSearchResult[]>(`/v1/products/search/autocomplete?q=${encodeURIComponent(query)}`);
        return response.data;
    },

    getProductsByCategory: async (categoryId: number): Promise<ProductResponse[]> => {
        const response = await api.get<ProductResponse[]>(`/v1/products/category/${categoryId}`);
        return response.data;
    }
};
