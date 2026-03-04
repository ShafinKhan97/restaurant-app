import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';
import FadeIn from '@/components/ui/FadeIn';

export default function Cta() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background with gradient matching the primary theme */}
      <div className="absolute inset-0 bg-brand-elevated z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full bg-primary/10 blur-[100px] pointer-events-none z-0" />

      <FadeIn delay={0.2} direction="up" className="max-w-screen-md mx-auto relative z-10 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
          Ready to modernize your dining experience?
        </h2>
        <p className="text-xl text-gray-300 mb-10 leading-relaxed">
          Join hundreds of restaurants using QRMenu to increase sales, reduce printing costs, and delight their customers.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-primary-hover text-white text-lg font-bold rounded-lg shadow-glow hover:shadow-lg transition-all duration-200"
          >
            Create Your Menu <FaArrowRight />
          </Link>
          <Link
            href="#how-it-works"
            className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-brand-surface text-white border-2 border-brand-border rounded-lg text-lg font-semibold transition-colors duration-200"
          >
            Learn More
          </Link>
        </div>
        
        <p className="mt-6 text-sm text-gray-400">
          No credit card required • Cancel anytime • Free plan available
        </p>
      </FadeIn>
    </section>
  );
}
