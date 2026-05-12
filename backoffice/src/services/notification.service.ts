import { apiFetch } from "./auth.service";
import { PageResponse } from "../dtos/product.dto";

export interface NotificationResponse {
    id: number;
    message: string;
    type: string;
    relatedEntityId: number;
    createdAt: string;
    read: boolean;
}

export const getUnreadNotifications = async (): Promise<NotificationResponse[]> => {
    return apiFetch<NotificationResponse[]>("/v1/notifications/unread");
};

export const getAllNotifications = async (page = 0, size = 20): Promise<PageResponse<NotificationResponse> | NotificationResponse[]> => {
    const query = `?page=${page}&size=${size}`;
    return apiFetch<PageResponse<NotificationResponse> | NotificationResponse[]>(`/v1/notifications${query}`);
};

export const getAllNotificationsList = async (): Promise<NotificationResponse[]> => {
    return apiFetch<NotificationResponse[]>("/v1/notifications/all"); // Assuming we might want a non-paginated version later
};

export const markAsRead = async (id: number): Promise<void> => {
    return apiFetch<void>(`/v1/notifications/${id}/read`, {
        method: "PATCH",
    });
};

export const markAllAsRead = async (): Promise<void> => {
    return apiFetch<void>("/v1/notifications/read-all", {
        method: "PATCH",
    });
};
