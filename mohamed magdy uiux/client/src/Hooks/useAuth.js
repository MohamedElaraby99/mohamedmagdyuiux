import { useAuth as useAuthContext } from '../contexts/AuthContext';

/**
 * Custom hook to access authentication state and functions
 * This provides a convenient interface for components to interact with authentication
 */
export const useAuth = () => {
  const context = useAuthContext();

  return {
    // Authentication state
    isLoggedIn: context.isLoggedIn,
    role: context.role,
    user: context.user,
    isInitialized: context.isInitialized,
    isRefreshing: context.isRefreshing,

    // Authentication actions
    logout: context.logout,
    refreshAuth: context.refreshAuth,

    // Helper functions
    hasRole: (roles) => {
      if (!context.role) return false;
      if (Array.isArray(roles)) {
        return roles.includes(context.role);
      }
      return context.role === roles;
    },

    isAdmin: () => ['ADMIN', 'SUPER_ADMIN'].includes(context.role),
    isSuperAdmin: () => context.role === 'SUPER_ADMIN',
    isUser: () => context.role === 'USER',
  };
};

export default useAuth;
