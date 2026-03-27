'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import apiClient from '@/lib/axios';
import { getApiError } from '@/lib/apiError';
import { useAuth } from '@/context/AuthContext';
import FormInput from '@/components/ui/FormInput';
import SubmitButton from '@/components/ui/SubmitButton';
import FadeIn from '@/components/ui/FadeIn';

const restaurantSchema = z.object({
  name: z.string().min(2, 'Restaurant name must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  contact: z.string().min(10, 'Contact number must be valid'),
});

type RestaurantFormValues = z.infer<typeof restaurantSchema>;

export default function CreateRestaurantPage() {
  const router = useRouter();
  const { restaurants, refreshRestaurants, setSelectedRestaurantId } = useAuth();
  const [loading, setLoading] = useState(false);

  const isFirstBranch = restaurants.length === 0;

  const { register, handleSubmit, formState: { errors } } = useForm<RestaurantFormValues>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: !isFirstBranch ? restaurants[0].name : '',
      address: '',
      contact: '',
    }
  });

  const onSubmit = async (data: RestaurantFormValues) => {
    setLoading(true);
    try {
      // If not first branch, ensure we use the same brand name
      const restaurantName = isFirstBranch ? data.name : restaurants[0].name;

      const response = await apiClient.post('/restaurants', {
        name: restaurantName.trim(),
        address: data.address.trim(),
        contact: data.contact.trim(),
      });

      const newRestaurant = response.data.restaurant;
      toast.success('Restaurant branch created successfully!');
      
      await refreshRestaurants();
      setSelectedRestaurantId(newRestaurant._id);
      
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(getApiError(error, 'Failed to create restaurant.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <FadeIn delay={0.1} direction="down">
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
            {isFirstBranch ? 'Setup Your Restaurant' : 'Add New Branch'}
          </h1>
          <p className="text-gray-400">
            {isFirstBranch 
              ? 'Tell us about your main restaurant brand to get started.' 
              : `Create another location for ${restaurants[0].name}.`}
          </p>
        </div>

        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 md:p-8 shadow-xl">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
            {isFirstBranch ? (
              <FormInput
                id="name"
                label="Restaurant / Brand Name"
                type="text"
                placeholder="e.g. Pizza Palace"
                error={errors.name}
                {...register('name')}
              />
            ) : (
              <div className="bg-brand-base/50 p-4 rounded-xl border border-brand-border flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xl shrink-0">
                    {restaurants[0].name.charAt(0)}
                 </div>
                 <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-0.5">Brand Name</p>
                    <p className="text-white font-bold text-lg">{restaurants[0].name}</p>
                 </div>
              </div>
            )}

            <FormInput
              id="address"
              label="Branch Address"
              type="text"
              placeholder="e.g. Phase 5, DHA, Lahore"
              error={errors.address}
              {...register('address')}
            />

            <FormInput
              id="contact"
              label="Contact Phone Number"
              type="text"
              placeholder="e.g. +92 300 1234567"
              error={errors.contact}
              {...register('contact')}
            />

            <div className="pt-4">
              <SubmitButton loading={loading} label={isFirstBranch ? "Complete Setup" : "Create Branch"} />
            </div>
          </form>
        </div>
      </FadeIn>
    </div>
  );
}
