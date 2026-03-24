'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaSpinner, FaCheckCircle } from 'react-icons/fa';
import api from '@/lib/axios';
import { getApiError } from '@/lib/apiError';
import { emailField, strongPasswordField } from '@/lib/validationSchemas';
import FormInput from '@/components/ui/FormInput';
import SubmitButton from '@/components/ui/SubmitButton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const resetPasswordSchema = z.object({
  email: emailField,
  pin: z.string().length(6, 'PIN must be exactly 6 digits').regex(/^\d+$/, 'PIN must contain only numbers'),
  newPassword: strongPasswordField,
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: '', pin: '', newPassword: '' },
  });

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) setValue('email', emailParam);
  }, [searchParams, setValue]);

  const onSubmit = async (data: ResetPasswordValues) => {
    setLoading(true);
    try {
      // Backend expects: { email, pin, password } — not newPassword
      await api.post('/auth/reset-password', {
        email: data.email,
        pin: data.pin,
        password: data.newPassword,
      });
      setSuccess(true);
      toast.success('Password reset successfully!');
    } catch (error: any) {
      toast.error(getApiError(error, 'Failed to reset password. Please check your PIN and try again.'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <FaCheckCircle className="w-14 h-14 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Password Reset!</h2>
        <p className="text-gray-400 text-sm mb-6">
          Your password has been updated successfully. You can now log in with your new password.
        </p>
        <Link
          href="/login"
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary-hover focus:outline-none transition-colors"
        >
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-white mb-2">
        Reset your password
      </h2>
      <p className="text-center text-sm text-gray-400 mb-6">
        Enter the 6-digit PIN sent to your email along with your new password.
      </p>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormInput
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email}
          {...register('email')}
        />

        {/* PIN field uses custom styling — not using FormInput to keep centered mono font */}
        <div>
          <label htmlFor="pin" className="block text-sm font-medium text-gray-300 mb-1">
            6-Digit PIN
          </label>
          <input
            id="pin"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            {...register('pin')}
            className={`appearance-none block w-full px-3 py-2.5 border rounded-md shadow-sm bg-brand-input text-white placeholder-gray-500 focus:outline-none sm:text-sm transition-colors tracking-[0.5em] text-center font-mono text-lg ${errors.pin ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-brand-border focus:ring-primary focus:border-primary'}`}
          />
          {errors.pin && <p className="mt-1 text-sm text-red-500 text-center tracking-normal">{errors.pin.message}</p>}
        </div>

        <FormInput
          id="newPassword"
          label="New Password"
          type="password"
          autoComplete="new-password"
          placeholder="Min 8 chars, uppercase, number, special"
          error={errors.newPassword}
          {...register('newPassword')}
        />

        <div className="pt-2">
          <SubmitButton loading={loading} label="Reset Password" />
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400">
          Didn&apos;t get a PIN?{' '}
          <Link href="/forgot-password" className="font-medium text-primary hover:text-primary-hover transition-colors">
            Resend it
          </Link>
          {' · '}
          <Link href="/login" className="font-medium text-primary hover:text-primary-hover transition-colors">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-10">
        <FaSpinner className="animate-spin w-6 h-6 text-primary" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
