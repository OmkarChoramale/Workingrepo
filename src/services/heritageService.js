import axios from 'axios';

// Base configuration pointing to your Gateway API
const API = axios.create({
    baseURL: 'http://localhost:8383/tourismgov/v1',
});

// Interceptor to inject Security Headers automatically for every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (token) config.headers.Authorization = `Bearer ${token}`;
    
    // Required by your Spring Boot @RequestHeader("X-User-Id")
    if (userId) config.headers['X-User-Id'] = userId; 
    
    return config;
});

/**
 * HERITAGE SITE MODULE 
 * Maps to HeritageSiteController.java
 */
export const siteService = {
    // GET /tourismgov/v1/sites
    getAll: () => API.get('/sites'),
    
    // GET /tourismgov/v1/sites/{siteId}
    getById: (siteId) => API.get(`/sites/${siteId}`),
    
    // POST /tourismgov/v1/sites (Restricted: ADMIN, OFFICER, MANAGER)
    create: (siteData) => API.post('/sites', siteData),
    
    // PUT /tourismgov/v1/sites/{siteId} (Restricted: ADMIN, OFFICER, MANAGER)
    update: (siteId, siteData) => API.put(`/sites/${siteId}`, siteData),
    
    // DELETE /tourismgov/v1/sites/{siteId} (Restricted: ADMIN)
    delete: (siteId) => API.delete(`/sites/${siteId}`)
};

/**
 * PRESERVATION ACTIVITY MODULE
 * Maps to PreservationActivityController.java
 */
export const preservationService = {
    // POST /tourismgov/v1/preservation/site/{siteId}
    logActivity: (siteId, activityData) => 
        API.post(`/preservation/site/${siteId}`, activityData),
    
    // PATCH /tourismgov/v1/preservation/{activityId}/status?status=COMPLETED
    updateStatus: (activityId, status) => 
        API.patch(`/preservation/${activityId}/status`, null, { params: { status } }),
    
    // GET /tourismgov/v1/preservation/{activityId}
    getDetails: (activityId) => API.get(`/preservation/${activityId}`),
    
    // GET /tourismgov/v1/preservation/site/{siteId}
    getBySite: (siteId) => API.get(`/preservation/site/${siteId}`),
    
    // GET /tourismgov/v1/preservation/officer/{officerId}
    getByOfficer: (officerId) => API.get(`/preservation/officer/${officerId}`),
    
    // DELETE /tourismgov/v1/preservation/{activityId}
    deleteActivity: (activityId) => API.delete(`/preservation/${activityId}`)
};

export default { siteService, preservationService };