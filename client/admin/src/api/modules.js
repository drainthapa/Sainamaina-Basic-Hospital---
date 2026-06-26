import api from './client';
import { createCrudApi } from './crudFactory';

export const departmentsApi = createCrudApi('/departments');

export const servicesApi = createCrudApi('/services');

export const staffApi = createCrudApi('/staff');

export const newsApi = {
  ...createCrudApi('/news'),
  getBySlug: (slug) => api.get(`/news/slug/${slug}`),
};

export const downloadsApi = createCrudApi('/downloads');

export const galleryApi = {
  listAlbums: (params) => api.get('/gallery/albums', { params }),
  getAlbum: (id) => api.get(`/gallery/albums/${id}`),
  createAlbum: (data) => api.post('/gallery/albums', data),
  updateAlbum: (id, data) => api.put(`/gallery/albums/${id}`, data),
  removeAlbum: (id) => api.delete(`/gallery/albums/${id}`),
  addMedia: (albumId, media) => api.post(`/gallery/albums/${albumId}/media`, { media }),
  removeMedia: (mediaId) => api.delete(`/gallery/media/${mediaId}`),
};

export const pagesApi = {
  list: () => api.get('/content/pages'),
  getBySlug: (slug) => api.get(`/content/pages/${slug}`),
  update: (slug, data) => api.put(`/content/pages/${slug}`, data),
};

export const faqsApi = {
  list: () => api.get('/content/faqs'),
  create: (data) => api.post('/content/faqs', data),
  update: (id, data) => api.put(`/content/faqs/${id}`, data),
  remove: (id) => api.delete(`/content/faqs/${id}`),
};

export const settingsApi = {
  getAll: () => api.get('/content/settings'),
  update: (key, value) => api.put(`/content/settings/${key}`, { value }),
};

export const categoriesApi = {
  listNewsCategories: (moduleType) => api.get('/content/news-categories', { params: { module_type: moduleType } }),
  createNewsCategory: (data) => api.post('/content/news-categories', data),
  listDownloadCategories: (docType) => api.get('/content/download-categories', { params: { doc_type: docType } }),
  createDownloadCategory: (data) => api.post('/content/download-categories', data),
};

export const uploadApi = {
  uploadFile: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
        ? (evt) => onProgress(Math.round((evt.loaded * 100) / evt.total))
        : undefined,
    });
  },
};

export const usersApi = {
  list: (params) => api.get('/users', { params }),
  listRoles: () => api.get('/users/roles'),
  create: (data) => api.post('/users', data),
  updateRole: (id, roleId) => api.put(`/users/${id}/role`, { roleId }),
  setActive: (id, isActive) => api.put(`/users/${id}/active`, { isActive }),
  remove: (id) => api.delete(`/users/${id}`),
};
