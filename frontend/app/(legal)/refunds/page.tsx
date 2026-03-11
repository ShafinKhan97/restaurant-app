import { Metadata } from 'next';
import FadeIn from '@/components/ui/FadeIn';

export const metadata: Metadata = {
  title: 'Refund Policy | QR Menu',
  description: 'Learn about our subscription refund policies.',
};

export default function RefundsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-gray-300 leading-relaxed">
      <FadeIn delay={0.1} direction="up">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-8 border-b border-brand-border pb-6">
          Refund Policy
        </h1>
      </FadeIn>

      <div className="space-y-8 text-base">
        <FadeIn delay={0.2} direction="up">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. General Policy</h2>
            <p className="mb-4">
              At QR Menu, we want you to be completely satisfied with our digital menu platform. If for any reason you are not, we offer a straightforward refund policy for all our subscription plans.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. 14-Day Money Back Guarantee</h2>
            <p className="mb-4">
              All new subscriptions are backed by a 14-day money-back guarantee. If you cancel your account within 14 days of your initial purchase, you are eligible for a full refund, no questions asked. To request this refund, please contact our support team.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Pro-rated Refunds</h2>
            <p className="mb-4">
              After the initial 14-day period has elapsed, we generally do not offer pro-rated refunds for the remainder of a billing cycle (whether monthly or annually). When you cancel, your account will remain active until the end of your current paid billing period.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Exceptions</h2>
            <p className="mb-4">
              We may, at our sole discretion, issue exceptions to this policy in the event of:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Severe technical issues or prolonged downtime on our end that prevented you from using the service.</li>
              <li>Accidental duplicate billing or charges made in error due to a system bug.</li>
            </ul>
            <p className="mt-2 text-sm italic text-gray-400">
              Note that shutting down your restaurant or deciding you no longer need digital menus does not qualify for an exceptional out-of-policy refund.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Processing Times</h2>
            <p className="mb-4">
              Approved refunds are processed back to the original method of payment within 5-10 business days, depending on your financial institution.
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
