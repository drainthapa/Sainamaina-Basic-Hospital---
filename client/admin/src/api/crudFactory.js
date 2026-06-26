import api from './client';

/**
 * Builds a standard set of CRUD calls for a REST resource.
 * @param {string} basePath - e.g. '/departments'
 */
export function createCrudApi(basePath) {
  return {
    list: (params) => api.get(basePath, { params }),
    getById: (id) => api.get(`${basePath}/${id}`),
    create: (data) => api.post(basePath, data),
    update: (id, data) => api.put(`${basePath}/${id}`, data),
    remove: (id) => api.delete(`${basePath}/${id}`),
  };
}

export default api;
