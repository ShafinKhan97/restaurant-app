'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';
import apiClient from '@/lib/axios';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Authenticate with backend
      const response = await apiClient.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });

      const { token, admin } = response.data;
      
      let restaurantId = undefined;
      
      // 2. If it's a restaurant admin, automatically fetch their restaurant
      if (admin.role !== 'super_admin') {
        try {
          const resResponse = await apiClient.get('/restaurants', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (resResponse.data.restaurants && resResponse.data.restaurants.length > 0) {
            restaurantId = resResponse.data.restaurants[0]._id;
          }
        } catch (resErr) {
          console.error("Could not fetch associated restaurants");
        }
      }

      const authUser = {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        restaurantId: restaurantId,
        accessToken: token,
      };

      login(token, authUser);
      toast.success('Logged in successfully');
      
      if (admin.role === 'super_admin' || admin.role === 'SUPER_ADMIN') {
        router.push('/superadmin');
      } else {
        router.push('/dashboard');
      }

    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Invalid email or password';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-white mb-6">
        Sign in to your account
      </h2>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="appearance-none block w-full px-3 py-2.5 border border-brand-border rounded-md shadow-sm bg-brand-input text-white placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-colors"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <Link href="/forgot-password" className="text-sm font-medium text-primary hover:text-primary-hover transition-colors">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="appearance-none block w-full px-3 py-2.5 border border-brand-border rounded-md shadow-sm bg-brand-input text-white placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-colors"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-brand-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <FaSpinner className="animate-spin w-5 h-5" /> : 'Sign in'}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400">
          Don't have an account?{' '}
          <Link href="/register" className="font-medium text-primary hover:text-primary-hover transition-colors">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
