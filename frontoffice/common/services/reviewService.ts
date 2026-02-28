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

    getProductReviews: async (productId: number): Promise<ReviewResponse[]> => {
        const response = await api.get<ReviewResponse[]>(`/reviews/product/${productId}`);
        return response.data;
    }
};
