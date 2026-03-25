'use client';

import { useState, useEffect } from 'react';
import { FaStore, FaChartLine, FaUsers, FaArrowUp, FaCheckCircle, FaBan, FaExclamationTriangle, FaRedo } from 'react-icons/fa';
import FadeIn from '@/components/ui/FadeIn';
import apiClient from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { getApiError } from '@/lib/apiError';

export default function SuperAdminOverview() {
  const [registeredRestaurants, setRegisteredRestaurants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setIsLoading(true);
      setFetchError(false);
      const response = await apiClient.get('/restaurants/all');
      if (response.data.success) {
        setRegisteredRestaurants(response.data.restaurants);
      }
    } catch (error: any) {
      setFetchError(true);
      toast.error(getApiError(error, 'Failed to load system overview data'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspendToggle = async (restaurantId: string, adminId: string, currentStatus: boolean) => {
    try {
      toast.loading(currentStatus ? 'Restoring access...' : 'Suspending system...', { id: 'suspend' });
      const res = await apiClient.put(`/auth/admin/${adminId}/suspend`);
      
      if (res.data.success) {
        toast.success(res.data.message, { id: 'suspend' });
        // Update local state without refreshing entire list
        setRegisteredRestaurants(prev => 
          prev.map(r => r._id === restaurantId 
            ? { ...r, admin_id: { ...r.admin_id, is_suspended: res.data.is_suspended } } 
            : r
          )
        );
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to toggle suspension', { id: 'suspend' });
    }
  };

  const totalRestaurants = registeredRestaurants.length;
  // Calculate active based on admin suspension status
  const activeRestaurants = registeredRestaurants.filter(r => !r.admin_id?.is_suspended).length;
  const totalItemsGlobal = registeredRestaurants.reduce((sum, r) => sum + (r.items || 0), 0);

  return (
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <FadeIn delay={0.1} direction="down">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">System Overview</h1>
        <p className="text-gray-400">High-level telemetry of the entire platform.</p>
      </FadeIn>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <FadeIn delay={0.2} direction="up">
          <div className="bg-brand-surface border border-brand-border rounded-xl p-6 relative overflow-hidden h-full">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-400 mb-1">Total Restaurants</p>
                <h3 className="text-3xl font-bold text-white tracking-tight">{totalRestaurants}</h3>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                <FaStore className="text-primary w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1 text-green-400 font-medium">
                <FaArrowUp className="w-3 h-3" /> 12%
              </span>
              <span className="text-gray-500">from last month</span>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.3} direction="up">
          <div className="bg-brand-surface border border-brand-border rounded-xl p-6 relative overflow-hidden h-full">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-400 mb-1">Active Businesses</p>
                <h3 className="text-3xl font-bold text-white tracking-tight">{activeRestaurants}</h3>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20">
                <FaCheckCircle className="text-green-500 w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              {totalRestaurants - activeRestaurants} currently suspended.
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.4} direction="up">
          <div className="bg-brand-surface border border-brand-border rounded-xl p-6 relative overflow-hidden h-full">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-400 mb-1">Global Menu Items</p>
                <h3 className="text-3xl font-bold text-white tracking-tight">{totalItemsGlobal}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                <FaChartLine className="text-blue-500 w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              Total dishes hosted across all menus.
            </div>
          </div>
        </FadeIn>
      </div>

      {/* View-Only Registered Restaurants List */}
      <FadeIn delay={0.5} direction="up" className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-brand-border bg-brand-base flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FaUsers className="text-primary w-5 h-5" />
              Registered Restaurants
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Read-only view of all businesses currently signed up on the platform.
            </p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 text-sm animate-pulse">Fetching platform data...</p>
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <FaExclamationTriangle className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-white font-semibold">Failed to load restaurants</p>
              <p className="text-gray-400 text-sm">Could not connect to the server. Please try again.</p>
              <button
                onClick={fetchRestaurants}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <FaRedo className="w-4 h-4" /> Retry
              </button>
            </div>
          ) : (
            <>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-brand-elevated border-b border-brand-border text-xs uppercase tracking-wider text-gray-400 font-semibold">
                    <th className="px-6 py-4">Restaurant Name</th>
                    <th className="px-6 py-4">Owner Contact</th>
                    <th className="px-6 py-4">Joined Date</th>
                    <th className="px-6 py-4 text-center">Menu Items</th>
                    <th className="px-6 py-4 text-center">System Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {registeredRestaurants.map((restaurant) => (
                    <tr key={restaurant._id} className="hover:bg-brand-base transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">{restaurant.name}</div>
                        {restaurant.slug && (
                          <div className="text-[10px] text-primary uppercase tracking-widest mt-0.5 font-bold">
                            /{restaurant.slug}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300">
                          {restaurant.admin_id?.name || 'Unknown Admin'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {restaurant.admin_id?.email || 'No email provided'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {restaurant.created_at 
                          ? new Date(restaurant.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) 
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-elevated border border-brand-border text-xs font-bold text-gray-300">
                          {restaurant.items || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {restaurant.admin_id && restaurant.admin_id.is_suspended === false ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                            <FaBan className="w-3 h-3" />
                            Suspended
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleSuspendToggle(restaurant._id, restaurant.admin_id?._id, restaurant.admin_id?.is_suspended)}
                          disabled={!restaurant.admin_id || restaurant.admin_id.role === 'super_admin'}
                          className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm ${
                            restaurant.admin_id?.is_suspended 
                              ? 'bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20' 
                              : 'bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {restaurant.admin_id?.is_suspended ? 'Restore Access' : 'Suspend System'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {registeredRestaurants.length === 0 && (
                <div className="px-6 py-12 text-center text-gray-400 text-sm">
                  No restaurants have registered on the platform yet.
                </div>
              )}
            </>
          )}
        </div>
      </FadeIn>
    </div>
  );
}
