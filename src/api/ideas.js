import axiosInstance from '../utils/axiosInstance';

export const getIdeasAPI = (params) => axiosInstance.get('/api/ideas', { params });
export const getIdeaAPI = (id) => axiosInstance.get(`/api/ideas/${id}`);
export const createIdeaAPI = (data) => axiosInstance.post('/api/ideas', data);
export const updateIdeaAPI = (id, data) => axiosInstance.put(`/api/ideas/${id}`, data);
export const deleteIdeaAPI = (id) => axiosInstance.delete(`/api/ideas/${id}`);
export const connectIdeasAPI = (id, targetId) => axiosInstance.post(`/api/ideas/${id}/connect`, { targetId });
export const disconnectIdeasAPI = (id, targetId) => axiosInstance.delete(`/api/ideas/${id}/connect/${targetId}`);
export const updatePositionAPI = (id, x, y) => axiosInstance.put(`/api/ideas/${id}/position`, { x, y });
