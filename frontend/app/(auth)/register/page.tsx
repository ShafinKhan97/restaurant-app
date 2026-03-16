'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';
import apiClient from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Universal registration form fields
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    restaurantName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create Admin User
      const adminResponse = await apiClient.post('/auth/signup', {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password,
        role: 'restaurant_admin'
      });

      const token = adminResponse.data.token;

      // 2. Automatically Create the Restaurant for this Admin
      const restaurantResponse = await apiClient.post('/restaurants', {
        name: formData.restaurantName
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const restaurantId = restaurantResponse.data.restaurant._id;
      const adminData = adminResponse.data.admin;

      // 3. Auto-login: populate AuthContext and go straight to dashboard
      login(token, {
        id: adminData.id,
        email: adminData.email,
        name: adminData.name,
        role: adminData.role,
        restaurantId,
        accessToken: token,
      });

      toast.success(`Welcome, ${adminData.name}! Your account is ready.`);
      router.push('/dashboard');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-white mb-6">
        Create your account
      </h2>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
            <input
              id="firstName"
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="block w-full px-3 py-2.5 border border-brand-border rounded-md shadow-sm bg-brand-input text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
            <input
              id="lastName"
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="block w-full px-3 py-2.5 border border-brand-border rounded-md shadow-sm bg-brand-input text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-300 mb-1">Restaurant / Brand Name</label>
          <input
            id="restaurantName"
            type="text"
            required
            placeholder="e.g. Pizza Palace"
            value={formData.restaurantName}
            onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
            className="block w-full px-3 py-2.5 border border-brand-border rounded-md shadow-sm bg-brand-input text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email address</label>
          <input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="block w-full px-3 py-2.5 border border-brand-border rounded-md shadow-sm bg-brand-input text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
          <input
            id="password"
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="block w-full px-3 py-2.5 border border-brand-border rounded-md shadow-sm bg-brand-input text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-brand-base disabled:opacity-50 transition-colors"
          >
            {loading ? <FaSpinner className="animate-spin w-5 h-5" /> : 'Register'}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:text-primary-hover">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
