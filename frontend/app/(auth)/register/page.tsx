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
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [pin, setPin] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    }
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    try {
      const adminResponse = await apiClient.post('/auth/signup', {
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
        email: data.email,
        password: data.password,
        role: 'restaurant_admin',
      });

      setRegisteredEmail(data.email);
      setStep(2);
      toast.success(adminResponse.data.message || 'Check your email for the PIN');
    } catch (error: any) {
      toast.error(getApiError(error, 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async () => {
    if (!pin) {
      toast.error('Please enter the PIN');
      return;
    }
    setLoading(true);
    try {
      const verifyRes = await apiClient.post('/auth/verify-email', {
        email: registeredEmail,
        pin
      });
      const token = verifyRes.data.token;
      const adminData = verifyRes.data.admin;

      login(token, {
        id: adminData.id,
        email: adminData.email,
        name: `${adminData.first_name || ''} ${adminData.last_name || ''}`.trim(),
        role: adminData.role,
        accessToken: token,
      });

      toast.success(`Welcome! Your account is verified.`);
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(getApiError(error, 'Verification failed. Invalid PIN.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await apiClient.post('/auth/resend-verification', { email: registeredEmail });
      toast.success('Verification PIN resent to your email');
    } catch (error: any) {
      toast.error(getApiError(error, 'Failed to resend PIN'));
    }
  };

  return (
    <div>
      <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-white mb-6">
        {step === 1 ? 'Create your account' : 'Verify your email'}
      </h2>

      {step === 1 ? (
        <form key="register-form" className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-2 gap-4">
            <FormInput key="firstName" id="firstName" label="First Name" type="text" error={errors.firstName} {...register('firstName')} />
            <FormInput key="lastName" id="lastName" label="Last Name" type="text" error={errors.lastName} {...register('lastName')} />
          </div>

          <FormInput key="email" id="email" label="Email address" type="email" error={errors.email} {...register('email')} />

          <FormInput key="password" id="password" label="Password" type="password" error={errors.password} {...register('password')} />

          <div className="pt-4">
            <SubmitButton loading={loading} label="Register" />
          </div>
        </form>
      ) : (
        <form key="verify-form" className="space-y-4" onSubmit={(e) => { e.preventDefault(); onVerify(); }}>
          <p className="text-sm text-gray-300 text-center mb-4">
            We sent a 6-digit verification PIN to <span className="font-semibold text-white">{registeredEmail}</span>
          </p>
          
          <FormInput 
            key="pin"
            id="pin" 
            label="Enter Verification PIN" 
            type="text" 
            placeholder="e.g. 123456"
            value={pin} 
            onChange={(e: any) => setPin(e.target.value)} 
          />
          
          <div className="pt-4">
            <SubmitButton loading={loading} label="Verify & Complete Setup" />
          </div>
          
          <div className="text-center mt-4">
            <button 
              type="button" 
              onClick={handleResend} 
              className="text-sm text-primary hover:text-primary-hover font-medium transition-colors"
            >
              Resend PIN
            </button>
          </div>
        </form>
      )}

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
