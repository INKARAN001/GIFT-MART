import { Link } from 'react-router-dom';

const HERO_IMAGE = '/photos/28499410138204236.jpeg';

const WHY_CHOOSE = [
  {
    icon: 'redeem',
    title: 'Curated quality',
    text: 'We pick only the best products that feel special and premium.',
  },
  {
    icon: 'bolt',
    title: 'Fast delivery',
    text: 'We make sure your gifts arrive on time — every time.',
  },
  {
    icon: 'favorite',
    title: 'Made with care',
    text: 'Every order is packed like it’s a gift to someone we love.',
  },
  {
    icon: 'verified_user',
    title: 'Secure & trusted',
    text: 'Safe payments and reliable service you can count on.',
  },
];

const STATS = [
  { emoji: '📦', value: '1000+', label: 'Orders delivered' },
  { emoji: '😊', value: '98%', label: 'Happy customers' },
  { emoji: '🚚', value: 'Same-day', label: 'Fast dispatch available' },
  { emoji: '🎁', value: '500+', label: 'Unique gift items' },
  { emoji: '⭐', value: '4.8/5', label: 'Average customer rating' },
];

export default function AboutUs() {
  return (
    <div className="w-full max-w-[1200px] mx-auto pb-8 sm:pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-900/50 backdrop-blur-sm shadow-lg mb-12 sm:mb-16">
        <div className="grid lg:grid-cols-[1fr_minmax(280px,420px)] gap-0 lg:gap-8 items-stretch">
          <div className="px-6 sm:px-10 py-12 sm:py-14 lg:py-16 flex flex-col justify-center order-2 lg:order-1">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">Gift Mart</p>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-[2.75rem] leading-tight text-slate-900 dark:text-white font-bold mb-5">
              We don’t just sell gifts — we deliver moments.
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mb-8">
              At Gift Mart, every product is carefully selected, packed with love, and delivered with speed. We believe
              gifting should feel effortless, meaningful, and unforgettable.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-white shadow-md shadow-primary/25 hover:brightness-105 transition-all w-fit"
            >
              Shop collection
              <span className="material-symbols-outlined text-[1.15rem]">arrow_forward</span>
            </Link>
          </div>
          <div className="relative min-h-[240px] sm:min-h-[300px] lg:min-h-0 order-1 lg:order-2">
            <img
              src={HERO_IMAGE}
              alt="Gift Mart — thoughtful gifts and packaging"
              className="absolute inset-0 w-full h-full object-cover lg:rounded-r-3xl"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent lg:bg-gradient-to-l lg:from-transparent lg:via-transparent lg:to-slate-900/20 pointer-events-none" aria-hidden />
          </div>
        </div>
      </section>

      {/* Who we are */}
      <section className="mb-14 sm:mb-20 px-1">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6 text-center sm:text-left">
          Who we are
        </h2>
        <div className="max-w-3xl space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed text-base sm:text-lg">
          <p>
            We are a passionate team dedicated to making gifting simple, fast, and beautiful. From birthdays to special
            surprises, we help you express love without stress.
          </p>
          <p className="text-slate-700 dark:text-slate-200 font-medium">
            Whether it’s a last-minute gift or a carefully planned surprise — we’ve got you covered.
          </p>
        </div>
      </section>

      {/* Why choose us */}
      <section className="mb-14 sm:mb-20">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">
          Why choose us
        </h2>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_CHOOSE.map((item) => (
            <li
              key={item.title}
              className="rounded-2xl border border-slate-200/90 dark:border-slate-700/90 bg-white/80 dark:bg-slate-900/60 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary mb-4">
                <span className="material-symbols-outlined text-[26px]">{item.icon}</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Stats */}
      <section className="mb-14 sm:mb-20 rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/15 via-white/90 to-primary/10 dark:from-primary/20 dark:via-slate-900/80 dark:to-slate-900/90 px-6 sm:px-10 py-12 sm:py-14 shadow-inner">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-10 text-center">
          Our stats
        </h2>
        <ul className="grid grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 text-center">
          {STATS.map((s) => (
            <li key={s.label} className="flex flex-col items-center gap-1">
              <span className="text-2xl sm:text-3xl mb-1" aria-hidden>
                {s.emoji}
              </span>
              <span className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                {s.value}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 max-w-[10rem] leading-snug">
                {s.label}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Our promise */}
      <section className="mb-14 sm:mb-20 max-w-2xl mx-auto text-center px-2">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6">
          Our promise
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          We promise to make gifting easy, emotional, and exciting — every single time. Because every gift tells a story,
          and we help you tell it better.
        </p>
      </section>

      {/* Closing — image + CTA */}
      <section className="relative overflow-hidden rounded-3xl min-h-[300px] sm:min-h-[340px] flex items-center justify-center text-center px-6 py-16">
        <img
          src={HERO_IMAGE}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden
        />
        <div className="absolute inset-0 bg-slate-900/65 dark:bg-slate-950/75" aria-hidden />
        <div className="relative z-10 max-w-lg">
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white mb-8 drop-shadow-sm">
            Ready to make someone’s day?
          </h2>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-9 py-4 text-base font-bold text-white shadow-lg shadow-black/20 hover:brightness-110 transition-all"
          >
            Start shopping
            <span className="material-symbols-outlined">shopping_bag</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
