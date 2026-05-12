export interface CategoryResponse {
    id: number;
    name: string;
    slug: string;
    parentId?: number | null;
    parentName?: string | null;
}

export interface CategoryMinResponse {
    name: string;
    slug: string;
    imageUrl?: string;
    parentId?: number | null;
    isFeatured: boolean;
}

export interface ImageDto {
    id: number;
    imageUrl: string;
    alt?: string;
}

export interface SpecificationDto {
    id: number;
    keyName: string;
    keyId: number;
    value: string;
}

export interface ReviewResponse {
    id: number;
    rating: number;
    comment: string;
    createdAt: string;
    username: string;
    userFullName: string;
}

export interface BrandResponse {
    id: number;
    name: string;
    slug: string;
    logoUrl: string;
    description?: string;
}

export interface ProductResponse {
    id: number;
    title: string;
    slug: string;
    description: string;
    regularPrice: number;
    quantity: number;
    categories: CategoryResponse[];
    codeSage?: string;
    reference: string;
    discountPrice?: number;
    stockStatus: string;
    imageUrl?: string;
    images: ImageDto[];
    specifications: SpecificationDto[];
    averageRating: number;
    brand?: BrandResponse;
    reviews: ReviewResponse[];
    isFlashSale: boolean;
}

export interface ProductMinResponse {
    id: number;
    title: string;
    slug: string;
    regularPrice: number;
    discountPrice?: number;
    stockStatus: string;
    imageUrl?: string;
    isFlashSale: boolean;
}

export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}
