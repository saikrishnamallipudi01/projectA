import axios from 'axios';

const getBaseURL = () => {
    // If running on localhost, prefer VITE_API_URL or default to local 5000
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    }
    
    // If running on a remote server (deployment)
    if (typeof window !== 'undefined') {
        const p = window.location.protocol;
        const h = window.location.hostname;
        
        // Check if there's a specific production URL set in VITE_API_URL that ISN'T localhost
        if (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost')) {
            return import.meta.env.VITE_API_URL;
        }

        // Default to same host with /api prefix (typical Nginx setup)
        return `${p}//${h}/api`;
    }
    
    return 'http://localhost:5000/api';
};

const api = axios.create({
    baseURL: getBaseURL(),
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('atnis_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default api;
