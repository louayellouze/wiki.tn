import api from '@/common/utils/api';
import { ReviewResponse, PageResponse } from '@/app/dtos/product';

export interface ReviewRequest {
    rating: number;
    comment: string;
    productId: number;
}

export const ReviewService = {
    addReview: async (request: ReviewRequest): Promise<ReviewResponse> => {
        const response = await api.post<ReviewResponse>('/v1/reviews', request);
        return response.data;
    },

    updateReview: async (reviewId: number, request: Partial<ReviewRequest>): Promise<ReviewResponse> => {
        const response = await api.put<ReviewResponse>(`/v1/reviews/${reviewId}`, request);
        return response.data;
    },

    deleteReview: async (reviewId: number): Promise<void> => {
        await api.delete(`/v1/reviews/${reviewId}`);
    },

    getProductReviews: async (productId: number, page = 0, size = 10): Promise<PageResponse<ReviewResponse>> => {
        const response = await api.get<PageResponse<ReviewResponse>>(`/v1/reviews/product/${productId}?page=${page}&size=${size}`);
        return response.data;
    },

    getMyReviews: async (): Promise<ReviewResponse[]> => {
        const response = await api.get<ReviewResponse[]>('/v1/reviews/my');
        return response.data;
    }
};
