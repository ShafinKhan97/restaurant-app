'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { FaUser, FaEnvelope, FaLock, FaSpinner, FaSave } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import FadeIn from '@/components/ui/FadeIn';

export default function AdminProfilePage() {
  const { data: session, update } = useSession();
  
  // States for profile form
  const [profileData, setProfileData] = useState({
    name: session?.user?.name || 'Admin User',
    email: session?.user?.email || 'admin@example.com',
  });
  
  // States for password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileSaving(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Attempt to update next-auth session locally (requires NextAuth configured properly for it)
      await update({
        ...session,
        user: {
          ...session?.user,
          name: profileData.name,
          email: profileData.email,
        }
      });
      
      toast.success('Profile information updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsPasswordSaving(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Failed to change password');
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
            
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="text-gray-500 w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2.5 border border-brand-border rounded-lg bg-brand-input text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-500 w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2.5 border border-brand-border rounded-lg bg-brand-input text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-brand-border">
                <button
                  type="submit"
                  disabled={isProfileSaving}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-elevated hover:bg-brand-base border border-brand-border rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProfileSaving ? <FaSpinner className="w-4 h-4 animate-spin" /> : <FaSave className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </form>
          </FadeIn>

          <FadeIn delay={0.3} direction="up" className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FaLock className="text-primary w-5 h-5" />
              Change Password
            </h2>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="block w-full px-3 py-2.5 border border-brand-border rounded-lg bg-brand-input text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="block w-full px-3 py-2.5 border border-brand-border rounded-lg bg-brand-input text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="block w-full px-3 py-2.5 border border-brand-border rounded-lg bg-brand-input text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-brand-border">
                <button
                  type="submit"
                  disabled={isPasswordSaving}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-hover rounded-lg text-sm font-semibold text-white shadow-glow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPasswordSaving ? <FaSpinner className="w-4 h-4 animate-spin" /> : <FaSave className="w-4 h-4" />}
                  Update Password
                </button>
              </div>
            </form>
          </FadeIn>
        </div>

        {/* Profile Summary Card Sidebar */}
        <div className="lg:col-span-1">
          <FadeIn delay={0.4} direction="up" className="bg-brand-surface border border-brand-border rounded-xl p-6 text-center shadow-sm h-full flex flex-col items-center sticky top-8">
            <div className="w-24 h-24 rounded-full bg-brand-base border-4 border-brand-border flex items-center justify-center text-4xl font-bold text-primary mb-4 shadow-inner">
              {profileData.name.charAt(0).toUpperCase()}
            </div>
            
            <h3 className="text-xl font-bold text-white leading-tight mb-1">
              {profileData.name}
            </h3>
            <p className="text-sm text-gray-400 mb-6 w-full truncate px-4">
              {profileData.email}
            </p>
            
            <div className="w-full bg-brand-base border border-brand-border rounded-lg p-3 text-sm flex justify-between items-center mb-6">
              <span className="text-gray-400">Account Role</span>
              <span className="font-semibold text-white capitalize">
                {session?.user?.role?.replace('_', ' ').toLowerCase() || 'Administrator'}
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
