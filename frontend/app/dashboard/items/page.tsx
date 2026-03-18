'use client';

import { useState, useEffect, useRef } from 'react';
import { FaPlus, FaPencilAlt, FaTrash, FaImage, FaSearch, FaTimes, FaSpinner, FaUpload } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import FadeIn from '@/components/ui/FadeIn';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/axios';

export default function MenuItemsPage() {
  const { user, updateUser } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Image file state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const previewUrlRef = useRef<string>('');
  
  // Form state maps to the actual backend MenuItem schema
  const [formData, setFormData] = useState({ 
    _id: '',
    name: '', 
    description: '', 
    price: '', 
    category_name: '', 
    discount_type: 'none',
    discount_value: '',
    image_url: '',
    imageAssetId: '' // tracks existing image asset for PUT
  });

  const fetchItems = async () => {
    if (!user || !user.restaurantId) {
       setIsLoading(false);
       return;
    }
    
    try {
      const { data } = await apiClient.get(`/restaurants/${user.restaurantId}/menu-items`);
      setItems(data.menuItems || []);
    } catch (error) {
      console.error("Failed to load menu items", error);
      toast.error("Could not load your menu items from the server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [user]);

  // Derive categories dynamically from currently fetched items
  const categories = ['All', ...Array.from(new Set(items.map(item => item.category_name).filter(Boolean)))];
  
  const filteredItems = items.filter(item => {
    const itemName = item.name || '';
    const itemCat = item.category_name || '';
    const matchesSearch = itemName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          itemCat.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || itemCat === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const closeModal = () => {
    // Revoke the object URL to avoid memory leaks
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = '';
    }
    setImageFile(null);
    setImagePreview('');
    setIsModalOpen(false);
  };

  const openAddModal = () => {
    setFormData({ 
      _id: '', 
      name: '', 
      description: '', 
      price: '', 
      category_name: activeCategory === 'All' ? '' : activeCategory,
      discount_type: 'none',
      discount_value: '',
      image_url: '',
      imageAssetId: ''
    });
    setImageFile(null);
    setImagePreview('');
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    // Pull the first image asset ID from the item if it exists
    const imageAsset = item.image_assets?.[0];
    setFormData({ 
      _id: item._id, 
      name: item.name, 
      description: item.description || '', 
      price: item.price?.toString() || '', 
      category_name: item.category_name,
      discount_type: item.discount_type || 'none',
      discount_value: item.discount_value?.toString() || '',
      image_url: item.image_url || '',
      imageAssetId: imageAsset?._id || ''
    });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !user.restaurantId) {
       toast.error("Cannot save item. Restaurant missing.");
       return;
    }

    // image_url is NOT sent here — backend manages it via /image-assets endpoint
    const payload = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      category_name: formData.category_name,
      discount_type: formData.discount_type,
      discount_value: formData.discount_type !== 'none' ? Number(formData.discount_value) : 0,
      availability: 'available'
    };

    try {
      let savedItem: any;

      if (isEditing) {
        const { data } = await apiClient.put(`/restaurants/${user.restaurantId}/menu-items/${formData._id}`, payload);
        savedItem = data.menuItem;
        setItems(prev => prev.map(item => item._id === formData._id ? savedItem : item));
        toast.success('Item updated successfully');
      } else {
        const { data } = await apiClient.post(`/restaurants/${user.restaurantId}/menu-items`, payload);
        savedItem = data.menuItem;
        setItems(prev => [savedItem, ...prev]);
        toast.success('New item added to menu');
      }

      // Upload image if a new file was selected
      if (imageFile && savedItem?._id) {
        setIsUploading(true);
        try {
          const formDataImage = new FormData();
          formDataImage.append('image', imageFile);

          let imageResponse;
          if (isEditing && formData.imageAssetId) {
            // Update existing image asset
            imageResponse = await apiClient.put(
              `/restaurants/${user.restaurantId}/menu-items/${savedItem._id}/image-assets/${formData.imageAssetId}`,
              formDataImage,
              { headers: { 'Content-Type': 'multipart/form-data' } }
            );
          } else {
            // Upload new image asset
            imageResponse = await apiClient.post(
              `/restaurants/${user.restaurantId}/menu-items/${savedItem._id}/image-assets`,
              formDataImage,
              { headers: { 'Content-Type': 'multipart/form-data' } }
            );
          }

          // Update the item in local state with the new image URL from S3
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
      // Revoke previous preview URL to avoid memory leaks
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
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
         
         <form 
            onSubmit={async (e: any) => {
              e.preventDefault();
              const name = e.target.restaurantName.value;
              try {
                // Manually create one and update auth state
                toast.loading('Creating restaurant setup...', { id: 'setup' });
                const res = await apiClient.post('/restaurants', { name });
                
                // CRITICAL FIX: The user's JWT now has a restaurant! Update the auth context so the page re-renders properly
                updateUser({ restaurantId: res.data.restaurant._id });
                
                toast.success('Restaurant created successfully!', { id: 'setup' });
              } catch (err) {
                toast.error('Failed to create restaurant setup', { id: 'setup' });
              }
            }}
            className="flex flex-col sm:flex-row gap-3 items-center max-w-sm w-full mx-auto"
         >
            <input 
              name="restaurantName"
              type="text" 
              required
              placeholder="e.g. My Awesome Cafe"
              className="w-full px-4 py-3 bg-brand-surface border border-brand-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            />
            <button type="submit" className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg whitespace-nowrap shadow-glow transition-colors">
              Create Now
            </button>
         </form>
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
              onClick={() => setActiveCategory(cat as string)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                activeCategory === cat 
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
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Item Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2.5 border border-brand-border rounded-lg bg-brand-input text-white focus:outline-none focus:border-primary"
                    placeholder="e.g. Spicy Chicken Burger"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                    <input
                      required
                      type="text"
                      value={formData.category_name}
                      onChange={e => setFormData({...formData, category_name: e.target.value})}
                      className="w-full px-3 py-2.5 border border-brand-border rounded-lg bg-brand-input text-white focus:outline-none focus:border-primary"
                      placeholder="e.g. Burgers"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Base Price ($)</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      className="w-full px-3 py-2.5 border border-brand-border rounded-lg bg-brand-input text-white focus:outline-none focus:border-primary"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Direct Discount Setup */}
                <div className="grid grid-cols-2 gap-4 bg-brand-base p-4 rounded-lg border border-brand-border">
                  <div className="col-span-2">
                    <span className="text-sm font-bold text-gray-200">Applying a Discount?</span>
                    <p className="text-xs text-gray-400 mb-2 mt-1">If this item is on sale, configure it natively right here.</p>
                  </div>
                  <div>
                    <select
                      value={formData.discount_type}
                      onChange={e => setFormData({...formData, discount_type: e.target.value, discount_value: ''})}
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
                      disabled={formData.discount_type === 'none'}
                      value={formData.discount_value}
                      onChange={e => setFormData({...formData, discount_value: e.target.value})}
                      className="w-full px-3 py-2.5 border border-brand-border rounded-lg bg-brand-input text-white focus:outline-none focus:border-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder={formData.discount_type === 'percentage' ? "e.g. 10%" : formData.discount_type === 'fixed' ? "e.g. Rs. 200" : "N/A"}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2.5 border border-brand-border rounded-lg bg-brand-input text-white focus:outline-none focus:border-primary resize-none"
                    placeholder="Brief description of the dish..."
                  />
                </div>
                
                {/* S3 Image Upload */}
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
