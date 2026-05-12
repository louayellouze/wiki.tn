import { apiFetch } from "./auth.service";
import { Order, OrderRequest } from "../dtos/order.dto";
import { PageResponse } from "../dtos/product.dto";

export const getOrders = async (page?: number, size?: number): Promise<PageResponse<Order> | Order[]> => {
    const query = page !== undefined && size !== undefined ? `?page=${page}&size=${size}` : "";
    return apiFetch<PageResponse<Order> | Order[]>(`/v1/orders${query}`);
};

export const getOrderById = async (id: number): Promise<Order> => {
    return apiFetch<Order>(`/v1/orders/${id}`);
};

export const createOrder = async (data: OrderRequest): Promise<Order> => {
    return apiFetch<Order>("/v1/orders", {
        method: "POST",
        body: JSON.stringify(data),
    });
};

export const updateOrderStatus = async (id: number, status: string): Promise<Order> => {
    return apiFetch<Order>(`/v1/orders/${id}/status?status=${status}`, {
        method: "PATCH",
    });
};

export const updateOrder = async (id: number, data: OrderRequest): Promise<Order> => {
    return apiFetch<Order>(`/v1/orders/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
};

export const deleteOrder = async (id: number): Promise<void> => {
    return apiFetch<void>(`/v1/orders/${id}`, {
        method: "DELETE",
    });
};
