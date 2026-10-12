import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (userData: Partial<User> & { password?: string }) => Promise<void>;
  logout: () => void;
  switchDemoUser: (targetRole: 'student' | 'admin' | 'student2') => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('dlms_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.getCurrentUser();
          setUser(res.user);
        } catch (err) {
          console.warn('Failed to validate stored token, clearing session.');
          localStorage.removeItem('dlms_token');
          setToken(null);
          // Fallback default login as Alex Johnson (Student) for instant demo availability
          await login('alex.johnson@student.edu', 'student123');
        }
      } else {
        // Automatically default log in as Alex Johnson (Student) for immediate out-of-the-box demo
        try {
          await login('alex.johnson@student.edu', 'student123');
        } catch (e) {
          console.error('Failed default demo login', e);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password?: string) => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('dlms_token', res.token);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Partial<User> & { password?: string }) => {
    setLoading(true);
    try {
      const res = await api.register(userData);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('dlms_token', res.token);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('dlms_token');
    setToken(null);
    setUser(null);
  };

  const switchDemoUser = async (targetRole: 'student' | 'admin' | 'student2') => {
    if (targetRole === 'admin') {
      await login('admin@library.edu', 'admin123');
    } else if (targetRole === 'student2') {
      await login('maya.lin@student.edu', 'student123');
    } else {
      await login('alex.johnson@student.edu', 'student123');
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    const updated = await api.updateUser(user.id, updates);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        switchDemoUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
