import api from '@/common/utils/api';
import { ReviewResponse } from '@/app/dtos/product';

export interface ReviewRequest {
    rating: number;
    comment: string;
    productId: number;
}

export const ReviewService = {
    addReview: async (request: ReviewRequest): Promise<ReviewResponse> => {
        const response = await api.post<ReviewResponse>('/reviews', request);
        return response.data;
    },

    updateReview: async (reviewId: number, rating: number): Promise<ReviewResponse> => {
        const response = await api.put<ReviewResponse>(`/reviews/${reviewId}`, { rating, comment: '', productId: 0 });
        return response.data;
    },

    deleteReview: async (reviewId: number): Promise<void> => {
        await api.delete(`/reviews/${reviewId}`);
    },

    getProductReviews: async (productId: number): Promise<ReviewResponse[]> => {
        const response = await api.get<ReviewResponse[]>(`/reviews/product/${productId}`);
        return response.data;
    }
};
