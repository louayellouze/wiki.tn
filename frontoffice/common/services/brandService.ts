import api from '../utils/api';

export interface Brand {
    id: number;
    name: string;
    slug: string;
    description: string;
    logoUrl: string;
}

export const getBrands = async (): Promise<Brand[]> => {
    const response = await api.get<Brand[]>('/v1/brands/all');
    return response.data;
}
