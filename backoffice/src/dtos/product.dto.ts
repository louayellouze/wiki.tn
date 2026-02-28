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
}

export interface SpecKey {
    id: number;
    name: string;
}
