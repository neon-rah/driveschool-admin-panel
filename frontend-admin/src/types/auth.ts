export interface AuthResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

export interface AuthContextType {
    token: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    register: (first_name: string, last_name: string, email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<string | null>;
    loading: boolean;
}