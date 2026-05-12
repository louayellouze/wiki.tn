import api from '@/common/utils/api';

export interface ContactFormData {
    firstName: string;
    lastName?: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
}

export const contactService = {
    sendContactMessage: async (data: ContactFormData) => {
        const response = await api.post('/v1/contact', data);
        return response.data;
    },
    getMyMessages: async () => {
        const response = await api.get('/v1/contact/my');
        return response.data;
    },
    updateStatus: async (id: number, status: string, responseText?: string) => {
        const res = await api.patch(`/v1/contact/${id}/status`, { status, response: responseText });
        return res.data;
    }
};
