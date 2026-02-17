import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { axiosInstance, setAuthRefreshCallback } from '../Helpers/axiosInstance';
import { login, logout, getUserData, syncFromLocalStorage, updateTokens } from '../Redux/Slices/AuthSlice';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { isLoggedIn, role, data } = useSelector((state) => state.auth);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Set up token refresh callback
  useEffect(() => {
    const handleTokenRefresh = (status, tokens) => {
      if (status === 'success' && tokens) {
        dispatch(updateTokens(tokens));
        toast.success('تم تجديد الجلسة بنجاح');
      }
      // Don't logout on failed - handled elsewhere
    };

    setAuthRefreshCallback(handleTokenRefresh);

    return () => {
      setAuthRefreshCallback(null);
    };
  }, [dispatch, updateTokens]);

  // Initialize authentication state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Sync from localStorage first
        dispatch(syncFromLocalStorage());

        // Check if user has valid tokens by trying to fetch user data
        if (isLoggedIn) {
          try {
            await dispatch(getUserData()).unwrap();
          } catch (error) {
            // DON'T LOGOUT on any error - just continue with cached data
          }
        }
      } catch (error) {
        // Still don't logout - just continue
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [dispatch]);

  // Keep session alive: periodically refresh tokens in background
  useEffect(() => {
    let intervalId;
    if (isLoggedIn) {
      // Refresh every 10 minutes to keep access token valid
      intervalId = setInterval(async () => {
        try {
          await axiosInstance.post('/users/refresh-token');
        } catch (e) {
          // Silently fail - don't logout
        }
      }, 10 * 60 * 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLoggedIn]);

  // Handle token refresh attempts
  const attemptTokenRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await dispatch(getUserData()).unwrap();
      toast.success('تم تجديد الجلسة بنجاح');
      return true;
    } catch (refreshError) {
      // DON'T LOGOUT - just silently fail
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };

  // Enhanced logout function
  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      toast.success('تم تسجيل الخروج بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء تسجيل الخروج');
    }
  };

  const value = {
    isLoggedIn,
    role,
    user: data,
    isInitialized,
    isRefreshing,
    logout: handleLogout,
    refreshAuth: attemptTokenRefresh,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
