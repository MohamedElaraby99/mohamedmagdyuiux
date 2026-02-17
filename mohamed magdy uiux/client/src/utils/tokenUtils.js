// Token management utilities
import store from '../Redux/store';
import { clearAllUserData } from '../Redux/Slices/AuthSlice';

/**
 * Get token expiration information from Redux state
 */
export const getTokenInfo = () => {
  try {
    const state = store.getState();
    return state.auth?.tokenInfo || null;
  } catch (error) {
    return null;
  }
};

/**
 * Check if access token is expired or will expire soon (within 2 minutes)
 */
export const isAccessTokenExpired = () => {
  const tokenInfo = getTokenInfo();
  if (!tokenInfo?.accessTokenExpiresIn) return false; // Don't consider expired if no token info

  // Convert expiration string to timestamp
  const expirationTime = Date.now() + parseTokenExpiration(tokenInfo.accessTokenExpiresIn);
  const currentTime = Date.now();
  const twoMinutes = 2 * 60 * 1000; // 2 minutes in milliseconds

  return (expirationTime - currentTime) < twoMinutes;
};

/**
 * Check if refresh token is expired or will expire soon (within 1 hour)
 */
export const isRefreshTokenExpired = () => {
  const tokenInfo = getTokenInfo();
  if (!tokenInfo?.refreshTokenExpiresIn) return false; // Don't logout if no token info

  // Convert expiration string to timestamp
  const expirationTime = Date.now() + parseTokenExpiration(tokenInfo.refreshTokenExpiresIn);
  const currentTime = Date.now();
  const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

  return (expirationTime - currentTime) < oneHour;
};

/**
 * Parse token expiration string (e.g., "15m", "7d") to milliseconds
 */
export const parseTokenExpiration = (expirationString) => {
  const unit = expirationString.slice(-1);
  const value = parseInt(expirationString.slice(0, -1));

  switch (unit) {
    case 's': return value * 1000; // seconds
    case 'm': return value * 60 * 1000; // minutes
    case 'h': return value * 60 * 60 * 1000; // hours
    case 'd': return value * 24 * 60 * 60 * 1000; // days
    case 'w': return value * 7 * 24 * 60 * 60 * 1000; // weeks
    default: return value * 1000; // default to seconds
  }
};

/**
 * Format time remaining until expiration
 */
export const formatTimeRemaining = (expirationString) => {
  const milliseconds = parseTokenExpiration(expirationString);
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} يوم`;
  if (hours > 0) return `${hours} ساعة`;
  if (minutes > 0) return `${minutes} دقيقة`;
  return `${seconds} ثانية`;
};

/**
 * Clear all tokens and user data (logout)
 */
export const clearTokens = () => {
  // Clear cookies
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

  // Clear Redux state
  store.dispatch(clearAllUserData());

  // Redirect to login if not already there
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

/**
 * Check if user is authenticated (has valid tokens)
 */
export const isAuthenticated = () => {
  try {
    const state = store.getState();
    return state.auth?.isLoggedIn && !isRefreshTokenExpired();
  } catch (error) {
    return false;
  }
};

/**
 * Get remaining time for access token
 */
export const getAccessTokenRemainingTime = () => {
  const tokenInfo = getTokenInfo();
  if (!tokenInfo?.accessTokenExpiresIn) return 0;

  const expirationTime = Date.now() + parseTokenExpiration(tokenInfo.accessTokenExpiresIn);
  return Math.max(0, expirationTime - Date.now());
};

/**
 * Get remaining time for refresh token
 */
export const getRefreshTokenRemainingTime = () => {
  const tokenInfo = getTokenInfo();
  if (!tokenInfo?.refreshTokenExpiresIn) return 0;

  const expirationTime = Date.now() + parseTokenExpiration(tokenInfo.refreshTokenExpiresIn);
  return Math.max(0, expirationTime - Date.now());
};
