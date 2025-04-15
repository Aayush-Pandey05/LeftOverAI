import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:9000/api',
  withCredentials: true, // Keep this for cookie support
  timeout: 30000,
});

// Add a more robust interceptor with error logging
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    
    if (token) {
      console.log('Adding token to request headers');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('No token found in localStorage');
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for debugging
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error Response:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);