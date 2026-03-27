'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FaList, FaTrash, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import FadeIn from '@/components/ui/FadeIn';
import FormInput from '@/components/ui/FormInput';
import SubmitButton from '@/components/ui/SubmitButton';
import apiClient from '@/lib/axios';
import { getApiError } from '@/lib/apiError';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function CategoriesPage() {
  const { user, selectedRestaurantId } = useAuth();
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Delete modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchRestaurant();
  }, [user, selectedRestaurantId]);

  const fetchRestaurant = async () => {
    if (!selectedRestaurantId) return;
    setIsLoading(true);
    try {
      const { data } = await apiClient.get(`/restaurants/${selectedRestaurantId}`);
      if (data.restaurant && data.restaurant.categories) {
        setCategories(data.restaurant.categories);
      }
    } catch (error: any) {
      toast.error('Failed to load restaurant categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newCategoryName.trim();
    if (!cleanName) {
      toast.error('Category name cannot be empty');
      return;
    }
    
    // Check for duplicates case-insensitively
    const isDuplicate = categories.some(cat => cat.toLowerCase() === cleanName.toLowerCase());
    if (isDuplicate) {
      toast.error('This category already exists');
      return;
    }

    if (!selectedRestaurantId) return;

    setIsAdding(true);
    try {
      const updatedCategories = [...categories, cleanName];
      // PUT updated categories array back to the restaurant model
      const { data } = await apiClient.put(`/restaurants/${selectedRestaurantId}`, {
        categories: updatedCategories
      });
      
      if (data.restaurant && data.restaurant.categories) {
        setCategories(data.restaurant.categories);
      } else {
        setCategories(updatedCategories);
      }
      
      setNewCategoryName('');
      toast.success('Category saved successfully');
    } catch (error: any) {
      toast.error(getApiError(error, 'Failed to update category list'));
    } finally {
      setIsAdding(false);
    }
  };

  const confirmDelete = (cat: string) => {
    setCategoryToDelete(cat);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete || !selectedRestaurantId) return;
    setIsDeleting(true);
    try {
      const updatedCategories = categories.filter(c => c !== categoryToDelete);
      
      const { data } = await apiClient.put(`/restaurants/${selectedRestaurantId}`, {
        categories: updatedCategories
      });
      
      if (data.restaurant && data.restaurant.categories) {
        setCategories(data.restaurant.categories);
      } else {
        setCategories(updatedCategories);
      }
      
      toast.success('Category removed');
    } catch (error: any) {
      toast.error(getApiError(error, 'Failed to delete category'));
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setCategoryToDelete(null);
    }
  };

  if (isLoading && selectedRestaurantId) {
    return (
      <div className="flex justify-center items-center py-20">
        <FaSpinner className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  if (!selectedRestaurantId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6">
          <FaList className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">No Branch Selected</h2>
        <p className="text-gray-400 max-w-sm mx-auto mb-8">
          Please select a restaurant branch from the sidebar to manage its menu categories.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl pb-8">
      <FadeIn delay={0.1} direction="down" className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <FaList className="text-primary w-6 h-6" /> Menu Categories
          </h1>
          <p className="text-gray-400 text-sm">
            Create and manage categories to organize your menu items.
          </p>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* ADD CATEGORY FORM */}
        <div className="md:col-span-1">
          <FadeIn delay={0.2} direction="up" className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-sm sticky top-8">
            <h2 className="text-lg font-bold text-white mb-4">Add New Category</h2>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <FormInput
                id="categoryName"
                label="Category Name"
                type="text"
                placeholder="e.g., Beverages, Desserts"
                value={newCategoryName}
                onChange={(e: any) => setNewCategoryName(e.target.value)}
              />
              <SubmitButton
                loading={isAdding}
                label="Save Category"
                className="w-full"
              />
            </form>
          </FadeIn>
        </div>

        {/* LIST CATEGORIES */}
        <div className="md:col-span-2">
          <FadeIn delay={0.3} direction="up" className="bg-brand-surface border border-brand-border rounded-xl shadow-sm overflow-hidden">
            {categories.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-brand-base rounded-full flex items-center justify-center mb-4">
                  <FaList className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">No Categories Confirmed</h3>
                <p className="text-gray-400 text-sm max-w-sm">
                  Use the form to add your first category. It will immediately appear when adding menu items!
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-brand-border">
                {categories.map((catString, idx) => (
                  <li key={idx} className="p-4 flex items-center justify-between hover:bg-brand-base/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {catString.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white font-medium">{catString}</span>
                    </div>
                    <button
                      onClick={() => confirmDelete(catString)}
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                      title="Delete Category"
                    >
                      <FaTrash />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </FadeIn>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Category"
        message="Are you sure you want to delete this category string? Any existing items using this category will remain, but the category won't show in the dropdown anymore."
        confirmLabel={isDeleting ? 'Deleting...' : 'Yes, Delete'}
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
