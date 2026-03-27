'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FaImage, FaUpload, FaSpinner, FaCog } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import FadeIn from '@/components/ui/FadeIn';
import FormInput from '@/components/ui/FormInput';
import SubmitButton from '@/components/ui/SubmitButton';
import apiClient from '@/lib/axios';
import { getApiError } from '@/lib/apiError';

export default function RestaurantSettingsPage() {
  const { user, selectedRestaurantId } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [restaurantName, setRestaurantName] = useState('');
  
  // Image handling
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [bannerPreview, setBannerPreview] = useState<string>('');
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  
  const logoUrlRef = useRef<string>('');
  const bannerUrlRef = useRef<string>('');

  useEffect(() => {
    fetchRestaurantDetails();
    
    // Cleanup blob URLs on unmount
    return () => {
      if (logoUrlRef.current) URL.revokeObjectURL(logoUrlRef.current);
      if (bannerUrlRef.current) URL.revokeObjectURL(bannerUrlRef.current);
    };
  }, [user, selectedRestaurantId]);

  const fetchRestaurantDetails = async () => {
    if (!selectedRestaurantId) return;
    try {
      const { data } = await apiClient.get(`/restaurants/${selectedRestaurantId}`);
      if (data.restaurant) {
        setRestaurantName(data.restaurant.name || '');
        setLogoPreview(data.restaurant.logo_url || '');
        setBannerPreview(data.restaurant.banner_image || '');
      }
    } catch (error: any) {
      toast.error('Failed to load restaurant details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const url = URL.createObjectURL(file);
      logoUrlRef.current = url;
      setLogoPreview(url);
    }
  };
  
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const url = URL.createObjectURL(file);
      bannerUrlRef.current = url;
      setBannerPreview(url);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantName.trim()) {
      toast.error('Restaurant name is required');
      return;
    }
    if (!selectedRestaurantId) return;

    setIsSaving(true);
    try {
      // Use FormData because we might be uploading files
      const formData = new FormData();
      formData.append('name', restaurantName.trim());
      
      if (logoFile) {
        formData.append('logo', logoFile);
      }
      if (bannerFile) {
        formData.append('banner', bannerFile);
      }

      await apiClient.put(`/restaurants/${selectedRestaurantId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Restaurant settings saved successfully!');
      
      // Reset files to avoid re-uploading on next save if nothing changed
      setLogoFile(null);
      setBannerFile(null);
      
      // Refresh to get actual S3 URLs instead of local blob URLs
      fetchRestaurantDetails();
      
    } catch (error: any) {
      toast.error(getApiError(error, 'Failed to update settings'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <FaSpinner className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl pb-8 mx-auto">
      <FadeIn delay={0.1} direction="down" className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <FaCog className="text-primary w-6 h-6" /> Restaurant Settings
        </h1>
        <p className="text-gray-400 text-sm">
          Update your restaurant's brand identity, logo, and banner.
        </p>
      </FadeIn>

      <FadeIn delay={0.2} direction="up" className="bg-brand-surface border border-brand-border rounded-xl p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* General Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white border-b border-brand-border pb-2">General Information</h2>
            <div className="max-w-md">
              <FormInput
                id="restaurantName"
                label="Restaurant Name"
                type="text"
                placeholder="Your Restaurant Name"
                value={restaurantName}
                onChange={(e: any) => setRestaurantName(e.target.value)}
              />
            </div>
          </div>
          
          {/* Branding - Banner */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white border-b border-brand-border pb-2">Restaurant Branding</h2>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Banner Image</label>
              <p className="text-xs text-gray-500 mb-3"> This image will appear at the top of your digital menu.</p>
              
              {bannerPreview ? (
                <div className="relative h-48 w-full rounded-lg border border-brand-border overflow-hidden bg-brand-base flex items-center justify-center group">
                  <img src={bannerPreview} alt="Banner Preview" className="h-full w-full object-cover" />
                  {bannerFile && (
                    <div className="absolute top-2 left-2 bg-primary/80 text-white text-xs px-2 py-0.5 rounded font-medium">
                      New file selected
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="px-4 py-2 bg-brand-elevated border border-brand-border rounded cursor-pointer text-sm font-medium text-white hover:bg-brand-surface transition">
                      Change Banner
                      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleBannerUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="border border-brand-border border-dashed rounded-lg h-48 flex flex-col items-center justify-center text-center bg-brand-base relative hover:border-primary/50 transition-colors">
                  <input 
                    type="file" 
                    accept="image/jpeg,image/png,image/webp" 
                    onChange={handleBannerUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  />
                  <FaImage className="w-10 h-10 text-gray-500 mb-3" />
                  <p className="text-sm text-gray-400 font-medium">Click to upload a banner image</p>
                  <p className="text-xs text-gray-500 mt-1">Recommended size: 1200x400 (Max 5MB)</p>
                </div>
              )}
            </div>
            
            {/* Branding - Logo */}
            <div className="space-y-2 pt-4">
              <label className="block text-sm font-medium text-gray-300">Restaurant Logo</label>
              <p className="text-xs text-gray-500 mb-3"> Your official logo used across the platform and QR codes.</p>
              
              <div className="flex items-center gap-6">
                {logoPreview ? (
                  <div className="relative w-32 h-32 rounded-full border-4 border-brand-border overflow-hidden bg-brand-base flex items-center justify-center group shrink-0 shadow-lg">
                    <img src={logoPreview} alt="Logo Preview" className="h-full w-full object-cover" />
                    {logoFile && (
                      <span className="absolute bottom-1 bg-primary/90 text-white text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                        New
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <label className="text-xs font-bold text-white cursor-pointer px-3 py-1 bg-black/50 rounded-full hover:bg-black/80">
                        Change
                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleLogoUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-32 h-32 rounded-full border-4 border-dashed border-brand-border bg-brand-base flex flex-col items-center justify-center shrink-0 hover:border-primary/50 transition-colors">
                    <input 
                      type="file" 
                      accept="image/jpeg,image/png,image/webp" 
                      onChange={handleLogoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full" 
                    />
                    <FaUpload className="w-6 h-6 text-gray-500 mb-2" />
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Upload Logo</span>
                  </div>
                )}
                
                <div className="text-sm text-gray-400 max-w-sm">
                  <p className="mb-2">Your logo should be a square image (1:1 ratio) for the best fit.</p>
                  <p className="text-xs text-gray-500">Supported formats: JPG, PNG, WEBP. Maximum file size: 5MB.</p>
                </div>
              </div>
            </div>
            
          </div>

          <div className="pt-6 border-t border-brand-border flex justify-end">
            <SubmitButton
              loading={isSaving}
              label={logoFile || bannerFile ? "Upload & Save Changes" : "Save Settings"}
              className="w-auto px-8"
            />
          </div>
          
        </form>
      </FadeIn>
    </div>
  );
}
