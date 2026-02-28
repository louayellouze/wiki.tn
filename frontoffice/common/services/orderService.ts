import api from '../utils/api';

export const createOrder = async (orderData: any) => {
    const response = await api.post('/v1/orders', orderData);
    return response.data;
};

export const getMyOrders = async () => {
    const response = await api.get('/v1/orders/my');
    return response.data;
};

export const getOrderById = async (id: number) => {
    const response = await api.get(`/v1/orders/${id}`);
    return response.data;
};
