import axios, { AxiosInstance } from 'axios';
import { AuthResponse } from '@/types/auth';

const api: AxiosInstance = axios.create({
    baseURL: 'http://localhost:8000/api', // URL de l’API Laravel
    headers: {
        'Content-Type': 'application/json',
    },
});

export const loginRequest = (email: string, password: string): Promise<AuthResponse> =>
    api.post('/auth/login', { email, password }).then((res) => res.data);

export const registerRequest = (
    first_name: string,
    last_name: string,
    email: string,
    password: string
): Promise<AuthResponse> =>
    api.post('/auth/register', { first_name, last_name, email, password }).then((res) => res.data);

export const logoutRequest = (token: string): Promise<void> =>
    api.post('/auth/logout', {}, { headers: { Authorization: `Bearer ${token}` } });

export const refreshRequest = (token: string): Promise<AuthResponse> =>
    api.post('/auth/refresh', {}, { headers: { Authorization: `Bearer ${token}` } }).then((res) => res.data);