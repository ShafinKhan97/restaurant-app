'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaPencilAlt, FaTrash, FaImage, FaSearch, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import FadeIn from '@/components/ui/FadeIn';

export default function MenuItemsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Load data from local storage on mount
  useEffect(() => {
    const savedItems = localStorage.getItem('qr-menu-items');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }

    const savedDiscounts = localStorage.getItem('qr-menu-discounts');
    if (savedDiscounts) {
      setDiscounts(JSON.parse(savedDiscounts));
    }
  }, []);

  // Save to local storage whenever items change
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem('qr-menu-items', JSON.stringify(items));
    }
  }, [items]);

  // Get unique categories dynamically
  const categories = ['All', ...Array.from(new Set(items.map(item => item.category)))];
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({ id: 0, name: '', description: '', price: '', category: '', discountId: '' });

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const openAddModal = () => {
    setFormData({ 
      id: 0, 
      name: '', 
      description: '', 
      price: '', 
      category: activeCategory === 'All' ? '' : activeCategory,
      discountId: ''
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setFormData({ ...item, price: item.price.toString(), discountId: item.discountId || '' });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (item: any) => {
    // Custom toast implementation for deletion confirmation
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-white font-medium">Delete {item.name}?</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setItems(items.filter(i => i.id !== item.id));
              toast.dismiss(t.id);
              toast.success(`${item.name} deleted`);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      setItems(items.map(item => item.id === formData.id ? { ...formData, id: item.id, price: parseFloat(formData.price) } : item));
      toast.success('Item updated successfully');
    } else {
      // Add new item to the TOP of the list
      setItems([{ ...formData, id: Date.now(), price: parseFloat(formData.price) }, ...items]);
      toast.success('New item added to menu');
    }
    setIsModalOpen(false);
  };

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
              onClick={() => setActiveCategory(cat)}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length === 0 ? (
          <div className="col-span-full bg-brand-surface border border-brand-elevated rounded-xl p-8 text-center">
            <p className="text-gray-400">No menu items found. Try adjusting your search or add a new item.</p>
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <FadeIn key={item.id} delay={0.3 + index * 0.1} direction="up">
              <div className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors flex flex-col h-full">
                
                {/* Mock Image Area */}
                <div className="h-40 bg-brand-elevated flex items-center justify-center border-b border-brand-border relative group p-4 text-center">
                  <FaImage className="w-12 h-12 text-gray-600 mb-2 opacity-50" />
                  <span className="absolute top-3 right-3 bg-brand-base/80 backdrop-blur-sm border border-brand-border px-2.5 py-1 rounded-md text-xs font-semibold text-primary">
                    {item.category}
                  </span>
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2 gap-4">
                    <h3 className="text-lg font-bold text-white leading-tight">{item.name}</h3>
                    
                    {/* Price with possible discount logic inline */}
                    <div className="text-right">
                      {(() => {
                        const appliedDiscount = item.discountId 
                          ? discounts.find(d => d.id.toString() === item.discountId.toString() && d.active) 
                          : null;
                        
                        if (appliedDiscount) {
                          const discountedPrice = appliedDiscount.type === 'percentage' 
                            ? Number(item.price) - (Number(item.price) * (appliedDiscount.value / 100))
                            : Math.max(0, Number(item.price) - appliedDiscount.value);
                            
                          return (
                            <div className="flex flex-col items-end">
                              <span className="text-gray-500 line-through text-xs font-medium">${Number(item.price).toFixed(2)}</span>
                              <span className="text-green-400 font-bold whitespace-nowrap">${discountedPrice.toFixed(2)}</span>
                            </div>
                          );
                        }
                        return <span className="text-primary font-bold whitespace-nowrap">${Number(item.price).toFixed(2)}</span>;
                      })()}
                    </div>
                  </div>
                  
                  {/* Badge if discount is applied */}
                  {item.discountId && discounts.find(d => d.id.toString() === item.discountId.toString() && d.active) && (
                    <div className="mb-2">
                       <span className="inline-block bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded border border-green-500/20 font-medium">
                         {discounts.find(d => d.id.toString() === item.discountId.toString())?.name} Applied
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-lg relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between shrink-0">
              <h2 className="text-xl font-bold text-white">
                {isEditing ? 'Edit Menu Item' : 'Add Menu Item'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
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
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
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

                {/* Discount Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Apply Discount</label>
                  <select
                    value={formData.discountId}
                    onChange={e => setFormData({...formData, discountId: e.target.value})}
                    className="w-full px-3 py-2.5 border border-brand-border rounded-lg bg-brand-input text-white focus:outline-none focus:border-primary appearance-none"
                  >
                    <option value="">No Discount</option>
                    {discounts.filter(d => d.active).map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.type === 'percentage' ? `${d.value}% Off` : `$${d.value.toFixed(2)} Off`})
                      </option>
                    ))}
                  </select>
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
                
                {/* File input mockup */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Item Image</label>
                  <div className="border border-brand-border border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center bg-brand-base">
                    <FaImage className="w-8 h-8 text-gray-500 mb-2" />
                    <p className="text-sm text-gray-400 mb-2">Drag and drop an image, or click to browse</p>
                    <button type="button" className="px-4 py-1.5 bg-brand-elevated border border-brand-border rounded-md text-xs font-medium text-white hover:bg-brand-strong transition-colors">
                      Select File
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-brand-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-brand-base hover:bg-brand-elevated border border-brand-border text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg shadow-glow transition-colors"
                >
                  {isEditing ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
