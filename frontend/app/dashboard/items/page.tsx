'use client';

import { useState, useEffect, useRef } from 'react';
import { FaPlus, FaPencilAlt, FaTrash, FaImage, FaSearch, FaTimes, FaSpinner, FaUpload, FaExclamationTriangle, FaRedo } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import FadeIn from '@/components/ui/FadeIn';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/axios';
import { getApiError } from '@/lib/apiError';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const restaurantSetupSchema = z.object({
  restaurantName: z.string().min(1, 'Restaurant name is required')
});
type RestaurantSetupValues = z.infer<typeof restaurantSetupSchema>;

const variantSchema = z.object({
  name: z.string().min(1, 'Required'),
  price: z.coerce.number().min(0.01, 'Min $0.01'),
});

const menuItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  category_name: z.string().min(1, 'Category is required'),
  price: z.coerce.number({ message: 'Price must be a number' }).min(0, 'Price must be 0 or higher'),
  discount_type: z.enum(['none', 'percentage', 'fixed']),
  discount_value: z.coerce.number().min(0).optional(),
  description: z.string().min(1, 'Description is required'),
  variant: z.array(variantSchema).optional().default([]),
}).superRefine((data, ctx) => {
  if (data.discount_type === 'percentage' && (data.discount_value || 0) > 100) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Max 100%', path: ['discount_value'] });
  }
  if (data.discount_type !== 'none' && (data.discount_value || 0) <= 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Must be > 0', path: ['discount_value'] });
  }
});
type MenuItemValues = z.infer<typeof menuItemSchema>;

export default function MenuItemsPage() {
  const { user, updateUser } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [availableCategories, setAvailableCategories] = useState<{_id: string, name: string}[]>([]);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Custom tracking logic for ID and images since Zod doesn't need to validate these meta fields
  const [itemId, setItemId] = useState('');
  const [imageAssetId, setImageAssetId] = useState('');
  
  // Image file state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const previewUrlRef = useRef<string>('');

  const setupForm = useForm<RestaurantSetupValues>({
    resolver: zodResolver(restaurantSetupSchema)
  });

  const itemForm = useForm<MenuItemValues>({
    resolver: zodResolver(menuItemSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category_name: '',
      discount_type: 'none',
      discount_value: 0,
      variant: []
    }
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control: itemForm.control,
    name: "variant"
  });

  // Derived state to make UI react to discount_type changes
  const discountType = itemForm.watch('discount_type');

  const fetchItems = async () => {
    if (!user || !user.restaurantId) {
      setIsLoading(false);
      return;
    }
    setFetchError(false);
    try {
      const { data } = await apiClient.get(`/restaurants/${user.restaurantId}/menu-items`);
      setItems(data.menuItems || []);
    } catch (error: any) {
      setFetchError(true);
      toast.error(getApiError(error, 'Could not load your menu items from the server.'));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    if (!user || !user.restaurantId) return;
    try {
      const { data } = await apiClient.get(`/restaurants/${user.restaurantId}/categories`);
      if (data.categories) {
        setAvailableCategories(data.categories);
      }
    } catch (error) {
      // Sielntly fail if backend fails or doesn't exist yet
    }
  };

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, [user]);

  const categories = ['All', ...Array.from(new Set(items.map(item => item.category_name).filter(Boolean)))];
  
  const filteredItems = items.filter(item => {
    const itemName = item.name || '';
    const itemCat = item.category_name || '';
    const matchesSearch = itemName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          itemCat.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeTab === 'All' || itemCat === activeTab;
    
    return matchesSearch && matchesCategory;
  });

  const closeModal = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = '';
    }
    setImageFile(null);
    setImagePreview('');
    setIsModalOpen(false);
  };

  const openAddModal = () => {
    itemForm.reset({
      name: '',
      description: '',
      price: 0,
      category_name: activeTab === 'All' ? '' : activeTab,
      discount_type: 'none',
      discount_value: 0
    });
    setItemId('');
    setImageAssetId('');
    setImageFile(null);
    setImagePreview('');
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    const imageAsset = item.image_assets?.[0];
    itemForm.reset({
      name: item.name,
      description: item.description || '',
      price: Number(item.price) || 0,
      category_name: item.category_name,
      discount_type: item.discount_type || 'none',
      discount_value: Number(item.discount_value) || 0,
      variant: item.variant || []
    });
    setItemId(item._id);
    setImageAssetId(imageAsset?._id || '');
    setImageFile(null);
    setImagePreview(item.image_url || '');
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (item: any) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-white font-medium">Delete {item.name}?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                await apiClient.delete(`/restaurants/${user?.restaurantId}/menu-items/${item._id}`);
                setItems(prev => prev.filter(i => i._id !== item._id));
                toast.dismiss(t.id);
                toast.success(`${item.name} deleted`);
              } catch (err) {
                toast.dismiss(t.id);
                toast.error("Failed to delete item.");
              }
            }}
            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-md transition-colors"
          >
            Confirm Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 bg-brand-surface border border-brand-border text-white text-xs font-medium rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const onSetupSubmit = async (data: RestaurantSetupValues) => {
    try {
      toast.loading('Creating restaurant setup...', { id: 'setup' });
      const res = await apiClient.post('/restaurants', { name: data.restaurantName });
      
      updateUser({ restaurantId: res.data.restaurant._id });
      
      toast.success('Restaurant created successfully!', { id: 'setup' });
    } catch (err) {
      toast.error('Failed to create restaurant setup', { id: 'setup' });
    }
  };

  const onItemSubmit = async (data: MenuItemValues) => {
    if (!user || !user.restaurantId) {
       toast.error("Cannot save item. Restaurant missing.");
       return;
    }

    const payload = {
      name: data.name,
      description: data.description,
      price: data.price,
      category_name: data.category_name,
      discount_type: data.discount_type,
      discount_value: data.discount_type !== 'none' ? data.discount_value : 0,
      variant: data.variant,
      availability: 'available'
    };

    try {
      let savedItem: any;

      if (isEditing) {
        const res = await apiClient.put(`/restaurants/${user.restaurantId}/menu-items/${itemId}`, payload);
        savedItem = res.data.menuItem;
        setItems(prev => prev.map(item => item._id === itemId ? savedItem : item));
        toast.success('Item updated successfully');
      } else {
        const res = await apiClient.post(`/restaurants/${user.restaurantId}/menu-items`, payload);
        savedItem = res.data.menuItem;
        setItems(prev => [savedItem, ...prev]);
        toast.success('New item added to menu');
      }

      if (imageFile && savedItem?._id) {
        setIsUploading(true);
        try {
          const formDataImage = new FormData();
          formDataImage.append('image', imageFile);

          let imageResponse;
          if (isEditing && imageAssetId) {
            imageResponse = await apiClient.put(
              `/restaurants/${user.restaurantId}/menu-items/${savedItem._id}/image-assets/${imageAssetId}`,
              formDataImage,
              { headers: { 'Content-Type': 'multipart/form-data' } }
            );
          } else {
            imageResponse = await apiClient.post(
              `/restaurants/${user.restaurantId}/menu-items/${savedItem._id}/image-assets`,
              formDataImage,
              { headers: { 'Content-Type': 'multipart/form-data' } }
            );
          }

          const uploadedAsset = imageResponse.data?.imageAsset || imageResponse.data;
          const newImageUrl = uploadedAsset?.original_url || uploadedAsset?.image_url || uploadedAsset?.url || '';
          if (newImageUrl) {
            setItems(prev => prev.map(item =>
              item._id === savedItem._id ? { ...item, image_url: newImageUrl } : item
            ));
          }
          toast.success('Image uploaded successfully');
        } catch (imgErr: any) {
          toast.error(imgErr.response?.data?.message || 'Item saved, but image upload failed.');
        } finally {
          setIsUploading(false);
        }
      }

      closeModal();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save menu item');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Only .jpg, .png, and .webp formats are supported');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5 MB');
        return;
      }
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      const objectUrl = URL.createObjectURL(file);
      previewUrlRef.current = objectUrl;
      setImageFile(file);
      setImagePreview(objectUrl);
    }
  };

  if (!user?.restaurantId && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
         <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6">
           <FaPlus className="w-8 h-8 text-primary" />
         </div>
         <h2 className="text-2xl font-bold text-white mb-3">Configure Your Restaurant First</h2>
         <p className="text-gray-400 max-w-md mx-auto mb-8">You need an active restaurant configuration before you can add menu items. It seems your account hasn't been linked to a restaurant yet.</p>
         
         <form onSubmit={setupForm.handleSubmit(onSetupSubmit)} className="w-full max-w-sm mx-auto" noValidate>
            <div className="flex flex-col sm:flex-row gap-3 items-start w-full">
              <div className="w-full flex-1">
                <input 
                  type="text" 
                  {...setupForm.register('restaurantName')}
                  placeholder="e.g. My Awesome Cafe"
                  className={`w-full px-4 py-3 bg-brand-surface border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${setupForm.formState.errors.restaurantName ? 'border-red-500 focus:border-red-500 text-sm' : 'border-brand-border focus:border-primary'}`}
                />
                {setupForm.formState.errors.restaurantName && <p className="mt-1 text-sm text-red-500 text-left">{setupForm.formState.errors.restaurantName.message}</p>}
              </div>
              <button type="submit" className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg whitespace-nowrap shadow-glow transition-colors mt-0">
                Create Now
              </button>
            </div>
         </form>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
          <FaExclamationTriangle className="w-7 h-7 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Failed to Load Menu Items</h2>
        <p className="text-gray-400 text-sm max-w-xs mb-6">
          Could not fetch your menu items from the server. Please check your connection and try again.
        </p>
        <button
          onClick={fetchItems}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <FaRedo className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <FadeIn delay={0.1} direction="down" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Menu Items</h1>
          <p className="text-gray-400 text-sm">Manage the dishes available on your digital menu.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-lg font-semibold transition-colors shadow-glow shrink-0"
        >
          <FaPlus className="w-4 h-4" />
          Add New Item
        </button>
      </FadeIn>

      <FadeIn delay={0.2} direction="up" className="bg-brand-surface border border-brand-border rounded-xl p-4 sm:p-6 mb-6">
        <div className="relative max-w-md w-full mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-brand-border rounded-lg leading-5 bg-brand-base text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat as string)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                activeTab === cat 
                  ? 'bg-primary text-white shadow-glow border border-primary' 
                  : 'bg-brand-base border border-brand-border text-gray-400 hover:text-white hover:bg-brand-elevated'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </FadeIn>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
           <FaSearch className="w-8 h-8 text-primary animate-ping" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.length === 0 ? (
            <div className="col-span-full bg-brand-surface border border-brand-elevated rounded-xl p-8 text-center">
              <p className="text-gray-400">No menu items found. Try adjusting your search or add a new item.</p>
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <FadeIn key={item._id} delay={0.3 + index * 0.1} direction="up">
                <div className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors flex flex-col h-full">
                  
                  {/* Functional Image Area */}
                  <div 
                    className="h-40 bg-brand-elevated flex items-center justify-center border-b border-brand-border relative group p-4 text-center bg-cover bg-center"
                    style={{ backgroundImage: item.image_url ? `url(${item.image_url})` : 'none' }}
                  >
                    {!item.image_url && <FaImage className="w-12 h-12 text-gray-600 mb-2 opacity-50" />}
                    {item.image_url && <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>}
                    <span className="absolute top-3 right-3 bg-brand-base/80 backdrop-blur-sm border border-brand-border px-2.5 py-1 rounded-md text-xs font-semibold text-primary z-10">
                      {item.category_name}
                    </span>
                  </div>
                  
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2 gap-4">
                      <h3 className="text-lg font-bold text-white leading-tight">{item.name}</h3>
                      
                      {/* Price with possible discount logic inline */}
                      <div className="text-right">
                        {(() => {
                          if (item.discount_type && item.discount_type !== 'none' && item.discount_value > 0) {
                            const discountedPrice = item.discount_type === 'percentage' 
                              ? Number(item.price) - (Number(item.price) * (item.discount_value / 100))
                              : Math.max(0, Number(item.price) - item.discount_value);
                              
                            return (
                              <div className="flex flex-col items-end">
                                <span className="text-gray-500 line-through text-xs font-medium">Rs. {Number(item.price).toFixed(2)}</span>
                                <span className="text-green-400 font-bold whitespace-nowrap">Rs. {discountedPrice.toFixed(2)}</span>
                              </div>
                            );
                          }
                          return <span className="text-primary font-bold whitespace-nowrap">Rs. {Number(item.price).toFixed(2)}</span>;
                        })()}
                      </div>
                    </div>
                    
                    {/* Badge if discount is applied */}
                    {item.discount_type && item.discount_type !== 'none' && item.discount_value > 0 && (
                      <div className="mb-2">
                         <span className="inline-block bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded border border-green-500/20 font-medium tracking-wide">
                           {item.discount_type === 'percentage' ? `${item.discount_value}% OFF deal` : `Rs. ${item.discount_value} OFF deal`}
                         </span>
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-400 mb-6 flex-1 line-clamp-3">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center gap-3 pt-4 border-t border-brand-border mt-auto">
                      <button 
                        onClick={() => openEditModal(item)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-brand-elevated hover:bg-brand-base border border-brand-border rounded-lg text-sm font-medium text-white transition-colors"
                      >
                        <FaPencilAlt className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(item)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 rounded-lg text-sm font-medium transition-colors"
                      >
                        <FaTrash className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={closeModal} />
          
          <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-lg relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between shrink-0">
              <h2 className="text-xl font-bold text-white">
                {isEditing ? 'Edit Menu Item' : 'Add Menu Item'}
              </h2>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={itemForm.handleSubmit(onItemSubmit)} className="p-6 overflow-y-auto" noValidate>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Item Name</label>
                  <input
                    type="text"
                    {...itemForm.register('name')}
                    className={`w-full px-3 py-2.5 border rounded-lg bg-brand-input text-white focus:outline-none transition-colors ${itemForm.formState.errors.name ? 'border-red-500 focus:border-red-500' : 'border-brand-border focus:border-primary'}`}
                    placeholder="e.g. Spicy Chicken Burger"
                  />
                  {itemForm.formState.errors.name && <p className="mt-1 text-sm text-red-500">{itemForm.formState.errors.name.message}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                    <select
                      {...itemForm.register('category_name')}
                      className={`w-full px-3 py-2.5 border rounded-lg bg-brand-input text-white focus:outline-none transition-colors appearance-none ${itemForm.formState.errors.category_name ? 'border-red-500 focus:border-red-500' : 'border-brand-border focus:border-primary'}`}
                    >
                      <option value="" disabled>Select a Category...</option>
                      {availableCategories.length === 0 ? (
                        <option value="" disabled>No categories found - please create one first</option>
                      ) : (
                        availableCategories.map(cat => (
                          <option key={cat._id} value={cat.name}>{cat.name}</option>
                        ))
                      )}
                    </select>
                    {itemForm.formState.errors.category_name && <p className="mt-1 text-sm text-red-500">{itemForm.formState.errors.category_name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Base Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      {...itemForm.register('price')}
                      className={`w-full px-3 py-2.5 border rounded-lg bg-brand-input text-white focus:outline-none transition-colors ${itemForm.formState.errors.price ? 'border-red-500 focus:border-red-500' : 'border-brand-border focus:border-primary'}`}
                      placeholder="0.00"
                    />
                    {itemForm.formState.errors.price && <p className="mt-1 text-sm text-red-500">{itemForm.formState.errors.price.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-brand-base p-4 rounded-lg border border-brand-border">
                  <div className="col-span-2">
                    <span className="text-sm font-bold text-gray-200">Applying a Discount?</span>
                    <p className="text-xs text-gray-400 mb-2 mt-1">If this item is on sale, configure it natively right here.</p>
                  </div>
                  <div>
                    <select
                      {...itemForm.register('discount_type', {
                        onChange: (e) => itemForm.setValue('discount_value', 0)
                      })}
                      className="w-full px-3 py-2.5 border border-brand-border rounded-lg bg-brand-input text-white focus:outline-none focus:border-primary appearance-none text-sm"
                    >
                      <option value="none">No Discount</option>
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount ($)</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      disabled={discountType === 'none'}
                      {...itemForm.register('discount_value')}
                      className={`w-full px-3 py-2.5 border rounded-lg bg-brand-input text-white focus:outline-none text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${itemForm.formState.errors.discount_value ? 'border-red-500 focus:border-red-500' : 'border-brand-border focus:border-primary'}`}
                      placeholder={discountType === 'percentage' ? "e.g. 10%" : discountType === 'fixed' ? "e.g. Rs. 200" : "N/A"}
                    />
                    {itemForm.formState.errors.discount_value && <p className="mt-1 text-sm text-red-500">{itemForm.formState.errors.discount_value.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                  <textarea
                    rows={3}
                    {...itemForm.register('description')}
                    className={`w-full px-3 py-2.5 border rounded-lg bg-brand-input text-white focus:outline-none resize-none transition-colors ${itemForm.formState.errors.description ? 'border-red-500 focus:border-red-500' : 'border-brand-border focus:border-primary'}`}
                    placeholder="Brief description of the dish..."
                  />
                  {itemForm.formState.errors.description && <p className="mt-1 text-sm text-red-500">{itemForm.formState.errors.description.message}</p>}
                </div>

                <div className="bg-brand-elevated border border-brand-border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-gray-200">Item Variants (Optional)</span>
                    <button type="button" onClick={() => appendVariant({ name: '', price: 0.01 })} className="text-xs bg-brand-base border border-brand-border px-2 py-1 rounded text-white flex items-center gap-1 hover:bg-brand-surface"><FaPlus/> Add Variant</button>
                  </div>
                  {variantFields.length === 0 && <p className="text-xs text-gray-400">No variants added. E.g. Small, Large, Extra Spicy</p>}
                  {variantFields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-2 mb-3">
                      <div className="flex-1">
                        <input {...itemForm.register(`variant.${index}.name`)} placeholder="e.g. Large" className="w-full px-2 py-1.5 bg-brand-input border border-brand-border rounded text-sm text-white" />
                        {itemForm.formState.errors.variant?.[index]?.name && <p className="text-red-500 text-xs mt-1">{itemForm.formState.errors.variant[index]?.name?.message}</p>}
                      </div>
                      <div className="w-24">
                        <input type="number" step="0.01" {...itemForm.register(`variant.${index}.price`)} placeholder="Price" className="w-full px-2 py-1.5 bg-brand-input border border-brand-border rounded text-sm text-white" />
                        {itemForm.formState.errors.variant?.[index]?.price && <p className="text-red-500 text-xs mt-1">{itemForm.formState.errors.variant[index]?.price?.message}</p>}
                      </div>
                      <button type="button" onClick={() => removeVariant(index)} className="p-2 text-red-500 hover:bg-red-500/10 rounded mt-0.5"><FaTrash className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Item Image</label>
                  
                  {imagePreview ? (
                    <div className="relative h-40 w-full rounded-lg border border-brand-border overflow-hidden bg-brand-base flex items-center justify-center">
                      <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                      {imageFile && (
                        <div className="absolute top-2 left-2 bg-primary/80 text-white text-xs px-2 py-0.5 rounded font-medium">
                          New file selected
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <button 
                          type="button" 
                          onClick={() => {
                            if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
                            previewUrlRef.current = '';
                            setImageFile(null);
                            setImagePreview('');
                          }}
                          className="px-3 py-1.5 bg-red-500 hover:bg-red-600 rounded text-xs font-medium text-white mb-2"
                        >
                          Remove Image
                        </button>
                        <label className="px-3 py-1.5 bg-brand-elevated border border-brand-border rounded text-xs font-medium text-white cursor-pointer">
                          Replace Image
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-brand-border border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center bg-brand-base relative">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      />
                      <FaUpload className="w-8 h-8 text-gray-500 mb-2" />
                      <p className="text-sm text-gray-400 mb-2">Drag and drop an image, or click to browse</p>
                      <p className="text-xs text-gray-500 mb-2">Will be uploaded to AWS S3</p>
                      <button type="button" className="px-4 py-1.5 bg-brand-elevated border border-brand-border rounded-md text-xs font-medium text-white pointer-events-none">
                        Select File
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-brand-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 bg-brand-base hover:bg-brand-elevated border border-brand-border text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg shadow-glow transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUploading ? (
                    <><FaSpinner className="animate-spin w-4 h-4" /> Uploading image...</>
                  ) : (
                    isEditing ? 'Save Changes' : 'Add Item'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
