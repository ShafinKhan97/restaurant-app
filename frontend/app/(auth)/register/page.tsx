'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import apiClient from '@/lib/axios';
import { getApiError } from '@/lib/apiError';
import { emailField, strongPasswordField } from '@/lib/validationSchemas';
import { useAuth } from '@/context/AuthContext';
import FormInput from '@/components/ui/FormInput';
import SubmitButton from '@/components/ui/SubmitButton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: emailField,
  password: strongPasswordField,
  restaurantName: z.string().min(1, 'Restaurant name is required'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    try {
      const adminResponse = await apiClient.post('/auth/signup', {
        name: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        password: data.password,
        role: 'restaurant_admin',
      });

      const token = adminResponse.data.token;

      const restaurantResponse = await apiClient.post(
        '/restaurants',
        { name: data.restaurantName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const restaurantId = restaurantResponse.data.restaurant._id;
      const adminData = adminResponse.data.admin;

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
      toast.error(getApiError(error, 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-white mb-6">
        Create your account
      </h2>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-2 gap-4">
          <FormInput id="firstName" label="First Name" type="text" error={errors.firstName} {...register('firstName')} />
          <FormInput id="lastName" label="Last Name" type="text" error={errors.lastName} {...register('lastName')} />
        </div>

        <FormInput
          id="restaurantName"
          label="Restaurant / Brand Name"
          type="text"
          placeholder="e.g. Pizza Palace"
          error={errors.restaurantName}
          {...register('restaurantName')}
        />

        <FormInput id="email" label="Email address" type="email" error={errors.email} {...register('email')} />

        <FormInput id="password" label="Password" type="password" error={errors.password} {...register('password')} />

        <div className="pt-4">
          <SubmitButton loading={loading} label="Register" />
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
