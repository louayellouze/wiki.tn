import api from '@/common/utils/api';

export interface ContactFormData {
    firstName: string;
    lastName?: string;
    email: string;
    phone?: string;
    message: string;
}

export const contactService = {
    sendContactMessage: async (data: ContactFormData) => {
        const response = await api.post('/v1/contact', data);
        return response.data;
    }
};
