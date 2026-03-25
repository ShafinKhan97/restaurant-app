'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import apiClient from '@/lib/axios';
import { getApiError } from '@/lib/apiError';
import { emailField } from '@/lib/validationSchemas';
import FormInput from '@/components/ui/FormInput';
import SubmitButton from '@/components/ui/SubmitButton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', {
        email: data.email,
        password: data.password,
      });

      const { token, admin } = response.data;
      let restaurantId = undefined;

      if (admin.role !== 'super_admin' && !admin.is_suspended) {
        try {
          const resResponse = await apiClient.get('/restaurants', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (resResponse.data.restaurants?.length > 0) {
            restaurantId = resResponse.data.restaurants[0]._id;
          }
        } catch {
          console.error('Could not fetch associated restaurants');
        }
      }

      login(token, {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        restaurantId,
        accessToken: token,
        is_suspended: admin.is_suspended,
      });

      if (admin.is_suspended) {
        router.push('/suspended');
      } else if (admin.role === 'super_admin' || admin.role === 'SUPER_ADMIN') {
        router.push('/superadmin');
      } else {
        toast.success('Logged in successfully');
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast.error(getApiError(error, 'Invalid email or password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-white mb-6">
        Sign in to your account
      </h2>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormInput
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          error={errors.email}
          {...register('email')}
        />

        <FormInput
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password}
          rightSlot={
            <Link href="/forgot-password" className="text-sm font-medium text-primary hover:text-primary-hover transition-colors">
              Forgot password?
            </Link>
          }
          {...register('password')}
        />

        <div className="pt-2">
          <SubmitButton loading={loading} label="Sign in" />
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-primary hover:text-primary-hover transition-colors">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
