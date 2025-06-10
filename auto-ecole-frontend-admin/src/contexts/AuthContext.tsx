'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType } from '@/types/auth';
import { loginRequest, registerRequest, logoutRequest, refreshRequest } from '@/lib/api';
import { useRouter } from 'next/navigation';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    useEffect(() => {
        const storedToken = localStorage.getItem('token'); // Compatibilité avec l’ancien code
        if (storedToken) {
            setToken(storedToken);
            document.cookie = `token=${storedToken}; path=/; max-age=86400`; // Stocke dans les cookies
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const { access_token } = await loginRequest(email, password);
            setToken(access_token);
            localStorage.setItem('token', access_token); // Optionnel
            document.cookie = `token=${access_token}; path=/; max-age=86400`; // 7 jours
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    };

    const register = async (
        first_name: string,
        last_name: string,
        email: string,
        password: string
    ): Promise<boolean> => {
        try {
            const { access_token } = await registerRequest(first_name, last_name, email, password);
            setToken(access_token);
            localStorage.setItem('token', access_token); // Optionnel
            document.cookie = `token=${access_token}; path=/; max-age=86400`; // 1 heure
            return true;
        } catch (error) {
            console.error('Register failed:', error);
            return false;
        }
    };

    const logout = async (): Promise<void> => {
        if (!token) return;
        try {
            await logoutRequest(token);
            setToken(null);
            localStorage.removeItem('token'); // Optionnel
            document.cookie = 'token=; path=/; max-age=0'; // Supprime le cookie
            router.push('/signin');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const refreshToken = async (): Promise<string | null> => {
        if (!token) return null;
        try {
            const { access_token } = await refreshRequest(token);
            setToken(access_token);
            localStorage.setItem('token', access_token); // Optionnel
            document.cookie = `token=${access_token}; path=/; max-age=86400`;
            return access_token;
        } catch (error) {
            console.error('Refresh failed:', error);
            logout();
            return null;
        }
    };

    const value: AuthContextType = { token, login, register, logout, refreshToken, loading };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};