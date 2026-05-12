import { jwtDecode } from "jwt-decode";
import { setCookie, deleteCookie } from "cookies-next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8089/api";

interface JwtPayload {
    sub: string;
    role: string;
    exp: number;
}

interface ApiError {
    error?: string;
    message?: string;
    text?: string;
}

interface AuthResponse {
    accessToken: string;
}

interface MessageResponse {
    message: string;
}

/**
 * Enhanced fetch wrapper with automatic token refresh
 */
export const apiFetch = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    let token: string | null = null;

    if (typeof window !== "undefined") {
        token = localStorage.getItem("token");
    } else {
        // Server-side: Try to get token from cookies
        try {
            const { cookies } = await import("next/headers");
            const cookieStore = await cookies();
            token = cookieStore.get("token")?.value || null;
        } catch (e) {
            console.error("Could not access cookies in Server Component:", e);
        }
    }

    const getHeaders = (t: string | null) => {
        const headers: Record<string, string> = {
            ...(t ? { "Authorization": `Bearer ${t}` } : {}),
            ...(options.headers as Record<string, string> || {}),
        };
        
        // Don't set Content-Type if body is FormData (let browser handle it)
        if (!(options.body instanceof FormData)) {
            headers["Content-Type"] = "application/json";
        }
        
        return headers;
    };

    try {
        let response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: getHeaders(token),
        });

        // Handle Token Expiration (401)
        if (response.status === 401 && !endpoint.includes("/auth/refresh")) {
            if (typeof window === "undefined") {
                throw new Error("Authentification requise");
            }

            console.log("Token expiré, tentative de rafraîchissement...");

            const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });

            if (refreshRes.ok) {
                const data: AuthResponse = await refreshRes.json();
                const newToken = data.accessToken;

                localStorage.setItem("token", newToken);
                setCookie("token", newToken, { maxAge: 60 * 60 * 24 * 7 }); // 7 days

                response = await fetch(`${API_URL}${endpoint}`, {
                    ...options,
                    headers: getHeaders(newToken),
                });
            } else {
                logout();
                throw new Error("Session expirée");
            }
        }

        if (!response.ok) {
            let errorMessage = "Une erreur est survenue";
            let errorData: ApiError = {};

            try {
                const text = await response.text();
                try {
                    errorData = JSON.parse(text);
                    errorMessage = errorData.error || errorData.message || errorData.text || errorMessage;
                } catch (e) {
                    errorMessage = text || errorMessage;
                }
            } catch (e) {
                // fall through
            }

            const error = new Error(errorMessage) as any;
            error.response = { data: errorData };
            throw error;
        }

        const responseText = await response.text();
        try {
            return JSON.parse(responseText) as T;
        } catch (e) {
            return { message: responseText } as unknown as T;
        }
    } catch (error) {
        console.error("API Fetch Error:", error);
        throw error;
    }
};

export const getUserRole = (): string | null => {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
        const decoded: JwtPayload = jwtDecode(token);
        return decoded.role;
    } catch (e) {
        return null;
    }
};

export const getUserFromToken = (): { username: string; role: string } | null => {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
        const decoded: JwtPayload = jwtDecode(token);
        return {
            username: decoded.sub,
            role: decoded.role,
        };
    } catch (e) {
        return null;
    }
};

export const isAdmin = () => getUserRole()?.toUpperCase().includes("ADMIN") || false;
export const isWebmaster = () => getUserRole()?.toUpperCase().includes("WEBMASTER") || false;
export const isInfoline = () => getUserRole()?.toUpperCase().includes("INFOLINE") || false;


export const register = async (data: any): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erreur lors de l'inscription");
    }

    return await response.json();
};

export const login = async (username: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
    });

    if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Identifiants invalides");
    }

    const data: AuthResponse = await response.json();
    if (typeof window !== "undefined") {
        localStorage.setItem("token", data.accessToken);
        setCookie("token", data.accessToken, { maxAge: 60 * 60 * 24 * 7 }); // 7 days
    }
    return data;
};

export const forgotPassword = async (identifier: string): Promise<MessageResponse> => {
    return apiFetch<MessageResponse>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ identifier }),
    });
};

export const resetPassword = async (token: string, password: string): Promise<MessageResponse> => {
    return apiFetch<MessageResponse>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
    });
};

export const logout = async (): Promise<void> => {
    if (typeof window !== "undefined") {
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: "POST",
                credentials: "include"
            });
        } catch (e) {
            console.error("Logout error:", e);
        }
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        deleteCookie("token");
        window.location.href = "/auth/sign-in";
    }
};
