import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-base border-t border-brand-border pt-16 pb-8">
      <div className="max-w-screen-xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4 no-underline">
              <span className="text-2xl text-primary leading-none">▦</span>
              <span className="text-xl font-extrabold tracking-tight text-white">
                QR<span className="text-primary">Menu</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              The modern digital dining experience. Manage your menu dynamically while saving costs on traditional printing.
            </p>
          </div>

          {/* Links: Product */}
          <div className="col-span-1">
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="flex flex-col gap-3">
              <li><Link href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">Features</Link></li>
              <li><Link href="#how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm">How it Works</Link></li>
              <li><Link href="#testimonials" className="text-gray-400 hover:text-white transition-colors text-sm">Customer Stories</Link></li>
              <li><Link href="#faq" className="text-gray-400 hover:text-white transition-colors text-sm">FAQ</Link></li>
            </ul>
          </div>

          {/* Links: Legal */}
          <div className="col-span-1">
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="flex flex-col gap-3">
              <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link href="/refunds" className="text-gray-400 hover:text-white transition-colors text-sm">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="col-span-1">
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <p className="text-gray-400 text-sm mb-2">Need help? Contact our support team.</p>
            <a href="mailto:support@qrmenu.com" className="text-primary hover:text-primary-hover font-medium text-sm transition-colors">
              support@qrmenu.com
            </a>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-brand-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} QRMenu Inc. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6">
            <span className="text-gray-500 text-sm flex items-center gap-1">
              Built with <span className="text-red-500">♥</span> for restaurants
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
