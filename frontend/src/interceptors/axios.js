// axiosInterceptor.js

import axios from 'axios';

// Function to update access token in localStorage and Axios headers
const updateAccessToken = (token) => {
  localStorage.setItem('access_token', token);
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Axios interceptor to update access token when response status is 401
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response.status === 401 && error.config && !error.config.__isRetryRequest) {
      // Handle token refresh or re-authentication here
      // For example, you can make a request to refresh token endpoint

      try {
        const response = await axios.post('http://localhost:8000/auth/token/refresh/', {
          refresh: localStorage.getItem('refresh_token')
        });
        
        // Update access token with the new token received from refresh endpoint
        updateAccessToken(response.data.access);

        // Retry the original request
        return axios(error.config);
      } catch (refreshError) {
        // Handle refresh token error
        console.error('Error refreshing token:', refreshError);
        // You may want to redirect the user to login page or show an error message
        // For example: window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Initialize access token in Axios headers
const accessToken = localStorage.getItem('access_token');
if (accessToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
}

// Export the updateAccessToken function for usage in components
export { updateAccessToken };
