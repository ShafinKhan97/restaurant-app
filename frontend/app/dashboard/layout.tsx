'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { 
  FaChartPie, 
  FaUser, 
  FaUtensils, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaQrcode,
  FaList,
  FaCog
} from 'react-icons/fa';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, isRestaurantsLoading, logout, restaurants, selectedRestaurantId, setSelectedRestaurantId } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (!isLoading && !isRestaurantsLoading && user) {
      if (user.role === 'super_admin') {
        router.push('/superadmin');
      } else if (user.role === 'restaurant_admin' && restaurants.length === 0 && pathname !== '/dashboard/restaurants/new') {
        router.push('/dashboard/restaurants/new');
      }
    }
  }, [user, isLoading, isRestaurantsLoading, router, restaurants, pathname]);

  if (isLoading || !user || user.role === 'super_admin') {
    return (
      <div className="h-screen flex items-center justify-center bg-brand-base text-primary">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user.is_suspended) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-brand-base text-center p-6 bg-[url('/bg-noise.png')] bg-repeat bg-black/90">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20 shadow-glow">
          <FaTimes className="text-red-500 w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Account Suspended</h1>
        <p className="text-gray-400 max-w-md mx-auto mb-8 text-lg">
          Your account has been suspended. Please contact us at <a href="mailto:support@example.com" className="text-primary hover:underline">support@example.com</a> for further assistance.
        </p>
        <button
          onClick={() => logout()}
          className="px-6 py-3 bg-brand-surface border border-brand-border rounded-lg text-white font-medium hover:bg-brand-elevated transition-colors flex items-center gap-2"
        >
          <FaSignOutAlt />
          Sign Out
        </button>
      </div>
    );
  }

  const selectedRestaurant = restaurants.find(r => r._id === selectedRestaurantId);

  const mainNavigation = [
    { name: 'Overview', href: '/dashboard', icon: FaChartPie },
    { name: 'Add Branch', href: '/dashboard/restaurants/new', icon: FaUtensils },
  ];

  const branchNavigation = [
    { name: 'Categories', href: '/dashboard/categories', icon: FaList },
    { name: 'Menu Items', href: '/dashboard/items', icon: FaUtensils },
    { name: 'QR Code', href: '/dashboard/qrcode', icon: FaQrcode },
  ];

  const bottomNavigation = [
    { name: 'Settings', href: '/dashboard/settings', icon: FaCog },
    { name: 'Admin Profile', href: '/dashboard/profile', icon: FaUser },
  ];

  return (
    <div className="h-screen bg-brand-base flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/80 md:hidden transition-opacity cursor-pointer"
          onClick={() => setIsSidebarOpen(false)}
          role="button"
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-brand-surface border-r border-brand-border transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-brand-border shrink-0">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <span className="text-xl text-primary leading-none">▦</span>
            <span className="text-xl font-extrabold tracking-tight text-white">
              QR<span className="text-primary">Menu</span>
            </span>
          </Link>
        </div>

        {/* Branch Selector Section */}
        <div className="px-4 py-4 border-b border-brand-border bg-brand-base/50">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">
            Managing Branch
          </label>
          {restaurants.length > 0 ? (
            <select
              value={selectedRestaurantId || ''}
              onChange={(e) => setSelectedRestaurantId(e.target.value)}
              className="w-full bg-brand-surface border border-brand-border text-white text-sm rounded-lg p-2.5 focus:ring-primary focus:border-primary outline-none transition-all"
            >
              <option value="" disabled>Select a branch</option>
              {restaurants.map((res) => (
                <option key={res._id} value={res._id}>
                  {res.address || res.name}
                </option>
              ))}
            </select>
          ) : (
            <Link 
              href="/dashboard/restaurants/new"
              className="block px-2 text-xs text-primary hover:text-primary-hover font-medium underline"
            >
              + Create your first branch
            </Link>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-4 px-4 space-y-1 overflow-y-auto">
          {mainNavigation.map((item) => {
            const isActive = item.href === '/dashboard' 
              ? pathname === item.href 
              : pathname?.startsWith(item.href);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary border border-primary/20' 
                    : 'text-gray-400 hover:text-white hover:bg-brand-elevated'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}

          {selectedRestaurantId && (
            <>
              <div className="pt-4 pb-1">
                <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Restaurant Management</p>
              </div>
              {branchNavigation.map((item) => {
                const isActive = pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-primary/10 text-primary border border-primary/20' 
                        : 'text-gray-400 hover:text-white hover:bg-brand-elevated'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </>
          )}

          <div className="pt-4 pb-1">
            <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Account</p>
          </div>
          {bottomNavigation.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary border border-primary/20' 
                    : 'text-gray-400 hover:text-white hover:bg-brand-elevated'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Profile / Logout Area */}
        <div className="p-4 border-t border-brand-border shrink-0">
          <button
            onClick={() => setShowSignOutConfirm(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:text-white hover:bg-red-500/20 transition-colors"
          >
            <FaSignOutAlt className="w-5 h-5" />
            Sign out
          </button>
        </div>
      </aside>

      <ConfirmDialog
        isOpen={showSignOutConfirm}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmLabel="Yes, Sign Out"
        cancelLabel="Stay"
        variant="danger"
        onConfirm={() => { setShowSignOutConfirm(false); logout(); }}
        onCancel={() => setShowSignOutConfirm(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header for Mobile & Quick Actions */}
        <header className="h-16 bg-brand-surface border-b border-brand-border flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary rounded-md"
          >
            <span className="sr-only">Open sidebar</span>
            {isSidebarOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
          </button>
          
          <div className="flex-1 flex justify-end items-center">
            <span className="text-sm text-gray-400 hidden sm:block">Admin Dashboard</span>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto bg-brand-base p-4 sm:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
