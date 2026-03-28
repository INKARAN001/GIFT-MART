import axios from 'axios';

// Axios instance pointing to the Spring Boot API
const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
});

// Auto-attach JWT token from localStorage on every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default api;
