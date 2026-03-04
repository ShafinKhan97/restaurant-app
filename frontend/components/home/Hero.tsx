import Link from 'next/link';
import { FaQrcode, FaArrowRight } from 'react-icons/fa';
import FadeIn from '@/components/ui/FadeIn';

export default function Hero() {
  return (
    <section className="relative px-6 pt-24 pb-32 md:pt-32 md:pb-40 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-20 relative z-10">
        
        {/* Left Column: Text */}
        <div className="flex-1 text-center md:text-left">
          <FadeIn delay={0.1}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6">
              <FaQrcode />
              <span>The modern dining experience</span>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
              Turn Your Menu Into a <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-300">
                Digital Experience
              </span>
            </h1>
          </FadeIn>
          
          <FadeIn delay={0.3}>
            <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto md:mx-0 leading-relaxed">
              Replace traditional printed menus with beautiful, dynamic QR menus. Update prices instantly, manage variants, and let customers order with their phones.
            </p>
          </FadeIn>
          
          <FadeIn delay={0.4}>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <Link
                href="/register"
                className="flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary-hover text-white text-base font-semibold rounded-lg shadow-glow hover:shadow-lg transition-all duration-200"
              >
                Get Started Free <FaArrowRight />
              </Link>
              <Link
                href="#how-it-works"
                className="px-8 py-3.5 bg-brand-surface hover:bg-brand-elevated text-white border border-brand-border rounded-lg text-base font-medium transition-colors duration-200"
              >
                See How It Works
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-5">
              No credit card required. Setup in minutes.
            </p>
          </FadeIn>
        </div>

        {/* Right Column: Visual Mockup */}
        <div className="w-full max-w-md md:w-5/12 relative mt-8 md:mt-0">
          <FadeIn delay={0.5} direction="up">
            <div className="relative aspect-[4/5] bg-gradient-to-tr from-brand-surface to-brand-elevated border border-brand-border rounded-2xl shadow-2xl p-4 sm:p-6 flex flex-col">
            
            {/* Mockup phone interface */}
            <div className="w-full h-full bg-brand-base rounded-xl border border-brand-strong overflow-hidden flex flex-col shadow-inner">
              
              {/* Mockup Header */}
              <div className="h-14 border-b border-brand-border flex items-center justify-center bg-brand-surface/80">
                <span className="font-bold text-white tracking-wide">🍕 Pizza Palace</span>
              </div>
              
              {/* Mockup Categories */}
              <div className="flex gap-2 px-4 py-3 overflow-hidden border-b border-brand-border bg-brand-base">
                <div className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full">Pizzas</div>
                <div className="px-3 py-1 bg-brand-elevated text-gray-400 text-xs font-medium rounded-full">Sides</div>
                <div className="px-3 py-1 bg-brand-elevated text-gray-400 text-xs font-medium rounded-full">Drinks</div>
              </div>
              
              {/* Mockup Items */}
              <div className="p-4 flex flex-col gap-5 flex-1 relative">
                <div className="flex gap-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex-shrink-0" />
                  <div className="flex-1 py-1">
                    <div className="flex justify-between items-start mb-2">
                      <div className="w-32 h-4 bg-gray-300 rounded" />
                    </div>
                    <div className="w-full h-2 bg-gray-600 rounded mb-1.5" />
                    <div className="w-4/5 h-2 bg-gray-600 rounded mb-4" />
                    <div className="w-16 h-5 bg-primary/90 rounded font-bold" />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex-shrink-0" />
                  <div className="flex-1 py-1">
                    <div className="flex justify-between items-start mb-2">
                      <div className="w-24 h-4 bg-gray-300 rounded" />
                    </div>
                    <div className="w-full h-2 bg-gray-600 rounded mb-1.5" />
                    <div className="w-3/4 h-2 bg-gray-600 rounded mb-4" />
                    <div className="w-16 h-5 bg-primary/90 rounded font-bold" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Notification Tag */}
            <div className="absolute -right-2 top-8 sm:-right-6 sm:top-12 bg-white text-black px-4 py-3 rounded-xl shadow-xl animate-bounce">
              <span className="font-bold text-sm block">Scanned! 📱</span>
              <span className="text-xs text-gray-600 font-medium tracking-tight">Menu loaded instantly</span>
            </div>
          </div>
          </FadeIn>
        </div>

      </div>
    </section>
  );
}
