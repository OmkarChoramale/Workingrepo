import axios from 'axios';

const API_BASE_URL = 'http://localhost:8383';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
}, (error) => Promise.reject(error));

// ─── NOTIFICATION API ────────────────────────────────────────────────────────
export const notificationApi = {
    getAll: () => api.get('/tourismgov/v1/notifications'),
    getUnread: () => api.get('/tourismgov/v1/notifications/unread'),
    getByCategory: (category) => api.get(`/tourismgov/v1/notifications/category/${category}`),
    markAsRead: (id) => api.patch(`/tourismgov/v1/notifications/${id}/read`),
    markAllAsRead: () => api.patch('/tourismgov/v1/notifications/read-all'),
    create: (data) => api.post('/tourismgov/v1/notifications', data),
    broadcast: (data) => api.post('/tourismgov/v1/notifications/broadcast', data)
};

// ─── DASHBOARD API ────────────────────────────────────────────────────────────
export const dashboardApi = {
    getStats: () => api.get('/tourismgov/v1/dashboard/stats')
};

// ─── REPORT API ───────────────────────────────────────────────────────────────
export const reportApi = {
    generate: (data) => api.post('/tourismgov/v1/reports/generate', data),
    getHistory: (params) => api.get('/tourismgov/v1/reports/history', { params }),
    download: (id) => api.get(`/tourismgov/v1/reports/download/${id}`, { responseType: 'blob' })
};

// ─── HERITAGE SITES API ───────────────────────────────────────────────────────
export const siteApi = {
    getAll: () => api.get('/tourismgov/v1/sites'),
    getById: (id) => api.get(`/tourismgov/v1/sites/${id}`),
    create: (data) => api.post('/tourismgov/v1/sites', data),
    update: (id, data) => api.put(`/tourismgov/v1/sites/${id}`, data),
    delete: (id) => api.delete(`/tourismgov/v1/sites/${id}`)
};

// ─── EVENTS API ───────────────────────────────────────────────────────────────
export const eventApi = {
    getAll: () => api.get('/tourismgov/v1/events'),
    getById: (id) => api.get(`/tourismgov/v1/events/${id}`),
    getBySite: (siteId) => api.get(`/tourismgov/v1/events/site/${siteId}`),
    getByProgram: (programId) => api.get(`/tourismgov/v1/events/program/${programId}`),
    getPaged: (params) => api.get('/tourismgov/v1/events/paged', { params }),
    create: (data) => api.post('/tourismgov/v1/events', data),
    update: (id, data) => api.put(`/tourismgov/v1/events/${id}`, data),
    updateStatus: (id, data) => api.patch(`/tourismgov/v1/events/${id}/status`, data),
    delete: (id) => api.delete(`/tourismgov/v1/events/${id}`)
};

// ─── BOOKINGS API ─────────────────────────────────────────────────────────────
export const bookingApi = {
    create: (eventId, data) => api.post(`/tourismgov/v1/events/${eventId}/bookings`, data),
    getById: (id) => api.get(`/tourismgov/v1/bookings/${id}`),
    getByEvent: (eventId) => api.get(`/tourismgov/v1/events/${eventId}/bookings`),
    getByTourist: (touristId) => api.get(`/tourismgov/v1/bookings/tourist/${touristId}`),
    updateStatus: (id, data) => api.patch(`/tourismgov/v1/bookings/${id}/status`, data),
    getAllPaged: (params) => api.get('/tourismgov/v1/bookings/paged', { params })
};

// ─── PROGRAMS API ─────────────────────────────────────────────────────────────
export const programApi = {
    getAll: () => api.get('/tourismgov/v1/programs'),
    getById: (id) => api.get(`/tourismgov/v1/programs/${id}`),
    getPaged: (params) => api.get('/tourismgov/v1/programs/paged', { params }),
    create: (data) => api.post('/tourismgov/v1/programs', data),
    update: (id, data) => api.put(`/tourismgov/v1/programs/${id}`, data),
    updateStatus: (id, status) => api.patch(`/tourismgov/v1/programs/${id}/status`, null, { params: { status } }),
    delete: (id) => api.delete(`/tourismgov/v1/programs/${id}`),
    getBudgetReport: (id) => api.get(`/tourismgov/v1/programs/${id}/budget-report`)
};

// ─── COMPLIANCE API ───────────────────────────────────────────────────────────
export const complianceApi = {
    getAll: (params) => api.get('/tourismgov/v1/compliance/records', { params }),
    getById: (id) => api.get(`/tourismgov/v1/compliance/records/${id}`),
    create: (data) => api.post('/tourismgov/v1/compliance/records', data),
    updateResult: (id, result) => api.patch(`/tourismgov/v1/compliance/records/${id}/result`, null, { params: { result } }),
    delete: (id) => api.delete(`/tourismgov/v1/compliance/records/${id}`)
};

// ─── AUTH API ─────────────────────────────────────────────────────────────────
export const authApi = {
    login: (data) => api.post('/tourismgov/v1/auth/login', data),
    register: (data) => api.post('/tourismgov/v1/auth/register', data)
};

export default api;