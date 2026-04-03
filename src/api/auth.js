import axiosInstance from '../utils/axiosInstance';

export const registerAPI = (data) => axiosInstance.post('/api/auth/register', data);
export const loginAPI = (data) => axiosInstance.post('/api/auth/login', data);
export const getMeAPI = () => axiosInstance.get('/api/auth/me');
export const updateMeAPI = (data) => axiosInstance.put('/api/auth/me', data);
export const deleteMeAPI = () => axiosInstance.delete('/api/auth/me');
