'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import api from '@/lib/axios';
import { getApiError } from '@/lib/apiError';
import { emailField } from '@/lib/validationSchemas';
import FormInput from '@/components/ui/FormInput';
import SubmitButton from '@/components/ui/SubmitButton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const forgotPasswordSchema = z.object({
  email: emailField,
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setSubmittedEmail(data.email);
      setSubmitted(true);
      toast.success('A 6-digit PIN has been sent to your email.');
    } catch (error: any) {
      toast.error(getApiError(error, 'Failed to process your request. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-white mb-2">
        Reset your password
      </h2>
      <p className="text-center text-sm text-gray-400 mb-6">
        Enter your email and we&apos;ll send you a PIN to reset your password.
      </p>

      {!submitted ? (
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormInput
            id="email"
            label="Email address"
            type="email"
            autoComplete="email"
            error={errors.email}
            {...register('email')}
          />
          <div className="pt-2">
            <SubmitButton loading={loading} label="Send reset PIN" />
          </div>
        </form>
      ) : (
        <div className="bg-brand-elevated border border-brand-border p-6 rounded-lg text-center">
          <p className="text-white font-medium mb-4">Check your email!</p>
          <p className="text-gray-400 text-sm mb-4">
            We&apos;ve sent a <span className="text-white font-semibold">6-digit PIN</span> to{' '}
            <span className="text-white font-semibold">{submittedEmail}</span>. Use it to reset your password.
          </p>
          <Link
            href={`/reset-password?email=${encodeURIComponent(submittedEmail)}`}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary-hover focus:outline-none transition-colors mb-4"
          >
            Enter PIN &amp; Reset Password
          </Link>
          <button
            onClick={() => setSubmitted(false)}
            className="text-primary hover:text-primary-hover text-sm font-medium transition-colors"
          >
            Try a different email address
          </button>
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400">
          Remember your password?{' '}
          <Link href="/login" className="font-medium text-primary hover:text-primary-hover transition-colors">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
