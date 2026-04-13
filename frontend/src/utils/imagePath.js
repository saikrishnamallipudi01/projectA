import api from '../api/axiosInstance';

/**
 * Resolves an image path to a full URL.
 * If the path starts with 'http', it's returned as-is.
 * If it's a local path (starts with /uploads), it's prepended with the backend base URL.
 * If null/empty, returns a placeholder.
 */
export const resolveImagePath = (path, placeholder = 'https://images.unsplash.com/photo-1542626991-cbc4e32524cc?q=80&w=600') => {
    if (!path) return placeholder;
    if (path.startsWith('http')) return path;
    
    // Get base URL from axios instance and remove the /api suffix
    const baseUrl = api.defaults.baseURL.replace('/api', '');
    return `${baseUrl}${path}`;
};
