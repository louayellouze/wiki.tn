import { Category } from "./category.dto";

export type StockStatus = "EN_STOCK" | "EN_COMMANDE" | "EN_ARRIVAGE" | "HORS_STOCK";

export interface ImageDto {
    id?: number;
    imageUrl: string;
    alt: string;
}

export interface SpecificationDto {
    id?: number;
    keyId: number;
    keyName: string;
    value: string;
}

export interface Product {
    id: number;
    title: string;
    description: string;
    reference: string;
    regularPrice: number;
    discountPrice?: number;
    quantity: number;
    categories: Category[];
    codeSage: string;
    stockStatus: StockStatus;
    imageUrl?: string;
    images: ImageDto[];
    specifications: SpecificationDto[];
    isFlashSale: boolean;
    brand?: {
        id: number;
        name: string;
        logoUrl: string;
    };
}

export interface ProductCreateRequest {
    title: string;
    description: string;
    reference: string;
    regularPrice: number;
    discountPrice?: number;
    quantity: number;
    categoryIds: number[];
    codeSage: string;
    stockStatus: StockStatus;
    images: ImageDto[];
    specifications: SpecificationDto[];
    brandId?: number;
    isFlashSale: boolean;
}

export interface ProductUpdateRequest {
    title?: string;
    description?: string;
    reference?: string;
    regularPrice?: number;
    discountPrice?: number;
    quantity?: number;
    categoryIds?: number[];
    codeSage?: string;
    stockStatus?: StockStatus;
    images?: ImageDto[];
    specifications?: SpecificationDto[];
    brandId?: number;
    isFlashSale?: boolean;
}

export interface SpecKey {
    id: number;
    name: string;
}

export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export interface ReviewResponse {
    id: number;
    rating: number;
    comment: string;
    createdAt: string;
    username: string;
    fullName: string;
    productId: number;
    productTitle: string;
    productImage: string;
    sentiment?: string;
    sentimentScore?: number;
}
