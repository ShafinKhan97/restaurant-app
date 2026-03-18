'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaSpinner, FaCheckCircle } from 'react-icons/fa';
import api from '@/lib/axios';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
      toast.error('Please enter a valid 6-digit PIN.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, pin, newPassword });
      setSuccess(true);
      toast.success('Password reset successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password. Please check your PIN and try again.');
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

      <form className="space-y-5" onSubmit={handleSubmit}>
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none block w-full px-3 py-2.5 border border-brand-border rounded-md shadow-sm bg-brand-input text-white placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-colors"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="pin" className="block text-sm font-medium text-gray-300 mb-1">
            6-Digit PIN
          </label>
          <input
            id="pin"
            name="pin"
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            required
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            className="appearance-none block w-full px-3 py-2.5 border border-brand-border rounded-md shadow-sm bg-brand-input text-white placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-colors tracking-[0.5em] text-center font-mono text-lg"
            placeholder="000000"
          />
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">
            New Password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="appearance-none block w-full px-3 py-2.5 border border-brand-border rounded-md shadow-sm bg-brand-input text-white placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-colors"
            placeholder="At least 6 characters"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-brand-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <FaSpinner className="animate-spin w-5 h-5" /> : 'Reset Password'}
          </button>
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
