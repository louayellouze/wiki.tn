import api from '../utils/api';
import { storage } from '../utils/storage';
import { CategoryMinResponse } from '@/app/dtos/product';
import { PageResponse } from './productService';

export interface Category {
    name: string;
    slug: string;
    parentSlug?: string;
    subCategories: Category[];
}

const CATEGORY_TREE_CACHE_KEY = 'category_tree_cache';
const CATEGORY_TREE_VERSION_KEY = 'category_tree_version';
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days, we rely on versioning now

export const categoryService = {
    /**
     * Fetch the category tree with smart version-based cache support.
     * @param forceRefresh If true, bypass cache and fetch from server
     */
    getCategoryTree: async (forceRefresh = false): Promise<Category[]> => {
        try {
            // Check server version
            const versionResponse = await api.get<number>('/v1/categories/last-update');
            const serverVersion = versionResponse.data;
            const localVersion = storage.get<number>(CATEGORY_TREE_VERSION_KEY);

            if (!forceRefresh && localVersion === serverVersion) {
                const cachedData = storage.get<Category[]>(CATEGORY_TREE_CACHE_KEY);
                if (cachedData) {
                    console.log('Category tree loaded from smart cache');
                    return cachedData;
                }
            }

            // Fetch new data
            const response = await api.get<Category[]>('/v1/categories/tree');
            const data = response.data;

            // Update cache and version
            storage.set(CATEGORY_TREE_CACHE_KEY, data, CACHE_DURATION);
            storage.set(CATEGORY_TREE_VERSION_KEY, serverVersion, CACHE_DURATION);
            console.log('Category tree fetched from server and cache updated (v' + serverVersion + ')');

            return data;
        } catch (error) {
            console.error('Failed to fetch category tree', error);
            // Fallback to cache if offline/error
            const cachedData = storage.get<Category[]>(CATEGORY_TREE_CACHE_KEY);
            return cachedData || [];
        }
    },

    /**
     * Get a single category by ID
     */
    getCategoryById: async (id: string | number): Promise<Category> => {
        try {
            const response = await api.get(`/v1/categories/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch category with ID: ${id}`, error);
            // If ID lookup fails, likely a stale cache
            storage.remove(CATEGORY_TREE_CACHE_KEY);
            throw error;
        }
    },
    
    /**
     * Get a single category by slug
     */
    getCategoryBySlug: async (slug: string): Promise<Category> => {
        try {
            const response = await api.get(`/v1/categories/slug/${slug}`);
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch category with slug: ${slug}`, error);
            throw error;
        }
    },

    /**
     * Get all categories with optional pagination.
     */
    getAllCategories: async (page?: number, size?: number, sort?: string): Promise<PageResponse<CategoryMinResponse> | CategoryMinResponse[]> => {
        let url = '/v1/categories';
        if (page !== undefined && size !== undefined) {
            url += `?page=${page}&size=${size}`;
            if (sort) url += `&sort=${sort}`;
            const response = await api.get<PageResponse<CategoryMinResponse>>(url);
            return response.data;
        }
        const response = await api.get<CategoryMinResponse[]>(url);
        return response.data;
    },

    /**
     * Invalidate the category cache
     */
    invalidateCache: () => {
        storage.remove(CATEGORY_TREE_CACHE_KEY);
    }
};
