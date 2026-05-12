import { apiFetch } from "./auth.service";
import { ContactMessage } from "../dtos/contact.dto";
import { PageResponse } from "../dtos/product.dto";

export const getContactMessages = async (page?: number, size?: number): Promise<PageResponse<ContactMessage> | ContactMessage[]> => {
    const query = page !== undefined && size !== undefined ? `?page=${page}&size=${size}` : "";
    return apiFetch<PageResponse<ContactMessage> | ContactMessage[]>(`/v1/contact${query}`);
};

export const updateContactStatus = async (id: number, status: string, response?: string): Promise<ContactMessage> => {
    return apiFetch<ContactMessage>(`/v1/contact/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, response }),
    });
};
