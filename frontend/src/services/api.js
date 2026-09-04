import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message =
        error.response.data?.message || 'Something went wrong. Please try again.';
      const apiError = new Error(message);
      apiError.status = error.response.status;
      apiError.isApiError = true;
      throw apiError;
    }

    if (error.code === 'ECONNABORTED') {
      const apiError = new Error('Request timed out. Please check your connection.');
      apiError.status = 0;
      apiError.isNetworkError = true;
      throw apiError;
    }

    const apiError = new Error(
      'Unable to connect to the server. Please ensure the backend is running.'
    );
    apiError.status = 0;
    apiError.isNetworkError = true;
    throw apiError;
  }
);

export default api;
