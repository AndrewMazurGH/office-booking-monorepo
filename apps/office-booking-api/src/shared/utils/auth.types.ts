export interface JwtPayload {
    id: string;
    email: string;
    role?: string;
}

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
}

// Optional: Add a type for the authenticated user data
export interface AuthenticatedUser {
    id: string;
    email: string;
    role?: string;
}