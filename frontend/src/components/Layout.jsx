import { Outlet, useLocation } from 'react-router-dom';
import NavbarNew from './NavbarNew';
import FooterNew from './FooterNew';

export default function Layout() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div
      className="relative flex min-h-screen w-full flex-col overflow-x-hidden font-display text-slate-900 dark:text-slate-100 transition-colors duration-300 bg-center bg-no-repeat bg-fixed"
      style={{
        backgroundImage: "url('/Untitled%20design.png')",
        backgroundSize: 'cover',
      }}
    >
      {/* Light overlay so content stays readable */}
      <div className="fixed inset-0 bg-background-light/70 dark:bg-background-dark/80 pointer-events-none z-0" aria-hidden />
      <div className="relative z-10 flex min-h-screen w-full flex-col">
        <NavbarNew />
        <main className="flex-1">
        {isHome ? <Outlet /> : (
          <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
            <Outlet />
          </div>
        )}
      </main>
        <FooterNew />
      </div>
    </div>
  );
}
