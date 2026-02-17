import { jwtDecode } from "jwt-decode";
import { setCookie, deleteCookie, getCookie } from "cookies-next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8089";

interface JwtPayload {
    sub: string;
    role: string;
    exp: number;
}

/**
 * Enhanced fetch wrapper with automatic token refresh
 */
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    let token: string | null = null;

    if (typeof window !== "undefined") {
        token = localStorage.getItem("token");
    } else {
        // Server-side: Try to get token from cookies
        try {
            // Dynamically import next/headers to avoid client-side bundling errors
            const { cookies } = await import("next/headers");
            const cookieStore = await cookies();
            token = cookieStore.get("token")?.value || null;
        } catch (e) {
            console.error("Could not access cookies in Server Component:", e);
        }
    }

    const getHeaders = (t: string | null) => ({
        "Content-Type": "application/json",
        ...(t ? { "Authorization": `Bearer ${t}` } : {}),
        ...options.headers,
    });

    try {
        let response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: getHeaders(token),
        });

        // Handle Token Expiration (401)
        if (response.status === 401 && !endpoint.includes("/auth/refresh")) {
            // Only attempt refresh on the client.
            // On the server, we don't have access to HttpOnly refresh cookies for the refresh call.
            if (typeof window === "undefined") {
                throw new Error("Authentification requise");
            }

            console.log("Token expiré, tentative de rafraîchissement...");

            // Try to refresh using the HttpOnly cookie (handled by browser)
            const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // credentials: "include" is crucial for sending/receiving HttpOnly cookies
                credentials: "include" as any,
            });

            if (refreshRes.ok) {
                const data = await refreshRes.json();
                const newToken = data.accessToken;

                localStorage.setItem("token", newToken);
                setCookie("token", newToken, { maxAge: 60 * 60 * 24 * 7 }); // 7 days

                // Retry original request with new token
                response = await fetch(`${API_URL}${endpoint}`, {
                    ...options,
                    headers: getHeaders(newToken),
                });
            } else {
                // Refresh failed, logout
                logout();
                throw new Error("Session expirée");
            }
        }

        if (!response.ok) {
            let errorMessage = "Une erreur est survenue";
            let errorData = {};

            try {
                const text = await response.text();
                try {
                    errorData = JSON.parse(text);
                    errorMessage = (errorData as any).error || (errorData as any).message || (errorData as any).text || errorMessage;
                } catch (e) {
                    errorMessage = text || errorMessage;
                }
            } catch (e) {
                // fall through to default message
            }

            const error: any = new Error(errorMessage);
            error.response = { data: errorData };
            throw error;
        }

        const responseText = await response.text();
        try {
            return JSON.parse(responseText);
        } catch (e) {
            return { message: responseText };
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


export const login = async (username: string, password: string): Promise<any> => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include" as any, // Important for receiving HttpOnly cookies
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Identifiants invalides");
    }

    const data = await response.json();
    if (typeof window !== "undefined") {
        localStorage.setItem("token", data.accessToken);
        setCookie("token", data.accessToken, { maxAge: 60 * 60 * 24 * 7 }); // 7 days
    }
    return data;
};

export const forgotPassword = async (identifier: string): Promise<any> => {
    return apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ identifier }),
    });
};

export const resetPassword = async (token: string, password: string): Promise<any> => {
    return apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
    });
};

export const logout = async () => {
    if (typeof window !== "undefined") {
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: "POST",
                credentials: "include" as any
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
