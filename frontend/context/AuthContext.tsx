'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  restaurantId?: string;
  accessToken: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (token: string, userData: AuthUser) => void;
  logout: () => void;
  updateUser: (data: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load from localStorage on mount
    const storedToken = localStorage.getItem('qr-menu-token');
    const storedUser = localStorage.getItem('qr-menu-user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser({ ...parsedUser, accessToken: storedToken });
      } catch (error) {
        localStorage.removeItem('qr-menu-token');
        localStorage.removeItem('qr-menu-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, userData: AuthUser) => {
    localStorage.setItem('qr-menu-token', token);
    localStorage.setItem('qr-menu-user', JSON.stringify(userData));
    setUser({ ...userData, accessToken: token });
  };

  const logout = () => {
    localStorage.removeItem('qr-menu-token');
    localStorage.removeItem('qr-menu-user');
    setUser(null);
    router.push('/login');
  };

  const updateUser = (data: Partial<AuthUser>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('qr-menu-user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
