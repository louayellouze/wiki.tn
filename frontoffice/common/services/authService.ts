import api from '@/common/utils/api';
import {
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    MessageResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    GoogleAuthRequest,
    User,
    ChangePasswordRequest
} from '@/app/dtos/auth';

export const AuthService = {
    login: async (credentials: LoginRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },

    register: async (data: RegisterRequest): Promise<MessageResponse> => {
        const response = await api.post<MessageResponse>('/auth/signup', data);
        return response.data;
    },

    logout: async (): Promise<MessageResponse> => {
        const response = await api.post<MessageResponse>('/auth/logout');
        return response.data;
    },

    refreshToken: async (): Promise<AuthResponse> => {
        // The backend uses @CookieValue for refresh token, so we don't need to pass it explicitly if withCredentials is true (default in many setups)
        const response = await api.post<AuthResponse>('/auth/refresh');
        return response.data;
    },

    forgotPassword: async (data: ForgotPasswordRequest): Promise<MessageResponse> => {
        const response = await api.post<MessageResponse>('/auth/forgot-password', data);
        return response.data;
    },

    resetPassword: async (data: ResetPasswordRequest): Promise<MessageResponse> => {
        const response = await api.post<MessageResponse>('/auth/reset-password', data);
        return response.data;
    },

    changePassword: async (data: ChangePasswordRequest): Promise<MessageResponse> => {
        const response = await api.patch<MessageResponse>('/v1/users/change-password', data);
        return response.data;
    },

    loginWithGoogle: async (idToken: string): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/google', { idToken });
        return response.data;
    },

    getCurrentUser: async (): Promise<User> => {
        const response = await api.get<User>('/v1/users/me');
        return response.data;
    },

    updateProfile: async (userId: number, data: Partial<User>): Promise<User> => {
        const response = await api.put<User>(`/v1/users/${userId}`, data);
        return response.data;
    },
    
    verifyEmail: async (token: string): Promise<MessageResponse> => {
        const response = await api.get<MessageResponse>(`/auth/verify-email?token=${token}`);
        return response.data;
    }
};
