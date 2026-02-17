import { apiFetch } from "./auth.service";
import { UserResponse, RegisterRequest, UserUpdateRequest } from "../dtos/user.dto";

export const getAllUsers = async (): Promise<UserResponse[]> => {
    return apiFetch("/api/v1/users");
};

export const getClients = async (): Promise<UserResponse[]> => {
    return apiFetch("/api/v1/users/clients");
};

export const getUserById = async (id: number): Promise<UserResponse> => {
    return apiFetch(`/api/v1/users/${id}`);
};

export const createUser = async (data: RegisterRequest): Promise<void> => {
    return apiFetch("/api/v1/users", {
        method: "POST",
        body: JSON.stringify(data),
    });
};

export const updateUser = async (id: number, data: UserUpdateRequest): Promise<UserResponse> => {
    return apiFetch(`/api/v1/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
};

export const deleteUser = async (id: number): Promise<void> => {
    return apiFetch(`/api/v1/users/${id}`, {
        method: "DELETE",
    });
};

export const getCurrentUser = async (): Promise<any> => {
    return apiFetch("/api/v1/users/me");
};
