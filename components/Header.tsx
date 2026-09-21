'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { RESTAURANT } from '@/data/restaurant';
import Wordmark from './Wordmark';

const NAV = [
  { href: '/', label: 'Accueil', code: '00' },
  { href: '/menu', label: 'Le buffet', code: '01' },
  { href: '/formules', label: 'Formules', code: '02' },
  { href: '/galerie', label: 'Galerie', code: '03' },
  { href: '/infos', label: 'Infos & accès', code: '04' },
];

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Referme le menu à chaque changement de page
  useEffect(() => setOpen(false), [pathname]);

  /*
   * Le panneau n'existe qu'en dessous de `lg` (1024 px). Si la fenêtre est
   * élargie alors que le menu est ouvert, le panneau disparaît mais l'état
   * `open` resterait vrai : le verrou de défilement du <body> ne serait jamais
   * levé et la page deviendrait impossible à faire défiler. On referme donc
   * explicitement au franchissement du seuil.
   */
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    const sync = () => {
      if (desktop.matches) setOpen(false);
    };
    sync();
    desktop.addEventListener('change', sync);
    return () => desktop.removeEventListener('change', sync);
  }, []);

  // Menu mobile ouvert : verrouille le défilement et piège le focus
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled || open
            ? 'border-b border-white/10 bg-void/85 backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="shell flex h-16 items-center justify-between gap-4 md:h-20">
          <Link
            href="/"
            className="group flex items-center gap-3"
            aria-label={`${RESTAURANT.name} ${RESTAURANT.location} — accueil`}
          >
            <Wordmark className="h-7 w-auto md:h-8" />
          </Link>

          {/* Navigation principale — écrans larges */}
          <nav aria-label="Navigation principale" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={`group relative flex items-center gap-2 rounded-full px-4 py-2
                                font-mono text-micro-sm uppercase transition-colors duration-300 ${
                                  isActive(item.href)
                                    ? 'text-chrome'
                                    : 'text-steel hover:text-chrome'
                                }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`transition-colors duration-300 ${
                        isActive(item.href) ? 'text-aurora' : 'text-steel/40 group-hover:text-aurora/70'
                      }`}
                    >
                      {item.code}
                    </span>
                    {item.label}
                    {isActive(item.href) && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-4 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-aurora to-transparent"
                      />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${RESTAURANT.phone.tel}`}
              className="hidden items-center gap-2 rounded-full border border-white/10 px-4 py-2
                         font-mono text-micro-sm uppercase text-titanium transition-colors
                         hover:border-aurora/40 hover:text-chrome md:inline-flex"
            >
              <PhoneIcon />
              {RESTAURANT.phone.display}
            </a>

            <Link href="/reserver" className="btn btn-primary !px-5 !py-2.5 text-micro-sm">
              Réserver
            </Link>

            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="menu-mobile"
              aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10
                         text-chrome transition-colors hover:border-aurora/40 lg:hidden"
            >
              <span className="sr-only">{open ? 'Fermer le menu' : 'Ouvrir le menu'}</span>
              <span aria-hidden="true" className="relative block h-3.5 w-5">
                <span
                  className={`absolute left-0 block h-px w-full bg-current transition-all duration-300 ${
                    open ? 'top-1.5 rotate-45' : 'top-0'
                  }`}
                />
                <span
                  className={`absolute left-0 top-1.5 block h-px w-full bg-current transition-opacity duration-200 ${
                    open ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                <span
                  className={`absolute left-0 block h-px w-full bg-current transition-all duration-300 ${
                    open ? 'top-1.5 -rotate-45' : 'top-3'
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/*
        Panneau mobile plein écran.

        L'affichage est piloté par les CLASSES (`flex` / `hidden`), jamais par
        l'attribut HTML `hidden` : la règle `[hidden] { display: none }` vient
        de la feuille de style du navigateur, qui est toujours moins
        prioritaire qu'une classe d'auteur. Un `hidden={!open}` combiné à une
        classe `flex` laisserait donc le panneau affiché en permanence, par
        dessus toute la page.

        `hidden` (display: none) retire aussi le panneau de l'arbre
        d'accessibilité et du parcours de tabulation quand il est fermé : pas
        besoin d'`aria-hidden` ni de `inert` en complément.
      */}
      <div
        id="menu-mobile"
        ref={panelRef}
        className={`fixed inset-0 z-40 flex-col bg-void/97 pt-16 backdrop-blur-2xl lg:hidden ${
          open ? 'flex' : 'hidden'
        }`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 grid-bg opacity-40"
        />
        <nav aria-label="Navigation mobile" className="shell relative flex-1 overflow-y-auto py-8">
          <ul className="space-y-1">
            {NAV.map((item, index) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className="group flex items-baseline gap-4 border-b border-white/5 py-5"
                  style={{ animationDelay: `${index * 45}ms` }}
                >
                  <span
                    aria-hidden="true"
                    className={`font-mono text-micro-sm ${
                      isActive(item.href) ? 'text-aurora' : 'text-steel/40'
                    }`}
                  >
                    {item.code}
                  </span>
                  <span
                    className={`font-display text-3xl tracking-tight ${
                      isActive(item.href) ? 'text-chrome' : 'text-titanium'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-10 space-y-3">
            <Link href="/reserver" className="btn btn-primary w-full">
              Réserver une table
            </Link>
            <a href={`tel:${RESTAURANT.phone.tel}`} className="btn btn-ghost w-full">
              <PhoneIcon />
              {RESTAURANT.phone.display}
            </a>
          </div>

          <p className="mt-8 font-mono text-micro-sm uppercase leading-relaxed text-steel">
            {RESTAURANT.address.venue}
            <br />
            {RESTAURANT.address.postalCode} {RESTAURANT.address.city}
          </p>
        </nav>
      </div>
    </>
  );
}

function PhoneIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.5 5.5c0-1 .8-1.9 1.8-2l1.6-.2c.8-.1 1.5.4 1.7 1.1l.8 2.6c.2.7-.1 1.4-.7 1.8l-1 .7c1 2.1 2.7 3.8 4.8 4.8l.7-1c.4-.6 1.1-.9 1.8-.7l2.6.8c.7.2 1.2.9 1.1 1.7l-.2 1.6c-.1 1-1 1.8-2 1.8C9 19.3 4.7 15 2.5 5.5Z"
      />
    </svg>
  );
}
