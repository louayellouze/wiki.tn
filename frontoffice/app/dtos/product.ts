export interface CategoryResponse {
    id: number;
    name: string;
    parentId?: number | null;
    parentName?: string | null;
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

export interface ProductResponse {
    id: number;
    title: string;
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
    reviews: ReviewResponse[];
}
