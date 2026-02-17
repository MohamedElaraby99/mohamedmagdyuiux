import axios from 'axios';

// Token refresh utility
let isRefreshing = false;
let failedQueue = [];

// Callback to notify auth context of token refresh results
let authRefreshCallback = null;

export const setAuthRefreshCallback = (callback) => {
    authRefreshCallback = callback;
};

const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });
    failedQueue = [];
};

// Determine base URL based on environment
const getBaseUrl = () => {
    // Check for environment variable first
    if (import.meta.env.VITE_REACT_APP_API_URL) {
        return import.meta.env.VITE_REACT_APP_API_URL;
    }

    // For development, always use localhost
    if (import.meta.env.DEV ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.port === '5173' ||
        window.location.port === '5190') {
        return 'http://localhost:4095/api/v1';
    }

    // Production fallback
    return 'https://api.magdyacademy.com/api/v1';
};

const BASE_URL = getBaseUrl();

// Create axios instance with proper CORS configuration
export const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // Keep this for authentication
    timeout: 30000, // 30 second timeout
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add request interceptor to include device info in headers for cross-domain requests
axiosInstance.interceptors.request.use(
    (config) => {
        // Add device info to headers for cross-domain requests
        if (!import.meta.env.DEV && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            try {
                // Generate basic device info for cross-domain requests
                const deviceInfo = {
                    platform: navigator.platform || 'unknown',
                    screenResolution: `${screen.width}x${screen.height}`,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    userAgent: navigator.userAgent
                };

                config.headers['x-device-info'] = JSON.stringify(deviceInfo);
            } catch (error) {

            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for better error handling and token refresh
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle device authorization errors
        if (error.response?.status === 403 && error.response?.data?.message?.includes('DEVICE_NOT_AUTHORIZED')) {
            // You could redirect to login or show a device authorization message
            return Promise.reject(error);
        }

        // Handle token expiration (401 errors) - DON'T LOGOUT, just try to refresh silently
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return axiosInstance(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Attempt to refresh the token

                const response = await axiosInstance.post('/users/refresh-token');

                if (response.data.success) {

                    // Notify auth context about successful token refresh
                    if (authRefreshCallback) {
                        authRefreshCallback('success', response.data.tokens);
                    }

                    // Process queued requests
                    processQueue(null, response.data.tokens?.accessToken);

                    // Retry the original request
                    return axiosInstance(originalRequest);
                } else {
                    throw new Error('Token refresh failed');
                }
            } catch (refreshError) {
                // DON'T call authRefreshCallback with 'failed' - this was causing logout
                // Just log the error and continue without logging out the user

                // Process queued requests with error
                processQueue(refreshError, null);

                // Just reject the request without triggering logout
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);