export interface LoginRequest {
    username?: string;
    password?: string;
}

export interface RegisterRequest {
    username?: string;
    password?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    role?: string;
}

export interface AuthResponse {
    accessToken: string;
}

export interface MessageResponse {
    message: string;
}

export interface ForgotPasswordRequest {
    identifier: string;
}

export interface ResetPasswordRequest {
    token: string;
    password: string;
}

export interface GoogleAuthRequest {
    idToken: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    role: string;
    imageUrl?: string;
}

export interface ChangePasswordRequest {
    oldPassword?: string;
    newPassword?: string;
}
