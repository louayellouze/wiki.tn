export interface Category {
    id: number;
    name: string;
    description?: string;
    imageUrl?: string;
    isFeatured: boolean;
    parentId?: number;
    parentName?: string;
    subCategories?: Category[];
}

export interface CategoryRequest {
    name: string;
    description?: string;
    imageUrl?: string;
    isFeatured: boolean;
    parentId?: number;
}
