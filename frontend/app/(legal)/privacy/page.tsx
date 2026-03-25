import { Metadata } from 'next';
import FadeIn from '@/components/ui/FadeIn';

export const metadata: Metadata = {
  title: 'Privacy Policy | QR Menu',
  description: 'Learn how QR Menu collects, uses, and protects your personal data.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-gray-300 leading-relaxed">
      <FadeIn delay={0.1} direction="up">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-8 border-b border-brand-border pb-6">
          Privacy Policy
        </h1>
      </FadeIn>

      <div className="space-y-8 text-base">
        <FadeIn delay={0.2} direction="up">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Data Collection</h2>
            <p className="mb-4">
              We collect information you directly provide us during account creation, including your name, email address, and restaurant business details. We also automatically collect certain telemetry data, such as IP addresses, browser types, and operating systems when you use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Usage of Information</h2>
            <p className="mb-4">
              The information we collect is used to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Provide, maintain, and improve our Service.</li>
              <li>Communicate with you to resolve support inquiries or provide operational updates.</li>
              <li>Process transactions and send related data, including confirmations and invoices.</li>
              <li>Detect, investigate, and prevent fraudulent transactions or illegal activities.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Data Sharing</h2>
            <p className="mb-4">
              We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties except where necessary to provide our core services (e.g. payment processors, cloud hosting). We require these third parties to maintain the confidentiality and security of this data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Cookies and Tracking</h2>
            <p className="mb-4">
              We use strictly necessary cookies to keep you logged in to your dashboard. We map also use local storage (like JWT tokens) to securely maintain your active session state in the browser. You may instruct your browser to refuse all cookies, however this may break certain functionalities of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Security</h2>
            <p className="mb-4">
              The security of your personal data is important to us. We strive to implement commercial best practices regarding data encryption, server authentication, and secure transit (HTTPS), recognizing that no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <p className="text-sm text-gray-500 mt-12 pt-8 border-t border-brand-border">
            Last Updated: March 2026
          </p>
        </FadeIn>
      </div>
    </div>
  );
}
