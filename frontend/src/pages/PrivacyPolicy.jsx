import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="w-full max-w-[800px] mx-auto pb-8 sm:pb-16">
      <nav className="text-sm text-slate-500 dark:text-slate-400 mb-8">
        <Link to="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <span className="text-slate-700 dark:text-slate-300">Privacy Policy</span>
      </nav>

      <header className="mb-10 sm:mb-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2">Legal</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">Privacy Policy</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">How Gift Mart handles your personal information.</p>
      </header>

      <div className="space-y-10 sm:space-y-12 text-slate-700 dark:text-slate-300 leading-relaxed">
        <section>
          <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-3">1. Introduction</h2>
          <p>
            At Gift Mart, we respect your privacy and are committed to protecting your personal information. This Privacy
            Policy explains how we collect, use, and safeguard your data when you use our website.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-3">2. Information we collect</h2>
          <p className="mb-3">We may collect the following information:</p>
          <ul className="list-disc pl-6 space-y-2 marker:text-primary">
            <li>Full name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Delivery address</li>
            <li>Payment details (processed securely via third-party payment providers)</li>
            <li>Browsing behavior on our website (cookies, analytics)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-3">3. How we use your information</h2>
          <p className="mb-3">We use your information to:</p>
          <ul className="list-disc pl-6 space-y-2 marker:text-primary">
            <li>Process and deliver your orders</li>
            <li>Provide customer support</li>
            <li>Send order updates and confirmations</li>
            <li>Improve our website and services</li>
            <li>Offer personalized promotions and deals</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-3">4. Data protection</h2>
          <p className="mb-3">We take your security seriously.</p>
          <ul className="list-disc pl-6 space-y-2 marker:text-primary">
            <li>Your data is stored securely</li>
            <li>We use encrypted payment systems</li>
            <li>We do not sell or rent your personal information</li>
            <li>Access to user data is strictly limited to authorized staff only</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-3">5. Cookies</h2>
          <p className="mb-3">We use cookies to:</p>
          <ul className="list-disc pl-6 space-y-2 marker:text-primary">
            <li>Improve user experience</li>
            <li>Remember your preferences</li>
            <li>Analyze website traffic</li>
          </ul>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            You can disable cookies in your browser settings, but some features may not work properly.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-3">6. Third-party services</h2>
          <p className="mb-3">We may use trusted third-party services such as:</p>
          <ul className="list-disc pl-6 space-y-2 marker:text-primary">
            <li>Payment gateways</li>
            <li>Delivery partners</li>
            <li>Analytics tools (e.g., Google Analytics)</li>
          </ul>
          <p className="mt-4">These services only access necessary data to perform their tasks.</p>
        </section>

        <section>
          <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-3">7. Your rights</h2>
          <p className="mb-3">You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2 marker:text-primary">
            <li>Access your personal data</li>
            <li>Request corrections</li>
            <li>Request deletion of your data</li>
            <li>Opt out of marketing emails</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-3">8. Contact us</h2>
          <p className="mb-4">If you have any questions about this Privacy Policy, you can contact us:</p>
          <ul className="space-y-4 not-prose">
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary shrink-0">mail</span>
              <div>
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 block">Email</span>
                <a href="mailto:support@giftmart.com" className="font-medium text-primary hover:underline">
                  support@giftmart.com
                </a>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary shrink-0">call</span>
              <div>
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 block">Phone</span>
                <a href="tel:+94770852489" className="font-medium text-primary hover:underline">
                  +94 77 085 2489
                </a>
              </div>
            </li>
          </ul>
        </section>

        <aside
          className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-white/90 to-primary/5 dark:from-primary/15 dark:via-slate-900/80 dark:to-slate-900/90 px-6 py-8 sm:px-8 sm:py-10 text-center shadow-sm"
          aria-labelledby="trust-heading"
        >
          <span className="material-symbols-outlined text-primary text-3xl mb-3" aria-hidden>
            verified_user
          </span>
          <h2 id="trust-heading" className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Your trust matters
          </h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
            We believe privacy is not optional — it’s a promise. Your trust is the foundation of Gift Mart.
          </p>
        </aside>
      </div>

      <p className="mt-12 text-xs text-slate-400 text-center flex flex-wrap justify-center gap-x-4 gap-y-2">
        <Link to="/terms-of-service" className="hover:text-primary transition-colors">
          Terms of Service
        </Link>
        <Link to="/" className="hover:text-primary transition-colors">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
