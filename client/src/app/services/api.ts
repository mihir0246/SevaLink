/// <reference types="vite/client" />
import axios from 'axios';

const BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5001/api';

// ── Axios instance with JWT auto-injection ────────────────────────────────────
const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sevalink_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sevalink_token');
      localStorage.removeItem('sevalink_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: any) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  getUsers: () => api.get('/auth/users'),
};

// ── Volunteers ────────────────────────────────────────────────────────────────
export const volunteersAPI = {
  getAll: (params?: any) => api.get('/volunteers', { params }),
  getMe: () => api.get('/volunteers/me'),
  getOne: (id: string) => api.get(`/volunteers/${id}`),
  getStats: () => api.get('/volunteers/stats/summary'),
  create: (data: any) => api.post('/volunteers', data),
  update: (id: string, data: any) => api.patch(`/volunteers/${id}`, data),
  toggleActive: (id: string) => api.patch(`/volunteers/${id}/toggle-active`),
};

// ── Recipients (Community Needs) ──────────────────────────────────────────────
export const recipientsAPI = {
  getAll: (params?: any) => api.get('/recipients', { params }),
  getStats: () => api.get('/recipients/stats'),
  create: (data: any) => api.post('/recipients', data),
  update: (id: string, data: any) => api.patch(`/recipients/${id}`, data),
  delete: (id: string) => api.delete(`/recipients/${id}`),
};

// ── Actions (Volunteer Assignments) ──────────────────────────────────────────
export const actionsAPI = {
  getAll: (params?: any) => api.get('/actions', { params }),
  getStats: () => api.get('/actions/stats'),
  getOne: (id: string) => api.get(`/actions/${id}`),
  updateStatus: (id: string, status: string) =>
    api.patch(`/actions/${id}/status`, { status }),
  verify: (id: string) => api.post(`/actions/${id}/verify`),
  create: (data: any) => api.post('/actions', data),
};

// ── Matchmaking (Gemini AI) ───────────────────────────────────────────────────
export const matchmakingAPI = {
  assign: () => api.post('/matchmaking/assign'),
  getPlans: () => api.get('/matchmaking/plans'),
  getCandidates: (recipientId: string) =>
    api.get(`/matchmaking/candidates/${recipientId}`),
};

// ── Products / Distribution Centres ──────────────────────────────────────────
export const productsAPI = {
  getAll: () => api.get('/products'),
  update: (id: string, data: any) => api.patch(`/products/${id}`, data),
};

export const centresAPI = {
  getAll: () => api.get('/distribution-centres'),
};

// ── Surveys (AI Extraction) ──────────────────────────────────────────────────
export const surveysAPI = {
  extract: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/surveys/extract', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  confirm: (data: any) => api.post('/surveys/confirm', data),
};

// ── Reports (Analytics) ──────────────────────────────────────────────────────
export const reportsAPI = {
  getSummary: (params?: { timeRange?: string }) => api.get('/reports/summary', { params }),
  getAISummary: () => api.get('/reports/ai-summary'),
};

// ── Auth helpers ──────────────────────────────────────────────────────────────
export function saveAuth(token: string, user: any) {
  localStorage.setItem('sevalink_token', token);
  localStorage.setItem('sevalink_user', JSON.stringify(user));
}

export function getStoredUser(): any | null {
  const raw = localStorage.getItem('sevalink_user');
  return raw ? JSON.parse(raw) : null;
}

export function logout() {
  localStorage.removeItem('sevalink_token');
  localStorage.removeItem('sevalink_user');
}

export default api;
