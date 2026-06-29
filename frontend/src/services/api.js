import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('culinary_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('culinary_token');
      localStorage.removeItem('culinary_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  adminLogin: (data) => API.post('/auth/admin/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/change-password', data),
};

// Recipe APIs
export const recipeAPI = {
  getAll: (params) => API.get('/recipes', { params }),
  getFeatured: () => API.get('/recipes/featured'),
  getLatest: () => API.get('/recipes/latest'),
  getById: (id) => API.get(`/recipes/${id}`),
  create: (data) => API.post('/recipes', data),
  update: (id, data) => API.put(`/recipes/${id}`, data),
  delete: (id) => API.delete(`/recipes/${id}`),
  rate: (id, rating) => API.post(`/recipes/${id}/rate`, { rating }),
  toggleBookmark: (id) => API.post(`/recipes/${id}/bookmark`),
  getMyRecipes: (params) => API.get('/recipes/my-recipes', { params }),
  getBookmarked: () => API.get('/recipes/bookmarks'),
};

// Comment APIs
export const commentAPI = {
  add: (recipeId, data) => API.post(`/comments/recipe/${recipeId}`, data),
  update: (id, data) => API.put(`/comments/${id}`, data),
  delete: (id) => API.delete(`/comments/${id}`),
};

// Admin APIs
export const adminAPI = {
  getDashboard: () => API.get('/admin/dashboard'),
  getRecipes: (params) => API.get('/admin/recipes', { params }),
  approveRecipe: (id) => API.put(`/admin/recipes/${id}/approve`),
  rejectRecipe: (id, data) => API.put(`/admin/recipes/${id}/reject`, data),
  toggleFeatured: (id) => API.put(`/admin/recipes/${id}/featured`),
  getUsers: (params) => API.get('/admin/users', { params }),
  toggleBlockUser: (id) => API.put(`/admin/users/${id}/toggle-block`),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  getComments: () => API.get('/comments/admin/all'),
  deleteComment: (id) => API.delete(`/comments/${id}`),
};

export default API;
