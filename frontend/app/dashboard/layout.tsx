'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { 
  FaChartPie, 
  FaUser, 
  FaUtensils, 
  FaTags,
  FaPercent,
  FaSignOutAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: FaChartPie },
    { name: 'Menu Items', href: '/dashboard/items', icon: FaUtensils },
    { name: 'Item Sizes', href: '/dashboard/sizes', icon: FaTags },
    { name: 'Discounts', href: '/dashboard/discounts', icon: FaPercent },
    { name: 'Admin Profile', href: '/dashboard/profile', icon: FaUser },
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

      {/* Sidebar - Fixed and not scrollable internally if content is small, but flex-col */}
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

        {/* Navigation Links */}
        <nav className="flex-1 py-6 px-4 space-y-2">
          {navigation.map((item) => {
            // Exact match for dashboard, startsWith for others
            const isActive = item.href === '/dashboard' 
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
          {session && (
            <div className="mb-4 px-2">
              <p className="text-sm font-medium text-white truncate">{session.user?.name || 'Admin User'}</p>
              <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:text-white hover:bg-red-500/20 transition-colors"
          >
            <FaSignOutAlt className="w-5 h-5" />
            Sign out
          </button>
        </div>
      </aside>

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

        {/* Dynamic Page Content - This part scrolls */}
        <main className="flex-1 overflow-y-auto bg-brand-base p-4 sm:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
