import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.post('/auth/change-password', data),
};

// Business API
export const businessAPI = {
    getAll: (params) => api.get('/businesses', { params }),
    getOne: (uuid) => api.get(`/businesses/${uuid}`),
    create: (data) => api.post('/businesses', data),
    update: (uuid, data) => api.put(`/businesses/${uuid}`, data),
    delete: (uuid) => api.delete(`/businesses/${uuid}`),
    updateHours: (uuid, data) => api.put(`/businesses/${uuid}/hours`, data),
    addService: (uuid, data) => api.post(`/businesses/${uuid}/services`, data),
    updateService: (uuid, serviceId, data) => api.put(`/businesses/${uuid}/services/${serviceId}`, data),
    deleteService: (uuid, serviceId) => api.delete(`/businesses/${uuid}/services/${serviceId}`),
    getReviews: (uuid) => api.get(`/businesses/${uuid}/reviews`),
    addReview: (uuid, data) => api.post(`/businesses/${uuid}/reviews`, data),
    follow: (uuid) => api.post(`/businesses/${uuid}/follow`),
    unfollow: (uuid) => api.post(`/businesses/${uuid}/unfollow`),
};

// Business Management API (for business owners)
export const businessManagementAPI = {
    getMyBusiness: () => api.get('/my-business'),
    updateBusiness: (data) => api.put('/my-business', data),
    deleteBusiness: () => api.delete('/my-business'),
    getStatistics: () => api.get('/my-business/statistics'),

    // Services
    getServices: () => api.get('/my-business/services'),
    createService: (data) => api.post('/my-business/services', data),
    updateService: (uuid, data) => api.put(`/my-business/services/${uuid}`, data),
    deleteService: (uuid) => api.delete(`/my-business/services/${uuid}`),

    // Business Hours
    getBusinessHours: () => api.get('/my-business/hours'),
    updateBusinessHours: (data) => api.put('/my-business/hours', data),
};

// Video API
export const videoAPI = {
    getFeed: (params) => api.get('/videos/feed', { params }),
    getTrending: (params) => api.get('/videos/trending', { params }),
    search: (query, params) => api.get('/videos/search', { params: { q: query, ...params } }),
    getOne: (uuid) => api.get(`/videos/${uuid}`),
    getBusinessVideos: (businessUuid) => api.get(`/businesses/${businessUuid}/videos`),
    create: (data) => api.post('/videos', data),
    update: (uuid, data) => api.put(`/videos/${uuid}`, data),
    delete: (uuid) => api.delete(`/videos/${uuid}`),
    like: (uuid) => api.post(`/videos/${uuid}/like`),
    unlike: (uuid) => api.post(`/videos/${uuid}/unlike`),
    getComments: (uuid) => api.get(`/videos/${uuid}/comments`),
    addComment: (uuid, data) => api.post(`/videos/${uuid}/comments`, data),
    deleteComment: (uuid, commentId) => api.delete(`/videos/${uuid}/comments/${commentId}`),
    share: (uuid) => api.post(`/videos/${uuid}/share`),
};

// Product API
export const productAPI = {
    getAll: (params) => api.get('/v1/products', { params }),
    getOne: (uuid) => api.get(`/v1/products/${uuid}`),
    getByCategory: (slug, params) => api.get(`/v1/products/category/${slug}`, { params }),
    create: (data) => api.post('/v1/products', data),
    update: (uuid, data) => api.put(`/v1/products/${uuid}`, data),
    delete: (uuid) => api.delete(`/v1/products/${uuid}`),
    updateStock: (uuid, quantity) => api.put(`/v1/products/${uuid}/stock`, { quantity }),
};

// Cart API
export const cartAPI = {
    getCart: () => api.get('/v1/cart'),
    addItem: (productId, quantity = 1) => api.post('/v1/cart/items', { product_id: productId, quantity }),
    updateItem: (cartItemId, quantity) => api.put(`/v1/cart/items/${cartItemId}`, { quantity }),
    removeItem: (cartItemId) => api.delete(`/v1/cart/items/${cartItemId}`),
    clearCart: () => api.delete('/v1/cart/clear'),
    calculateTotals: (data) => api.post('/v1/cart/calculate', data),
};

// Order API
export const orderAPI = {
    getAll: (params) => api.get('/v1/orders', { params }),
    getOne: (orderNumber) => api.get(`/v1/orders/${orderNumber}`),
    checkout: (data) => api.post('/v1/checkout', data),
    updateStatus: (orderNumber, status) => api.put(`/v1/orders/${orderNumber}/status`, { status }),
    cancel: (orderNumber) => api.post(`/v1/orders/${orderNumber}/cancel`),
    getBusinessOrders: (params) => api.get('/v1/business/orders', { params }),
    getBusinessStats: () => api.get('/v1/business/orders/stats'),
};

// Search API
export const searchAPI = {
    globalSearch: (query, params) => api.get('/v1/search', { params: { q: query, ...params } }),
    searchBusinesses: (query, params) => api.get('/v1/search/businesses', { params: { q: query, ...params } }),
    searchVideos: (query, params) => api.get('/v1/search/videos', { params: { q: query, ...params } }),
    searchProducts: (query, params) => api.get('/v1/search/products', { params: { q: query, ...params } }),
    searchByHashtag: (hashtag, params) => api.get(`/v1/search/hashtag/${hashtag}`, { params }),
    autocomplete: (query, limit = 10) => api.get('/v1/search/autocomplete', { params: { q: query, limit } }),
    getTrending: (limit = 10) => api.get('/v1/search/trending', { params: { limit } }),
};

// File Upload API
export const uploadAPI = {
    uploadImage: (file, directory, options = {}) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('directory', directory);
        if (options.resize_width) formData.append('resize_width', options.resize_width);
        if (options.resize_height) formData.append('resize_height', options.resize_height);
        if (options.create_thumbnail !== undefined) formData.append('create_thumbnail', options.create_thumbnail ? '1' : '0');

        return api.post('/upload/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    uploadMultipleImages: (files, directory, options = {}) => {
        const formData = new FormData();
        files.forEach((file) => formData.append('files[]', file));
        formData.append('directory', directory);
        if (options.create_thumbnail) formData.append('create_thumbnail', options.create_thumbnail);

        return api.post('/upload/images', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    uploadVideo: (file, directory) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('directory', directory);

        return api.post('/upload/video', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    deleteFile: (path) => api.delete('/upload/file', { data: { path } }),
};

export default api;
