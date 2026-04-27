import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="w-full max-w-[800px] mx-auto pb-8 sm:pb-16">
      <nav className="text-sm text-slate-500 dark:text-slate-400 mb-8">
        <Link to="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <span className="text-slate-700 dark:text-slate-300">Terms of Service</span>
      </nav>

      <header className="mb-10 sm:mb-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2">Legal</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">Terms of Service</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Rules and conditions for using Gift Mart.</p>
      </header>

      <div className="space-y-10 sm:space-y-12 text-slate-700 dark:text-slate-300 leading-relaxed">
        <section>
          <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-3">1. Introduction</h2>
          <p>
            Welcome to Gift Mart. By accessing or using our website, you agree to be bound by these Terms of Service.
            Please read them carefully before making any purchase.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-3">2. Use of our website</h2>
          <p className="mb-3">By using this website, you agree that:</p>
          <ul className="list-disc pl-6 space-y-2 marker:text-primary">
            <li>You are at least 18 years old or using the site under parental guidance</li>
            <li>You will provide accurate and complete information</li>
            <li>You will not misuse, hack, or damage the website</li>
            <li>You will use the site only for lawful purposes</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-3">3. Orders &amp; purchases</h2>
          <ul className="list-disc pl-6 space-y-2 marker:text-primary">
            <li>All orders placed are subject to acceptance and availability</li>
            <li>We reserve the right to cancel or refuse any order</li>
            <li>Prices may change without prior notice</li>
            <li>Once an order is confirmed, you will receive an email or SMS confirmation</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-3">4. Delivery policy</h2>
          <ul className="list-disc pl-6 space-y-2 marker:text-primary">
            <li>Delivery times are estimates and may vary due to location or external factors</li>
            <li>We are not responsible for delays caused by courier services or unforeseen events</li>
            <li>Customers must provide accurate delivery information to avoid issues</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-3">5. Payments</h2>
          <ul className="list-disc pl-6 space-y-2 marker:text-primary">
            <li>All payments must be made through secure payment methods available on our site</li>
            <li>We do not store your full payment card details</li>
            <li>Transactions are processed by trusted third-party payment providers</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-3">6. Returns &amp; refunds</h2>
          <ul className="list-disc pl-6 space-y-2 marker:text-primary">
            <li>Returns are accepted only under eligible conditions (damaged or incorrect items)</li>
            <li>Requests must be made within a specified time period after delivery</li>
            <li>Refunds (if applicable) will be processed through the original payment method</li>
            <li>Certain items may not be eligible for return due to their nature (e.g. personalized gifts)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-3">7. Account responsibility</h2>
          <ul className="list-disc pl-6 space-y-2 marker:text-primary">
            <li>You are responsible for maintaining the confidentiality of your account</li>
            <li>Any activity under your account is your responsibility</li>
            <li>Notify us immediately if you suspect unauthorized access</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-3">8. Limitation of liability</h2>
          <p className="mb-3">Gift Mart is not liable for:</p>
          <ul className="list-disc pl-6 space-y-2 marker:text-primary">
            <li>Indirect or accidental damages</li>
            <li>Delivery delays caused by third parties</li>
            <li>Losses due to incorrect user information</li>
            <li>Issues beyond our reasonable control</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-3">9. Changes to terms</h2>
          <p>
            We may update these Terms at any time. Changes will be posted on this page, and continued use of the site
            means you accept the updated Terms.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-3">10. Contact us</h2>
          <p className="mb-4">If you have questions about these Terms:</p>
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
          aria-labelledby="tos-trust-heading"
        >
          <span className="material-symbols-outlined text-primary text-3xl mb-3" aria-hidden>
            handshake
          </span>
          <h2 id="tos-trust-heading" className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Shop with confidence
          </h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
            By using Gift Mart, you agree to shop with trust, safety, and transparency.
          </p>
        </aside>
      </div>

      <p className="mt-12 text-xs text-slate-400 text-center">
        <Link to="/privacy-policy" className="hover:text-primary transition-colors mr-4">
          Privacy Policy
        </Link>
        <Link to="/" className="hover:text-primary transition-colors">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
