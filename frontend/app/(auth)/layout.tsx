import Link from 'next/link';
import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-base flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex-1">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-brand-elevated z-0" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-primary/10 blur-[100px] pointer-events-none z-0" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 no-underline">
          <span className="text-3xl text-primary leading-none">▦</span>
          <span className="text-2xl font-extrabold tracking-tight text-white">
            QR<span className="text-primary">Menu</span>
          </span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-brand-surface py-8 px-4 shadow-2xl border border-brand-border rounded-xl sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}
