
import { apiFetch } from "./auth.service";
import { Order, OrderRequest } from "../dtos/order.dto";

export const getOrders = async (): Promise<Order[]> => {
    return apiFetch("/api/orders");
};

export const getOrderById = async (id: number): Promise<Order> => {
    return apiFetch(`/api/orders/${id}`);
};

export const createOrder = async (data: OrderRequest): Promise<Order> => {
    return apiFetch("/api/orders", {
        method: "POST",
        body: JSON.stringify(data),
    });
};

export const updateOrderStatus = async (id: number, status: string): Promise<Order> => {
    return apiFetch(`/api/orders/${id}/status?status=${status}`, {
        method: "PATCH",
    });
};

export const updateOrder = async (id: number, data: OrderRequest): Promise<Order> => {
    return apiFetch(`/api/orders/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
};

export const deleteOrder = async (id: number): Promise<void> => {
    return apiFetch(`/api/orders/${id}`, {
        method: "DELETE",
    });
};
