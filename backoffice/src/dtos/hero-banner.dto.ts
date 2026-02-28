export interface HeroBanner {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    linkUrl: string;
    buttonText: string;
    emplacement: string;
    active: boolean;
    displayOrder: number;
}

export interface HeroBannerCreateRequest {
    title: string;
    description: string;
    imageUrl: string;
    linkUrl: string;
    buttonText: string;
    emplacement: string;
    active: boolean;
    displayOrder: number;
}

export interface HeroBannerUpdateRequest {
    title?: string;
    description?: string;
    imageUrl?: string;
    linkUrl?: string;
    buttonText?: string;
    emplacement?: string;
    active?: boolean;
    displayOrder?: number;
}
