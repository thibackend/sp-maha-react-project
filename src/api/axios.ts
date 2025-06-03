import axios from 'axios';

const api = axios.create({
  baseURL: 'https://maha-spa-api.hifiveplus.vn/', // Change this to your deployed server URL
  // baseURL: 'https://maha-spa-api.hifiveplus.vn/', // Change this to your deployed server URL
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Optional: Add interceptors
api.interceptors.request.use(
  (config) => {
    // Add token if available
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Handle errors (401, 500,...)
    console.error('API Error:', err);
    return Promise.reject(err);
  }
);

export default api;
