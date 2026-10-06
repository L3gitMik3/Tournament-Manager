// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// ALL API FUNCTIONS - WITH /api PREFIX
// ============================================

export const auth = {
  signup: (data) => api.post('/api/auth/signup', data),
  login: (data) => api.post('/api/auth/signin', data),
  adminLogin: (password) => api.post('/api/admin/login', { password }),
};

export const tournaments = {
  getAll: () => api.get('/api/tournaments'),
  get: (id) => api.get(`/api/tournaments/${id}`),
  getForManagement: (id) => api.get(`/api/tournaments/${id}/manage`),
  create: (data) => api.post('/api/tournaments', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, data) => api.put(`/api/tournaments/${id}`, data),
  delete: (id) => api.delete(`/api/tournaments/${id}`),
  getStats: (id) => api.get(`/api/tournaments/${id}/stats`),
  getMyTournaments: () => api.get('/api/admin/my-tournaments'),
};

export const categories = {
  get: (tournamentId) => api.get(`/api/categories/${tournamentId}`),
  generateGroupStage: (categoryId) => api.post(`/api/categories/${categoryId}/group-stage/generate`),
  getBracket: (categoryId) => api.get(`/api/categories/${categoryId}/bracket`),
  generateBracket: (categoryId, qualifiersPerPool = 2) => api.post(`/api/categories/${categoryId}/bracket/generate`, {
    qualifiers_per_pool: qualifiersPerPool,
  }),
  resetBracket: (categoryId) => api.post(`/api/categories/${categoryId}/bracket/reset`),
  create: (data) => api.post('/api/categories', data),
  update: (id, data) => api.put(`/api/categories/${id}`, data),
  delete: (id) => api.delete(`/api/categories/${id}`),
};

export const teams = {
  get: (categoryId) => api.get(`/api/teams/${categoryId}`),
  create: (data) => api.post('/api/teams', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, data) => api.put(`/api/teams/${id}`, data),
  delete: (id) => api.delete(`/api/teams/${id}`),
};

export const matches = {
  get: (params) => api.get('/api/matches', { params }),
  getToday: (tournamentId) => api.get('/api/matches/today', { params: { tournament_id: tournamentId } }),
  getOne: (id, tournamentId) => api.get(`/api/matches/${id}`, { params: { tournament_id: tournamentId } }),
  create: (data) => api.post('/api/matches', data),
  update: (id, data) => api.put(`/api/matches/${id}`, data),
  complete: (id, scores) => api.post(`/api/matches/${id}/complete`, scores),
  delete: (id) => api.delete(`/api/matches/${id}`),
};

export const standings = {
  get: (categoryId) => api.get(`/api/standings/${categoryId}`),
  recalculate: (categoryId) => api.post(`/api/standings/recalculate/${categoryId}`),
};

export const gallery = {
  get: (params) => api.get('/api/gallery', { params }),
  add: (data) => api.post('/api/gallery', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/api/gallery/${id}`),
};

export const uploadGallery = (file, payload = {}) => {
  const formData = new FormData();
  if (file) formData.append('image', file);
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      formData.append(key, value);
    }
  });

  return api.post('/api/gallery', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const registrations = {
  getAll: () => api.get('/api/admin/registrations'),
  create: (data) => api.post('/api/kaizen', data),
};

// ============================================
// ✅ NEW: UPLOAD SERVICE
// ============================================

export const upload = {
  /**
   * Upload a logo for a tournament or team
   * @param {string} type - 'tournament' or 'team'
   * @param {number|string} itemId - ID of the tournament or team
   * @param {File} file - The image file to upload
   * @returns {Promise} - Axios promise
   */
  logo: (type, itemId, file) => {
    const formData = new FormData();
    formData.append('logo', file);
    formData.append('type', type);
    formData.append('item_id', itemId);
    
    return api.post('/api/upload/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;