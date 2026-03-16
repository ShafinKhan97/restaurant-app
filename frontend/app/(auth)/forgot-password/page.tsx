'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';
import api from '@/lib/axios';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In a real application, submit the email to the backend to generate a reset token
      // await api.post('/auth/forgot-password', { email });
      
      // Simulating network request
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setSubmitted(true);
      toast.success('Password reset link sent to your email.');
    } catch (error) {
      toast.error('Failed to process your request. Please try again.');
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
        Enter your email and we'll send you a link to reset your password.
      </p>

      {!submitted ? (
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none block w-full px-3 py-2.5 border border-brand-border rounded-md shadow-sm bg-brand-input text-white placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-colors"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-brand-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <FaSpinner className="animate-spin w-5 h-5" /> : 'Send reset link'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-brand-elevated border border-brand-border p-6 rounded-lg text-center">
          <p className="text-white font-medium mb-4">Check your email!</p>
          <p className="text-gray-400 text-sm mb-6">
            We've sent a password reset link to <span className="text-white font-semibold">{email}</span>.
          </p>
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
