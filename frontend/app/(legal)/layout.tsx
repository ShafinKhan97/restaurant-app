import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-brand-base">
      <Navbar />
      <main className="flex-grow pt-28 pb-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}
