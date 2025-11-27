import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpiry, setSessionExpiry] = useState(null);
  const [securityLog, setSecurityLog] = useState([]);

  // Initialize security log from localStorage
  useEffect(() => {
    const savedLog = localStorage.getItem('securityLog');
    if (savedLog) {
      setSecurityLog(JSON.parse(savedLog));
    }
  }, []);

  // Add entry to security log
  const addSecurityLog = useCallback((action, details = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      userAgent: navigator.userAgent,
      ip: details.ip || 'unknown',
      location: details.location || 'unknown',
      ...details
    };

    setSecurityLog(prev => {
      const newLog = [logEntry, ...prev].slice(0, 100); // Keep last 100 entries
      localStorage.setItem('securityLog', JSON.stringify(newLog));
      return newLog;
    });
  }, []);

  // Validate token format
  const isValidToken = (token) => {
    if (!token || typeof token !== 'string') return false;
    
    // Basic JWT format validation (3 parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    try {
      // Check if the payload can be parsed
      const payload = JSON.parse(atob(parts[1]));
      
      // Check expiration
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  };

  // Get client IP (simplified - in production, use proper IP detection)
  const getClientIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'unknown';
    }
  };

  // Set session expiry
  const setSession = useCallback((token) => {
    if (!token) return;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp) {
        const expiryTime = payload.exp * 1000;
        setSessionExpiry(expiryTime);
        
        // Set up auto logout 1 minute before expiry
        const timeout = expiryTime - Date.now() - 60000;
        if (timeout > 0) {
          setTimeout(() => {
            addSecurityLog('session_auto_logout', { reason: 'token_expiry' });
            logout();
          }, timeout);
        }
      }
    } catch (error) {
      console.error('Error setting session:', error);
    }
  }, [addSecurityLog]);

  // Validate session on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (token && isValidToken(token)) {
      fetchUser();
    } else if (refreshToken && isValidToken(refreshToken)) {
      refreshAuthToken();
    } else {
      setLoading(false);
      // Clear invalid tokens
      if (token) {
        localStorage.removeItem('token');
        addSecurityLog('invalid_token_cleared');
      }
    }
  }, [addSecurityLog]);

  // Auto-logout when tab becomes visible (detects token theft)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        const token = localStorage.getItem('token');
        if (!token || !isValidToken(token)) {
          addSecurityLog('auto_logout', { reason: 'token_validation_failed' });
          logout();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, addSecurityLog]);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !isValidToken(token)) {
        throw new Error('Invalid token');
      }

      const response = await authAPI.getMe();
      setUser(response.data);
      setSession(token);
      
      // Log successful authentication
      getClientIP().then(ip => {
        addSecurityLog('user_authenticated', { 
          userId: response.data.id,
          ip,
          method: 'token'
        });
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      addSecurityLog('fetch_user_failed', { error: error.message });
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // Basic rate limiting check
      const recentAttempts = securityLog.filter(entry => 
        entry.action === 'login_attempt' && 
        Date.now() - new Date(entry.timestamp).getTime() < 5 * 60 * 1000 // 5 minutes
      );
      
      if (recentAttempts.length >= 5) {
        addSecurityLog('rate_limit_exceeded', { email });
        return { 
          success: false, 
          message: 'Too many login attempts. Please try again later.' 
        };
      }

      addSecurityLog('login_attempt', { email });

      const response = await authAPI.login({ email, password });
      const { token, refreshToken, ...userData } = response.data;
      
      if (!isValidToken(token)) {
        throw new Error('Invalid token received');
      }

      // Store tokens securely
      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      setUser(userData);
      setSession(token);

      // Log successful login
      getClientIP().then(ip => {
        addSecurityLog('login_success', { 
          userId: userData.id,
          email,
          ip,
          method: 'password'
        });
      });
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      
      // Log failed attempt
      getClientIP().then(ip => {
        addSecurityLog('login_failed', { 
          email,
          ip,
          reason: message
        });
      });
      
      return { 
        success: false, 
        message 
      };
    }
  };

  const register = async (userData) => {
    try {
      addSecurityLog('registration_attempt', { email: userData.email });

      const response = await authAPI.register(userData);
      const { token, refreshToken, ...userInfo } = response.data;
      
      if (!isValidToken(token)) {
        throw new Error('Invalid token received');
      }

      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      setUser(userInfo);
      setSession(token);

      // Log successful registration
      getClientIP().then(ip => {
        addSecurityLog('registration_success', { 
          userId: userInfo.id,
          email: userData.email,
          ip
        });
      });
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      
      getClientIP().then(ip => {
        addSecurityLog('registration_failed', { 
          email: userData.email,
          ip,
          reason: message
        });
      });
      
      return { 
        success: false, 
        message 
      };
    }
  };

  // OAuth Authentication Methods
  const loginWithOAuth = async (provider, oauthData) => {
    try {
      addSecurityLog('oauth_attempt', { provider });

      const response = await authAPI.oauthLogin(provider, oauthData);
      const { token, refreshToken, ...userData } = response.data;
      
      if (!isValidToken(token)) {
        throw new Error('Invalid token received');
      }

      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      setUser(userData);
      setSession(token);

      // Log successful OAuth login
      getClientIP().then(ip => {
        addSecurityLog('oauth_success', { 
          userId: userData.id,
          provider,
          ip
        });
      });
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || `${provider} authentication failed`;
      
      getClientIP().then(ip => {
        addSecurityLog('oauth_failed', { 
          provider,
          ip,
          reason: message
        });
      });
      
      return { 
        success: false, 
        message 
      };
    }
  };

  const loginWithGoogle = async (accessToken = null, idToken = null) => {
    const oauthData = accessToken ? { access_token: accessToken } : { id_token: idToken };
    return loginWithOAuth('google', oauthData);
  };

  const loginWithGitHub = async (code) => {
    return loginWithOAuth('github', { code });
  };

  const loginWithMicrosoft = async (accessToken) => {
    return loginWithOAuth('microsoft', { access_token: accessToken });
  };

  // Token refresh
  const refreshAuthToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken || !isValidToken(refreshToken)) {
        throw new Error('Invalid refresh token');
      }

      const response = await authAPI.refreshToken({ refreshToken });
      const { token, newRefreshToken } = response.data;
      
      if (!isValidToken(token)) {
        throw new Error('Invalid token received');
      }

      localStorage.setItem('token', token);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }
      
      setSession(token);
      addSecurityLog('token_refreshed');

      return { success: true, token };
    } catch (error) {
      addSecurityLog('token_refresh_failed', { error: error.message });
      logout();
      return { success: false };
    }
  };

  // Password reset
  const requestPasswordReset = async (email) => {
    try {
      await authAPI.requestPasswordReset({ email });
      addSecurityLog('password_reset_requested', { email });
      return { success: true };
    } catch (error) {
      addSecurityLog('password_reset_failed', { 
        email, 
        reason: error.response?.data?.message || 'Request failed' 
      });
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to request password reset' 
      };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      await authAPI.resetPassword({ token, newPassword });
      addSecurityLog('password_reset_completed');
      return { success: true };
    } catch (error) {
      addSecurityLog('password_reset_error', { 
        reason: error.response?.data?.message || 'Reset failed' 
      });
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to reset password' 
      };
    }
  };

  // Security functions
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await authAPI.changePassword({ currentPassword, newPassword });
      addSecurityLog('password_changed');
      return { success: true };
    } catch (error) {
      addSecurityLog('password_change_failed', { 
        reason: error.response?.data?.message || 'Change failed' 
      });
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to change password' 
      };
    }
  };

  const logout = () => {
    const userId = user?.id;
    addSecurityLog('user_logout', { userId });
    
    // Clear all auth-related storage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('oauth_state');
    
    setUser(null);
    setSessionExpiry(null);
  };

  // Get security events for the current user
  const getSecurityEvents = useCallback(() => {
    if (!user) return [];
    return securityLog.filter(entry => 
      entry.userId === user.id || 
      entry.action.includes('logout') ||
      entry.action.includes('token')
    );
  }, [user, securityLog]);

  // Check if session is about to expire
  const isSessionExpiring = () => {
    if (!sessionExpiry) return false;
    return sessionExpiry - Date.now() < 5 * 60 * 1000; // 5 minutes
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    sessionExpiry,
    securityLog: getSecurityEvents(),
    
    // OAuth Methods
    loginWithGoogle,
    loginWithGitHub,
    loginWithMicrosoft,
    
    // Token Management
    refreshAuthToken,
    isSessionExpiring,
    
    // Password Management
    requestPasswordReset,
    resetPassword,
    changePassword,
    
    // Security
    addSecurityLog
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};