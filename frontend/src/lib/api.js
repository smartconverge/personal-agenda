import axios from 'axios';

// Força a URL da API de produção, ou usa variável de ambiente e fallback local
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.smartconverge.com.br';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Importante para enviar cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para adicionar token (Removido - agora usa Cookies HttpOnly)
// api.interceptors.request.use((config) => { ... });

// Interceptor para tratar erros
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
