'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import apiClient from '@/lib/axios';

interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  accessToken: string;
  is_suspended?: boolean;
}

interface Restaurant {
  _id: string;
  name: string;
  slug: string;
  address?: string;
  contact?: string;
  is_active: boolean;
  categories: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  restaurants: Restaurant[];
  selectedRestaurantId: string | null;
  setSelectedRestaurantId: (id: string | null) => void;
  isLoading: boolean;
  isRestaurantsLoading: boolean;
  login: (token: string, userData: AuthUser) => void;
  logout: () => Promise<void>;
  updateUser: (data: Partial<AuthUser>) => void;
  refreshRestaurants: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  restaurants: [],
  selectedRestaurantId: null,
  setSelectedRestaurantId: () => {},
  isLoading: true,
  isRestaurantsLoading: true,
  login: () => {},
  logout: async () => {},
  updateUser: () => {},
  refreshRestaurants: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestaurantsLoading, setIsRestaurantsLoading] = useState(false);
  const router = useRouter();

  const refreshRestaurants = async () => {
    if (!user) return;
    setIsRestaurantsLoading(true);
    try {
      const res = await apiClient.get('/restaurants');
      const fetchedRestaurants = res.data.restaurants || [];
      setRestaurants(fetchedRestaurants);
      
      // If no branch is selected, or the selected one is gone, pick the first one
      const storedId = localStorage.getItem('qr-menu-selected-restaurant');
      if (storedId && fetchedRestaurants.some((r: any) => r._id === storedId)) {
        setSelectedRestaurantId(storedId);
      } else if (fetchedRestaurants.length > 0) {
        const firstId = fetchedRestaurants[0]._id;
        setSelectedRestaurantId(firstId);
        localStorage.setItem('qr-menu-selected-restaurant', firstId);
      } else {
        setSelectedRestaurantId(null);
      }
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
    } finally {
      setIsRestaurantsLoading(false);
    }
  };

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

  useEffect(() => {
    if (user && user.role !== 'super_admin') {
      refreshRestaurants();
    }
  }, [user]);

  const login = (token: string, userData: AuthUser) => {
    localStorage.setItem('qr-menu-token', token);
    localStorage.setItem('qr-menu-user', JSON.stringify(userData));
    setUser({ ...userData, accessToken: token });
  };

  const handleSetSelectedRestaurantId = (id: string | null) => {
    setSelectedRestaurantId(id);
    if (id) {
      localStorage.setItem('qr-menu-selected-restaurant', id);
    } else {
      localStorage.removeItem('qr-menu-selected-restaurant');
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      localStorage.removeItem('qr-menu-token');
      localStorage.removeItem('qr-menu-user');
      localStorage.removeItem('qr-menu-selected-restaurant');
      setUser(null);
      setRestaurants([]);
      setSelectedRestaurantId(null);
      router.push('/login');
    }
  };

  const updateUser = (data: Partial<AuthUser>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('qr-menu-user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        restaurants, 
        selectedRestaurantId, 
        setSelectedRestaurantId: handleSetSelectedRestaurantId,
        isLoading, 
        isRestaurantsLoading,
        login, 
        logout, 
        updateUser,
        refreshRestaurants
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
