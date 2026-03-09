'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FaUserEdit, FaUtensils, FaTags, FaPercent } from 'react-icons/fa';
import FadeIn from '@/components/ui/FadeIn';

export default function DashboardOverviewPage() {
  const { data: session } = useSession();

  const actions = [
    {
      title: 'Menu Items',
      description: 'Add or modify dishes to your menu',
      href: '/dashboard/items',
      icon: FaUtensils,
    },
    {
      title: 'Item Sizes',
      description: 'Create Small, Medium, Large sizes',
      href: '/dashboard/sizes',
      icon: FaTags,
    },
    {
      title: 'Discounts',
      description: 'Apply percentage or flat amount discounts',
      href: '/dashboard/discounts',
      icon: FaPercent,
    },
    {
      title: 'Admin Profile',
      description: 'Update your name, email, and password',
      href: '/dashboard/profile',
      icon: FaUserEdit,
    },
  ];

  return (
    <div>
      <FadeIn delay={0.1} direction="down">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-400 mb-8">
          Welcome back, {session?.user?.name || 'Admin'}! What would you like to manage?
        </p>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {actions.map((action, index) => (
          <FadeIn key={action.title} delay={0.2 + index * 0.1} direction="up">
            <Link 
              href={action.href}
              className="bg-brand-surface border border-brand-border hover:border-primary/50 rounded-xl p-6 shadow-sm flex flex-col items-center text-center transition-colors group h-full"
            >
              <div className="w-16 h-16 bg-brand-base border border-brand-elevated rounded-full flex items-center justify-center text-white mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <action.icon className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{action.title}</h2>
              <p className="text-sm text-gray-400">{action.description}</p>
            </Link>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
