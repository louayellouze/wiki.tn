import api from '@/common/utils/api';

export interface ContactMessage {
    id: number;
    firstName: string;
    lastName?: string;
    email: string;
    phone?: string;
    message: string;
    createdAt: string;
}

export const adminContactService = {
    getAllMessages: async () => {
        const response = await api.get('/v1/contact');
        return response.data as ContactMessage[];
    }
};
