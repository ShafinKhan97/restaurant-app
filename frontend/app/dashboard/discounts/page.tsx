'use client';

import { useState } from 'react';
import { FaPlus, FaPencilAlt, FaTrash, FaPercent, FaTimes, FaDollarSign } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import FadeIn from '@/components/ui/FadeIn';

// Mock data for discounts
const initialDiscounts = [
  { id: 1, name: 'Summer Special', type: 'percentage', value: 15, active: true },
  { id: 2, name: 'Happy Hour', type: 'flat', value: 5.00, active: false },
];

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState(initialDiscounts);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({ id: 0, name: '', type: 'percentage', value: '', active: true });

  const openAddModal = () => {
    setFormData({ id: 0, name: '', type: 'percentage', value: '', active: true });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (discount: any) => {
    setFormData({ ...discount, value: discount.value.toString() });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (discount: any) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-white font-medium">Delete {discount.name}?</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setDiscounts(discounts.filter(d => d.id !== discount.id));
              toast.dismiss(t.id);
              toast.success(`${discount.name} deleted`);
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

  const handleToggleActive = (id: number) => {
    setDiscounts(discounts.map(d => {
      if (d.id === id) {
        const newStatus = !d.active;
        toast.success(`${d.name} ${newStatus ? 'activated' : 'deactivated'}`);
        return { ...d, active: newStatus };
      }
      return d;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      setDiscounts(discounts.map(d => d.id === formData.id ? { ...formData, id: d.id, value: parseFloat(formData.value) } : d));
      toast.success('Discount updated successfully');
    } else {
      setDiscounts([{ ...formData, id: Date.now(), value: parseFloat(formData.value) }, ...discounts]);
      toast.success('New discount created');
    }
    setIsModalOpen(false);
  };

  return (
    <div className="pb-8">
      <FadeIn delay={0.1} direction="down" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Discounts & Offers</h1>
          <p className="text-gray-400 text-sm">Create and manage discounts to boost your sales.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-lg font-semibold transition-colors shadow-glow shrink-0"
        >
          <FaPlus className="w-4 h-4" />
          Create Discount
        </button>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {discounts.length === 0 ? (
          <div className="col-span-full bg-brand-surface border border-brand-elevated rounded-xl p-8 text-center">
            <p className="text-gray-400">No active discounts found. Create one to get started.</p>
          </div>
        ) : (
          discounts.map((discount, index) => (
            <FadeIn key={discount.id} delay={0.2 + index * 0.1} direction="up">
              <div className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors flex flex-col h-full">
                
                {/* Header Area */}
                <div className={`p-5 flex items-start justify-between border-b border-brand-border ${discount.active ? 'bg-primary/5' : 'bg-brand-elevated'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${discount.active ? 'bg-primary/20 text-primary' : 'bg-brand-base text-gray-400'}`}>
                      {discount.type === 'percentage' ? <FaPercent className="w-4 h-4" /> : <FaDollarSign className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white leading-tight">{discount.name}</h3>
                      <p className="text-xs text-gray-400">
                        {discount.type === 'percentage' ? `${discount.value}% Off` : `$${discount.value.toFixed(2)} Off`}
                      </p>
                    </div>
                  </div>
                  
                  {/* Status Toggle */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={discount.active}
                      onChange={() => handleToggleActive(discount.id)}
                    />
                    <div className="w-11 h-6 bg-brand-base peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-brand-border"></div>
                  </label>
                </div>
                
                <div className="p-5 flex flex-col flex-1 pb-4">
                  <div className="flex items-center gap-3 mt-auto pt-2">
                    <button 
                      onClick={() => openEditModal(discount)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-brand-elevated hover:bg-brand-base border border-brand-border rounded-lg text-sm font-medium text-white transition-colors"
                    >
                      <FaPencilAlt className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(discount)}
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
          
          <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-md relative z-10 shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between shrink-0">
              <h2 className="text-xl font-bold text-white">
                {isEditing ? 'Edit Discount' : 'Create Discount'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Discount Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2.5 border border-brand-border rounded-lg bg-brand-input text-white focus:outline-none focus:border-primary"
                    placeholder="e.g. Summer Sale 2026"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Discount Type</label>
                    <select
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value})}
                      className="w-full px-3 py-2.5 border border-brand-border rounded-lg bg-brand-input text-white focus:outline-none focus:border-primary appearance-none"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Amount ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Value {formData.type === 'percentage' ? '(%)' : '($)'}
                    </label>
                    <input
                      required
                      type="number"
                      step={formData.type === 'percentage' ? '1' : '0.01'}
                      min="0"
                      max={formData.type === 'percentage' ? '100' : undefined}
                      value={formData.value}
                      onChange={e => setFormData({...formData, value: e.target.value})}
                      className="w-full px-3 py-2.5 border border-brand-border rounded-lg bg-brand-input text-white focus:outline-none focus:border-primary"
                      placeholder="e.g. 15"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={formData.active}
                      onChange={(e) => setFormData({...formData, active: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-brand-base peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-brand-border"></div>
                  </label>
                  <span className="text-sm text-gray-300">Active Immediately</span>
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
                  {isEditing ? 'Save Changes' : 'Create Discount'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
