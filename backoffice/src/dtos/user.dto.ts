export type Role = "ADMIN" | "WEBMASTER" | "INFOLINE" | "CLIENT";

export interface User {
    id: number;
    username: string;
    email: string;
    lastName: string;
    firstName: string;
    address?: string;
    phone?: string;
    role: Role;
    enabled: boolean;
}

export interface UserResponse {
    id: number;
    username: string;
    email: string;
    lastName: string;
    firstName: string;
    address: string;
    phone: string;
    role: string;
    enabled: boolean;
}

export interface RegisterRequest {
    username: string;
    password?: string;
    lastName: string;
    firstName: string;
    email: string;
    role: Role;
    phone?: string;
    address?: string;
}

export interface UserUpdateRequest {
    username?: string;
    email?: string;
    lastName?: string;
    firstName?: string;
    address?: string;
    phone?: string;
    role?: Role;
    password?: string;
    enabled?: boolean;
}

export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
}

