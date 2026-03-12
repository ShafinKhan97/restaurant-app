'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  FaGlobe, 
  FaStore, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUserShield
} from 'react-icons/fa';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'SUPER_ADMIN') {
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'SUPER_ADMIN') {
    return (
      <div className="h-screen flex items-center justify-center bg-brand-base text-primary">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const navigation = [
    { name: 'Overview', href: '/superadmin', icon: FaGlobe },
  ];

  return (
    <div className="h-screen bg-brand-base flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/80 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-brand-surface border-r border-brand-border transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-brand-border shrink-0 bg-primary/5">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <FaUserShield className="text-xl text-primary" />
            <span className="text-lg font-extrabold tracking-tight text-white">
              System<span className="text-primary">Admin</span>
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = item.href === '/superadmin' 
              ? pathname === item.href 
              : pathname?.startsWith(item.href);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary border border-primary/20' 
                    : 'text-gray-400 hover:text-white hover:bg-brand-elevated'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-gray-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Profile / Logout Area */}
        <div className="p-4 border-t border-brand-border shrink-0">
          {user && (
            <div className="mb-4 px-2">
              <p className="text-sm font-medium text-white truncate">{user.name || 'Super Admin'}</p>
              <p className="text-xs text-primary font-semibold tracking-wider uppercase mt-0.5">Super Administrator</p>
            </div>
          )}
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:text-white hover:bg-red-500/20 transition-colors"
          >
            <FaSignOutAlt className="w-5 h-5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-brand-surface border-b border-brand-border flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary rounded-md"
          >
            <span className="sr-only">Open sidebar</span>
            {isSidebarOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
          </button>
          
          <div className="flex-1 flex justify-end items-center">
            <span className="text-xs font-semibold px-2.5 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full hidden sm:inline-flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
               Live System View
            </span>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto bg-brand-base p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
