import { apiFetch } from "./auth.service";
import { ReviewResponse, PageResponse } from "../dtos/product.dto";

export const getReviews = async (page: number = 0, size: number = 10): Promise<PageResponse<ReviewResponse>> => {
    return apiFetch<PageResponse<ReviewResponse>>(`/v1/reviews?page=${page}&size=${size}`);
};

export const deleteReview = async (id: number): Promise<void> => {
    return apiFetch<void>(`/v1/reviews/${id}`, {
        method: "DELETE",
    });
};
