import axios from 'axios';
import { API_URL } from '../config/constants';

console.log('API utility initialized with URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;

// API methods
export const creatorAPI = {
  getAll: () => api.get('/creators'),
  getByUsername: (username: string) => api.get(`/creators/username/${username}`),
  getByWallet: (walletAddress: string) => api.get(`/creators/wallet/${walletAddress}`),
  create: (data: any) => api.post('/creators', data),
  getDashboard: (walletAddress: string) => api.get(`/creators/${walletAddress}/dashboard`),
};

export const tipAPI = {
  create: (data: any) => api.post('/tips', data),
  getByCreator: (walletAddress: string) => api.get(`/tips/creator/${walletAddress}`),
  getByFan: (walletAddress: string) => api.get(`/tips/fan/${walletAddress}`),
};


export const transactionAPI = {
  getDetails: (signature: string) => api.get(`/transactions/${signature}`),
};

