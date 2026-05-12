import { apiFetch } from "./auth.service";
import { RepairItem, RepairItemRequest, RepairQuote, RepairQuoteRequest, RepairRequest, RepairSection } from "../dtos/repair.dto";

export const uploadFile = async (file: File): Promise<{ fileName: string; fileUrl: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    
    return apiFetch<{ fileName: string; fileUrl: string }>("/v1/upload", {
        method: "POST",
        body: formData,
    });
};

export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export const getRepairItems = async (section?: RepairSection, onlyActive: boolean = false): Promise<RepairItem[]> => {
    const params = new URLSearchParams();
    if (section) params.append("section", section);
    params.append("onlyActive", onlyActive.toString());
    
    return apiFetch<RepairItem[]>(`/v1/repair-items?${params.toString()}`);
};

export const searchRepairItems = async (params: { query?: string; section?: RepairSection; page?: number; size?: number; sort?: string }): Promise<PageResponse<RepairItem>> => {
    const searchParams = new URLSearchParams();
    if (params.query) searchParams.append("query", params.query);
    if (params.section) searchParams.append("section", params.section);
    if (params.page !== undefined) searchParams.append("page", params.page.toString());
    if (params.size !== undefined) searchParams.append("size", params.size.toString());
    if (params.sort) searchParams.append("sort", params.sort);
    
    return apiFetch<PageResponse<RepairItem>>(`/v1/repair-items/search?${searchParams.toString()}`);
};

export const createRepairItem = async (data: RepairItemRequest): Promise<RepairItem> => {
    return apiFetch<RepairItem>("/v1/repair-items", {
        method: "POST",
        body: JSON.stringify(data),
    });
};

export const updateRepairItem = async (id: number, data: RepairItemRequest): Promise<RepairItem> => {
    return apiFetch<RepairItem>(`/v1/repair-items/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
};

export const deleteRepairItem = async (id: number): Promise<void> => {
    return apiFetch<void>(`/v1/repair-items/${id}`, {
        method: "DELETE",
    });
};

// Repair Requests
export const getRepairRequests = async (status?: string): Promise<RepairRequest[]> => {
    const query = status ? `?status=${status}` : "";
    return apiFetch<RepairRequest[]>(`/v1/repair-requests${query}`);
};

export const searchRepairRequests = async (params: { query?: string; status?: string; page?: number; size?: number; sort?: string }): Promise<PageResponse<RepairRequest>> => {
    const searchParams = new URLSearchParams();
    if (params.query) searchParams.append("query", params.query);
    if (params.status) searchParams.append("status", params.status);
    if (params.page !== undefined) searchParams.append("page", params.page.toString());
    if (params.size !== undefined) searchParams.append("size", params.size.toString());
    if (params.sort) searchParams.append("sort", params.sort);
    
    return apiFetch<PageResponse<RepairRequest>>(`/v1/repair-requests/search?${searchParams.toString()}`);
};

export const updateRepairRequestStatus = async (id: number, status: string): Promise<RepairRequest> => {
    return apiFetch<RepairRequest>(`/v1/repair-requests/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
    });
};

export const deleteRepairRequest = async (id: number): Promise<void> => {
    return apiFetch<void>(`/v1/repair-requests/${id}`, {
        method: "DELETE",
    });
};

// Repair Quotes
export const sendQuote = async (requestId: number, data: RepairQuoteRequest): Promise<RepairQuote> => {
    return apiFetch<RepairQuote>(`/v1/repair-quotes/request/${requestId}`, {
        method: "POST",
        body: JSON.stringify(data),
    });
};

export const getQuoteByRequestId = async (requestId: number): Promise<RepairQuote> => {
    return apiFetch<RepairQuote>(`/v1/repair-quotes/request/${requestId}`);
};

