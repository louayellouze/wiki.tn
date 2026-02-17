export interface Category {
    id: number;
    name: string;
    description?: string;
    imageUrl?: string;
    parentId?: number;
    parentName?: string;
    subCategories?: Category[];
}

export interface CategoryRequest {
    name: string;
    description?: string;
    imageUrl?: string;
    parentId?: number;
}
