import { Metadata } from 'next';
import FadeIn from '@/components/ui/FadeIn';

export const metadata: Metadata = {
  title: 'Terms of Service | QR Menu',
  description: 'Read the terms of service and user agreements for QR Menu Platform.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-gray-300 leading-relaxed">
      <FadeIn delay={0.1} direction="up">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-8 border-b border-brand-border pb-6">
          Terms of Service
        </h1>
      </FadeIn>

      <div className="space-y-8 text-base">
        <FadeIn delay={0.2} direction="up">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using the QR Menu Platform ("Service"), you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, you must not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Account Responsibilities</h2>
            <p className="mb-4">
              To use certain features, you must register for an account. You represent and warrant that all information provided is accurate. You are solely responsible for maintaining the confidentiality of your account password and for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Prohibited Activities</h2>
            <p className="mb-4">
              You agree not to engage in any of the following prohibited activities:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Using the Service for any illegal purpose or in violation of any local, state, national, or international law.</li>
              <li>Uploading viruses, malicious code, or acting in a way that disrupts the integrity of the system.</li>
              <li>Attempting to bypass any measures we map use to prevent or restrict access to the Service.</li>
              <li>Uploading fraudulent, misleading, or inappropriate menu items to the public facing menus.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Intellectual Property</h2>
            <p className="mb-4">
              The design, source code, logos, and specific platform functionality are the property of QR Menu Platform. You may not duplicate, copy, or reuse any portion of the HTML/CSS or visual design elements without express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Termination</h2>
            <p className="mb-4">
              We reserve the right to suspend or terminate your account at any time, without notice, for conduct that we believe violates these Terms, or is harmful to other users of the Service, us, or third parties.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Limitation of Liability</h2>
            <p className="mb-4">
              In no event shall QR Menu Platform be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, stemming from your usage of the platform.
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
