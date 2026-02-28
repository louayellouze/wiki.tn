import { apiFetch } from "./auth.service";
import { UserResponse, RegisterRequest, UserUpdateRequest, ChangePasswordRequest } from "../dtos/user.dto";


export const getAllUsers = async (): Promise<UserResponse[]> => {
    return apiFetch<UserResponse[]>("/v1/users");
};

export const getClients = async (): Promise<UserResponse[]> => {
    return apiFetch<UserResponse[]>("/v1/users/clients");
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

