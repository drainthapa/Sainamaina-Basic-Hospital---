import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const FILE_BASE_URL = import.meta.env.VITE_FILE_BASE_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: API_BASE_URL });

export function fileUrl(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `${FILE_BASE_URL}${path}`;
}

export const departmentsApi = {
  list: (params) => api.get('/departments', { params }),
  getBySlug: (slug) => api.get(`/departments/slug/${slug}`),
};

export const servicesApi = {
  list: (params) => api.get('/services', { params }),
  getBySlug: (slug) => api.get(`/services/slug/${slug}`),
};

export const staffApi = {
  list: (params) => api.get('/staff', { params }),
  getById: (id) => api.get(`/staff/${id}`),
};

export const newsApi = {
  list: (params) => api.get('/news', { params }),
  getBySlug: (slug) => api.get(`/news/slug/${slug}`),
};

export const downloadsApi = {
  list: (params) => api.get('/downloads', { params }),
  getById: (id) => api.get(`/downloads/${id}`),
  track: (id) => api.post(`/downloads/${id}/track`),
};

export const galleryApi = {
  listAlbums: (params) => api.get('/gallery/albums', { params }),
  getAlbum: (id) => api.get(`/gallery/albums/${id}`),
};

export const contentApi = {
  listPages: () => api.get('/content/pages'),
  getPage: (slug) => api.get(`/content/pages/${slug}`),
  listFaqs: () => api.get('/content/faqs'),
  getSettings: () => api.get('/content/settings'),
  listNewsCategories: (moduleType) => api.get('/content/news-categories', { params: { module_type: moduleType } }),
  listDownloadCategories: (docType) => api.get('/content/download-categories', { params: { doc_type: docType } }),
};

export const contactApi = {
  submit: (data) => api.post('/contact-submissions', data),
};

export default api;
