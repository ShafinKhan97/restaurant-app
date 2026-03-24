'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FaBan, FaSignOutAlt } from 'react-icons/fa';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function SuspendedPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (user && !user.is_suspended) {
      // Non-suspended user shouldn't be here
      router.replace(user.role === 'super_admin' ? '/superadmin' : '/dashboard');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-base text-center px-6">
      {/* Icon */}
      <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-8">
        <FaBan className="w-12 h-12 text-red-500" />
      </div>

      {/* Title */}
      <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
        Account Suspended
      </h1>

      {/* Message */}
      <p className="text-gray-400 max-w-md text-lg mb-2">
        Your account has been suspended by an administrator.
      </p>
      <p className="text-gray-400 max-w-md text-base mb-10">
        Please contact support at{' '}
        <a
          href="mailto:support@example.com"
          className="text-primary font-semibold hover:underline"
        >
          support@example.com
        </a>{' '}
        to resolve this issue.
      </p>

      {/* User info */}
      {user && (
        <div className="bg-brand-surface border border-brand-border rounded-xl px-6 py-4 mb-8 text-sm text-left w-full max-w-xs">
          <p className="text-gray-400 mb-1">Logged in as</p>
          <p className="text-white font-semibold">{user.name}</p>
          <p className="text-gray-500 text-xs">{user.email}</p>
        </div>
      )}

      {/* Sign out button */}
      <button
        onClick={() => setShowConfirm(true)}
        className="flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-semibold hover:bg-red-500/20 transition-colors"
      >
        <FaSignOutAlt />
        Sign Out
      </button>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        confirmLabel="Yes, Sign Out"
        cancelLabel="Stay"
        variant="danger"
        onConfirm={() => { setShowConfirm(false); logout(); }}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
