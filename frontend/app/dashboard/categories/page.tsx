'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FaList, FaTrash, FaPlus, FaSpinner, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import FadeIn from '@/components/ui/FadeIn';
import FormInput from '@/components/ui/FormInput';
import SubmitButton from '@/components/ui/SubmitButton';
import apiClient from '@/lib/axios';
import { getApiError } from '@/lib/apiError';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface Category {
  _id: string;
  name: string;
  createdAt?: string;
}

export default function CategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Delete modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [user]);

  const fetchCategories = async () => {
    if (!user || !user.restaurantId) return;
    try {
      // Intentionally omitting try-catch for silent failure if backend route doesn't exist yet
      const { data } = await apiClient.get(`/restaurants/${user.restaurantId}/categories`);
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        toast.error('Failed to load categories');
      }
      // If 404, the backend route simply isn't ready yet, which is expected.
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }
    if (!user?.restaurantId) return;

    setIsAdding(true);
    try {
      const { data } = await apiClient.post(`/restaurants/${user.restaurantId}/categories`, {
        name: newCategoryName.trim()
      });
      // Optionally the backend returns the created category in data.category
      if (data.category) {
        setCategories(prev => [...prev, data.category]);
      } else {
        // Fallback reload if backend didn't return the object
        await fetchCategories();
      }
      setNewCategoryName('');
      toast.success('Category created successfully');
    } catch (error: any) {
      toast.error(getApiError(error, 'Failed to create category'));
    } finally {
      setIsAdding(false);
    }
  };

  const confirmDelete = (id: string) => {
    setCategoryToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete || !user?.restaurantId) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/restaurants/${user.restaurantId}/categories/${categoryToDelete}`);
      setCategories(prev => prev.filter(c => c._id !== categoryToDelete));
      toast.success('Category deleted successfully');
    } catch (error: any) {
      toast.error(getApiError(error, 'Failed to delete category'));
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setCategoryToDelete(null);
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
                label="Create Category"
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
                <h3 className="text-white font-bold text-lg mb-2">No Categories Found</h3>
                <p className="text-gray-400 text-sm max-w-sm">
                  You haven't created any menu categories yet. Use the form to add your first category.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-brand-border">
                {categories.map((category) => (
                  <li key={category._id} className="p-4 flex items-center justify-between hover:bg-brand-base/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {category.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white font-medium">{category.name}</span>
                    </div>
                    <button
                      onClick={() => confirmDelete(category._id)}
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
        message="Are you sure you want to delete this category? This action cannot be undone."
        confirmLabel={isDeleting ? 'Deleting...' : 'Yes, Delete'}
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
