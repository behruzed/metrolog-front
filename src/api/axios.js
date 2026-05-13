import axios from 'axios';
import useAuthStore from '../store/authStore';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Add Interceptor to attach both tokens to the request
instance.interceptors.request.use(
  (config) => {
    const { stationToken, employeeToken } = useAuthStore.getState();

    let authHeader = '';
    if (stationToken) {
      authHeader += `Bearer Station ${stationToken}`;
    }
    if (employeeToken) {
      authHeader += ` Bearer Employee ${employeeToken}`;
    }

    if (authHeader) {
      config.headers.Authorization = authHeader.trim();
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor to handle expired tokens
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const { logoutEmployee, logoutStation } = useAuthStore.getState();
      const message = error.response.data?.message?.toLowerCase() || '';

      if (message.includes('jwt expired') || message.includes('unauthorized')) {
        if (message.includes('employee')) {
          logoutEmployee();
          window.location.href = '/employee-login';
        } else if (message.includes('station')) {
          logoutStation();
          window.location.href = '/station-login';
        } else {
          // Default to employee logout if unsure
          logoutEmployee();
          window.location.href = '/employee-login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
