import { Link } from 'react-router-dom';

export default function FooterNew() {
  return (
    <footer className="bg-slate-deep text-slate-300 py-16 px-6 lg:px-20 border-t border-white/5">
      <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <div className="space-y-6">
          <Link to="/" className="flex items-center gap-3 text-white">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">redeem</span>
            </div>
            <h2 className="text-xl font-black tracking-tighter uppercase font-display">Gift Mart</h2>
          </Link>
          <p className="text-sm leading-relaxed text-slate-400">
            Crafting memorable gifting experiences through curation and design. We believe every gift tells a unique story.
          </p>
          <div className="flex gap-4">
            <a className="size-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all text-slate-400" href="https://www.tiktok.com/@intgiftmart?_r=1&_t=ZS-94lcyfKq7Ma" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <svg className="size-5 fill-current" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
            </a>
            <a className="size-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all text-slate-400" href="https://www.facebook.com/share/18NMFTiSK3/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg className="size-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
            </a>
            <a className="size-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all text-slate-400" href="https://www.instagram.com/int_gift_mart?igsh=eDFkcjR2M2R2dnc4" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg className="size-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849s-.011 3.585-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.849-.07c-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849s.012-3.584.07-4.849c.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.669-.072-4.948-.197-4.354-2.612-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
            </a>
          </div>
        </div>
        <div>
          <h5 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">Quick Links</h5>
          <ul className="space-y-4 text-sm">
            <li><Link to="/products" className="hover:text-primary transition-colors">Personalized Gifts</Link></li>
            <li><a href="#" className="hover:text-primary transition-colors">Corporate Gifting</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Anniversary Specials</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Birthday Bundles</a></li>
          </ul>
        </div>
        <div>
          <h5 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">Customer Support</h5>
          <ul className="space-y-4 text-sm">
            <li><a href="#" className="hover:text-primary transition-colors">Track Your Order</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Shipping Policy</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Returns &amp; Exchanges</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">FAQs</a></li>
          </ul>
        </div>
        <div>
          <h5 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">Our Studio</h5>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary">location_on</span>
              <span>KKS Road,Jaffna,Srilanka</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">mail</span>
              <a href="mailto:hello@giftmart.com" className="hover:text-primary transition-colors">contact@giftmart.com</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="w-full max-w-[1400px] mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} GIFT MART. All rights reserved. Designed for the art of giving.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
