'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import FadeIn from '@/components/ui/FadeIn';
import FormInput from '@/components/ui/FormInput';
import SubmitButton from '@/components/ui/SubmitButton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { emailField, strongPasswordField } from '@/lib/validationSchemas';
import { getApiError } from '@/lib/apiError';
import apiClient from '@/lib/axios';

const profileSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: emailField,
});

type ProfileValues = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: strongPasswordField,
  confirmPassword: z.string().min(1, 'Please confirm your new password')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'New passwords do not match',
  path: ['confirmPassword'],
});

type PasswordValues = z.infer<typeof passwordSchema>;

export default function AdminProfilePage() {
  const { user, updateUser } = useAuth();
  
  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || 'Admin User',
      email: user?.email || 'admin@example.com',
    }
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name || 'Admin User',
        email: user.email || 'admin@example.com',
      });
    }
  }, [user, profileForm]);

  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

  // Derive visual values for the display card
  const watchedName = profileForm.watch("name", user?.name || 'Admin User');
  const watchedEmail = profileForm.watch("email", user?.email || 'admin@example.com');

  const onProfileSubmit = async (data: ProfileValues) => {
    setIsProfileSaving(true);
    try {
      const parts = data.name.trim().split(' ');
      const first_name = parts[0] || '';
      const last_name = parts.slice(1).join(' ') || first_name;
      
      const response = await apiClient.put('/auth/profile', { first_name, last_name, email: data.email });
      const admin = response.data.admin;
      updateUser({ name: `${admin.first_name} ${admin.last_name}`, email: admin.email });
      toast.success('Profile information updated successfully');
    } catch (error: any) {
      toast.error(getApiError(error, 'Failed to update profile'));
    } finally {
      setIsProfileSaving(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordValues) => {
    setIsPasswordSaving(true);
    try {
      await apiClient.put('/auth/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully');
      passwordForm.reset();
    } catch (error: any) {
      toast.error(getApiError(error, 'Failed to change password. Please check your current password.'));
    } finally {
      setIsPasswordSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-8">
      <FadeIn delay={0.1} direction="down" className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Admin Profile</h1>
        <p className="text-gray-400 text-sm">
          Update your account details, email address, and security settings.
        </p>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Details Form */}
        <div className="lg:col-span-2 space-y-8">
          <FadeIn delay={0.2} direction="up" className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FaUser className="text-primary w-5 h-5" />
              Personal Information
            </h2>
            
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="relative">
                  <div className="absolute bottom-0 left-0 top-7 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-500 w-4 h-4" />
                  </div>
                  <FormInput
                    id="name"
                    label="Full Name"
                    type="text"
                    className="pl-10"
                    error={profileForm.formState.errors.name}
                    {...profileForm.register('name')}
                  />
                </div>
                <div className="relative">
                  <div className="absolute bottom-0 left-0 top-7 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-500 w-4 h-4" />
                  </div>
                  <FormInput
                    id="email"
                    label="Email Address"
                    type="email"
                    className="pl-10"
                    error={profileForm.formState.errors.email}
                    {...profileForm.register('email')}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-brand-border">
                <SubmitButton
                  loading={isProfileSaving}
                  label="Save Changes"
                  className="w-auto px-6"
                />
              </div>
            </form>
          </FadeIn>

          <FadeIn delay={0.3} direction="up" className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FaLock className="text-primary w-5 h-5" />
              Change Password
            </h2>
            
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6" noValidate>
              <div className="relative">
                <div className="absolute bottom-0 left-0 top-7 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-500 w-4 h-4" />
                </div>
                <FormInput
                  id="currentPassword"
                  label="Current Password"
                  type="password"
                  className="pl-10"
                  error={passwordForm.formState.errors.currentPassword}
                  {...passwordForm.register('currentPassword')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormInput
                  id="newPassword"
                  label="New Password"
                  type="password"
                  error={passwordForm.formState.errors.newPassword}
                  {...passwordForm.register('newPassword')}
                />
                <FormInput
                  id="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  error={passwordForm.formState.errors.confirmPassword}
                  {...passwordForm.register('confirmPassword')}
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-brand-border">
                <SubmitButton
                  loading={isPasswordSaving}
                  label="Update Password"
                  className="w-auto px-6"
                />
              </div>
            </form>
          </FadeIn>
        </div>

        {/* Profile Summary Card Sidebar */}
        <div className="lg:col-span-1">
          <FadeIn delay={0.4} direction="up" className="bg-brand-surface border border-brand-border rounded-xl p-6 text-center shadow-sm h-full flex flex-col items-center sticky top-8">
            <div className="w-24 h-24 rounded-full bg-brand-base border-4 border-brand-border flex items-center justify-center text-4xl font-bold text-primary mb-4 shadow-inner">
              {watchedName.charAt(0).toUpperCase()}
            </div>
            
            <h3 className="text-xl font-bold text-white leading-tight mb-1">
              {watchedName}
            </h3>
            <p className="text-sm text-gray-400 mb-6 w-full truncate px-4">
              {watchedEmail}
            </p>
            
            <div className="w-full bg-brand-base border border-brand-border rounded-lg p-3 text-sm flex justify-between items-center mb-6">
              <span className="text-gray-400">Account Role</span>
              <span className="font-semibold text-white capitalize">
                {user?.role?.replace('_', ' ').toLowerCase() || 'Administrator'}
              </span>
            </div>

            <p className="text-xs text-gray-500 mt-auto leading-relaxed">
              Updating your email address will require you to log back in. Ensure you don't lose access to your new email.
            </p>
          </FadeIn>
        </div>

      </div>
    </div>
  );
}
