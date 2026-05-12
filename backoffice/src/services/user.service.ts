import { apiFetch } from "./auth.service";
import { UserResponse, RegisterRequest, UserUpdateRequest, ChangePasswordRequest } from "../dtos/user.dto";
import { PageResponse } from "../dtos/product.dto";

export const getAllUsers = async (page?: number, size?: number, search?: string, role?: string): Promise<PageResponse<UserResponse> | UserResponse[]> => {
    const params = new URLSearchParams();
    if (page !== undefined) params.append("page", page.toString());
    if (size !== undefined) params.append("size", size.toString());
    if (search) params.append("search", search);
    if (role && role !== "all") params.append("role", role);
    
    const query = params.toString() ? `?${params.toString()}` : "";
    return apiFetch<PageResponse<UserResponse> | UserResponse[]>(`/v1/users${query}`);
};

export const getClients = async (page?: number, size?: number, search?: string): Promise<PageResponse<UserResponse> | UserResponse[]> => {
    const params = new URLSearchParams();
    if (page !== undefined) params.append("page", page.toString());
    if (size !== undefined) params.append("size", size.toString());
    if (search) params.append("search", search);
    
    const query = params.toString() ? `?${params.toString()}` : "";
    return apiFetch<PageResponse<UserResponse> | UserResponse[]>(`/v1/users/clients${query}`);
};

export const getUserById = async (id: number): Promise<UserResponse> => {
    return apiFetch<UserResponse>(`/v1/users/${id}`);
};

export const createUser = async (data: RegisterRequest): Promise<void> => {
    return apiFetch<void>("/v1/users", {
        method: "POST",
        body: JSON.stringify(data),
    });
};

export const updateUser = async (id: number, data: UserUpdateRequest): Promise<UserResponse> => {
    return apiFetch<UserResponse>(`/v1/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
};

export const deleteUser = async (id: number): Promise<void> => {
    return apiFetch<void>(`/v1/users/${id}`, {
        method: "DELETE",
    });
};

export const getCurrentUser = async (): Promise<UserResponse> => {
    return apiFetch<UserResponse>("/v1/users/me");
};

export const changePassword = async (data: ChangePasswordRequest): Promise<void> => {
    return apiFetch<void>("/v1/users/change-password", {
        method: "PATCH",
        body: JSON.stringify(data),
    });
};

export const toggleUserStatus = async (id: number): Promise<{enabled: boolean}> => {
    return apiFetch<{enabled: boolean}>(`/v1/users/${id}/toggle-status`, {
        method: "PATCH",
    });
};

