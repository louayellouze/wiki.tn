import { apiFetch } from "./auth.service";
import { Coupon } from "../dtos/coupon.dto";

export const getCoupons = async (): Promise<Coupon[]> => {
    return apiFetch<Coupon[]>("/v1/coupons");
};

export const createCoupon = async (data: Partial<Coupon>): Promise<Coupon> => {
    return apiFetch<Coupon>("/v1/coupons", {
        method: "POST",
        body: JSON.stringify(data),
    });
};

export const updateCoupon = async (id: number, data: Partial<Coupon>): Promise<Coupon> => {
    return apiFetch<Coupon>(`/v1/coupons/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
};

export const deleteCoupon = async (id: number): Promise<void> => {
    return apiFetch<void>(`/v1/coupons/${id}`, {
        method: "DELETE",
    });
};
