import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-base flex flex-col items-center justify-center text-center px-6">
      <div className="mb-6">
        <span className="text-8xl font-black text-primary opacity-20 select-none">404</span>
      </div>
      <h1 className="text-3xl font-extrabold text-white mb-3">Page Not Found</h1>
      <p className="text-gray-400 max-w-sm mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-lg transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
