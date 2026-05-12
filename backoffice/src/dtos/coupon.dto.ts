export interface Coupon {
    id: number;
    code: string;
    discountType: 'PERCENT' | 'FIXED';
    discountValue: number;
    minOrderAmount: number;
    expiryDate: string;
    isActive: boolean;
}

export interface CouponCreateRequest {
    code: string;
    discountType: 'PERCENT' | 'FIXED';
    discountValue: number;
    minOrderAmount: number;
    expiryDate: string;
    isActive: boolean;
}
