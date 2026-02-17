import React, { useState, useEffect } from 'react';
import { FaClock, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { getAccessTokenRemainingTime, formatTimeRemaining, clearTokens } from '../utils/tokenUtils';

const TokenExpirationWarning = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState('');
  const isLoggedIn = useSelector(state => state.auth.isLoggedIn);

  // Don't show warning on login/signup pages
  const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/signup';

  useEffect(() => {
    if (!isLoggedIn || isAuthPage) {
      setShowWarning(false);
      return;
    }

    const checkTokenExpiration = () => {
      try {
        const timeRemaining = getAccessTokenRemainingTime();

        if (timeRemaining === 0 || timeRemaining === null) {
          setShowWarning(false);
          return;
        }

        // Show warning if token expires in less than 5 minutes
        if (timeRemaining < 5 * 60 * 1000) { // 5 minutes
          setShowWarning(true);
          setRemainingTime(formatTimeRemaining('5m'));
        } else {
          setShowWarning(false);
        }
      } catch (error) {
        setShowWarning(false);
      }
    };

    // Check immediately
    checkTokenExpiration();

    // Check every minute
    const interval = setInterval(checkTokenExpiration, 60 * 1000);

    return () => clearInterval(interval);
  }, [isLoggedIn, isAuthPage]);

  const handleExtendSession = () => {
    // The axios interceptor will automatically handle token refresh
    // For now, just hide the warning as the interceptor will handle it
    setShowWarning(false);
  };

  const handleLogout = () => {
    clearTokens();
  };

  if (!showWarning || !isLoggedIn || isAuthPage) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-lg shadow-lg p-4 max-w-sm w-full">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <FaExclamationTriangle className="text-yellow-600 dark:text-yellow-400 text-lg" />
        </div>

        <div className="flex-1">
          <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
            انتهاء صلاحية الجلسة قريباً
          </h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
            ست انتهي جلستك خلال {remainingTime}. هل تريد تمديد الجلسة؟
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleExtendSession}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center gap-1"
            >
              <FaClock className="text-xs" />
              تمديد الجلسة
            </button>

            <button
              onClick={handleLogout}
              className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowWarning(false)}
          className="flex-shrink-0 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
        >
          <FaTimes className="text-sm" />
        </button>
      </div>
    </div>
  );
};

export default TokenExpirationWarning;
