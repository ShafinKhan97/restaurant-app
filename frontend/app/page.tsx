import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/home/Hero';
import Stats from '@/components/home/Stats';
import Features from '@/components/home/Features';
import Testimonials from '@/components/home/Testimonials';
import Faq from '@/components/home/Faq';
import Cta from '@/components/home/Cta';
import Footer from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col min-h-screen">
        <Hero />
        <Stats />
        <Features />
        <Testimonials />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
