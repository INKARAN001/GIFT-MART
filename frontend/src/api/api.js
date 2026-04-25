import axios from 'axios';

// Spring Boot API: dev uses Vite proxy `/api`; production set VITE_API_BASE_URL (e.g. https://your-api.onrender.com/api)
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    headers: { 'Content-Type': 'application/json' },
});

// Auto-attach JWT token from localStorage on every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default api;
