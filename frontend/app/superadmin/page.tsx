'use client';

import { useState, useEffect } from 'react';
import { FaStore, FaChartLine, FaUsers, FaArrowUp, FaCheckCircle, FaBan } from 'react-icons/fa';
import FadeIn from '@/components/ui/FadeIn';

export default function SuperAdminOverview() {
  const [registeredRestaurants, setRegisteredRestaurants] = useState<any[]>([]);

  useEffect(() => {
    // Read from localStorage simulating the real DB
    const users = JSON.parse(localStorage.getItem('qr-menu-users') || '[]');
    setRegisteredRestaurants(users.filter((u: any) => u.role === 'RESTAURANT_ADMIN'));
  }, []);

  const totalRestaurants = registeredRestaurants.length;
  const activeRestaurants = registeredRestaurants.filter(r => r.status === 'active').length;
  // Fall back to 0 items if not set since we aren't tracking all item arrays globally yet
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
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-elevated border-b border-brand-border text-xs uppercase tracking-wider text-gray-400 font-semibold">
                <th className="px-6 py-4">Restaurant Name</th>
                <th className="px-6 py-4">Owner Contact</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-center">Menu Items</th>
                <th className="px-6 py-4 text-right">System Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {registeredRestaurants.map((restaurant) => (
                <tr key={restaurant.id} className="hover:bg-brand-base transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{restaurant.restaurantName || restaurant.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-300">{restaurant.firstName} {restaurant.lastName}</div>
                    <div className="text-xs text-gray-500">{restaurant.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {restaurant.joinedAt ? new Date(restaurant.joinedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-elevated border border-brand-border text-xs font-bold text-gray-300">
                      {restaurant.items || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {restaurant.status === 'active' ? (
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
                </tr>
              ))}
            </tbody>
          </table>
          {registeredRestaurants.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-400 text-sm">
              No restaurants have registered on the platform yet.
            </div>
          )}
        </div>
      </FadeIn>
    </div>
  );
}
