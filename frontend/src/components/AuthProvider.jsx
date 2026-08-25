import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import {
  changePassword as changePasswordRequest,
  getMe,
  loginUser,
  logoutUser,
  registerUser,
  updateMe,
} from '@/api/auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => !!localStorage.getItem('access_token'));

  const fetchProfile = useCallback(async () => {
    try {
      const data = await getMe();
      setUser(data);
    } catch {
      setUser(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchProfile().finally(() => setLoading(false));
    }
  }, [fetchProfile]);

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    localStorage.setItem('access_token', data.tokens.access);
    localStorage.setItem('refresh_token', data.tokens.refresh);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const data = await registerUser(userData);
    localStorage.setItem('access_token', data.tokens.access);
    localStorage.setItem('refresh_token', data.tokens.refresh);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    try {
      if (refreshToken) {
        await logoutUser(refreshToken);
      }
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    const data = await updateMe(profileData);
    setUser(data);
    return data;
  };

  const changePassword = async (oldPassword, newPassword) => {
    const data = await changePasswordRequest(oldPassword, newPassword);
    return data;
  };

  const isHost = user?.role === 'host';
  const isTenant = user?.role === 'tenant';
  const isGuest = user?.role === 'guest';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        fetchProfile,
        isHost,
        isTenant,
        isGuest,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
