import axiosInstance from '../utils/axiosInstance';

export const analyzeAPI = (data) => axiosInstance.post('/api/ai/analyze', data);
export const connectAIAPI = (data) => axiosInstance.post('/api/ai/connect', data);
export const compareAPI = (data) => axiosInstance.post('/api/ai/compare', data);
export const summaryAPI = () => axiosInstance.post('/api/ai/summary');
export const discoverAPI = () => axiosInstance.post('/api/ai/discover');
