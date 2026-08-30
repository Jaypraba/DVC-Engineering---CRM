"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { nav } from "@/lib/site";
import { Container } from "@/components/ui/Container";
import { Wordmark } from "./Wordmark";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors duration-brand ease-brand",
        scrolled || menuOpen ? "border-b border-grey-200 bg-paper/95 backdrop-blur" : "border-b border-transparent",
      )}
    >
      <Container>
        <div className="flex h-[4.5rem] items-center justify-between gap-8 md:h-20">
          <Wordmark />

          <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "text-sm tracking-tight transition-colors duration-brand ease-brand",
                    active ? "text-ink" : "text-grey-500 hover:text-ink",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/book"
              className="hidden rounded-full bg-accent px-5 py-2.5 text-sm font-medium tracking-tight text-ink transition-colors duration-brand ease-brand hover:bg-accent-dim sm:inline-flex"
            >
              Book a site visit
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="flex h-10 w-10 items-center justify-center lg:hidden"
            >
              <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
              <span aria-hidden className="relative block h-3 w-6">
                <span
                  className={cn(
                    "absolute left-0 block h-px w-6 bg-ink transition-transform duration-brand ease-brand",
                    menuOpen ? "top-1.5 rotate-45" : "top-0",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 block h-px w-6 bg-ink transition-transform duration-brand ease-brand",
                    menuOpen ? "top-1.5 -rotate-45" : "top-3",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </Container>

      {menuOpen ? (
        <div id="mobile-menu" className="border-t border-grey-200 bg-paper lg:hidden">
          <Container>
            <nav aria-label="Mobile" className="flex flex-col py-4">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="border-b border-grey-200 py-4 font-display text-2xl tracking-tight last:border-b-0"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/book"
                className="mt-6 inline-flex justify-center rounded-full bg-accent px-6 py-3.5 text-sm font-medium tracking-tight text-ink"
              >
                Book a site visit
              </Link>
            </nav>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
