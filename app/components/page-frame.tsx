"use client";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { event, navigation } from "../event";
import { RegistrationCTA } from "./ui";
import { ease, useMotionPreference } from "./motion";

export function PageFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const shell = useRef<HTMLDivElement>(null);
  const pendingAnchor = useRef<string | null>(null);
  const reduced = useMotionPreference();
  const close = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() =>
      trigger.current?.focus({ preventScroll: true }),
    );
  }, []);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 500);
    update();
    window.addEventListener("scroll", update, { passive: true });
    const visibleObstacles = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visibleObstacles.add(entry.target);
        else visibleObstacles.delete(entry.target);
      });
      setFooterVisible(visibleObstacles.size > 0);
    });
    document
      .querySelectorAll("footer, .closing-cta")
      .forEach((el) => observer.observe(el));
    return () => {
      window.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);
  useEffect(() => {
    if (!open) return;
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
      if (e.key === "Tab") {
        const items = Array.from(
          panel.current?.querySelectorAll<HTMLElement>(
            "a[href],button:not([disabled])",
          ) ?? [],
        );
        const first = items[0],
          last = items.at(-1);
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            !panel.current?.contains(document.activeElement))
        ) {
          e.preventDefault();
          last?.focus();
        } else if (
          !e.shiftKey &&
          (document.activeElement === last ||
            !panel.current?.contains(document.activeElement))
        ) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    const focus = (e: FocusEvent) => {
      if (!panel.current?.contains(e.target as Node))
        panel.current?.querySelector<HTMLButtonElement>("button")?.focus();
    };
    const mq = window.matchMedia("(min-width: 1000px)");
    const resize = () => {
      if (mq.matches) close();
    };
    document.addEventListener("keydown", key);
    document.addEventListener("focusin", focus);
    mq.addEventListener("change", resize);
    return () => {
      document.body.style.overflow = bodyOverflow;
      document.removeEventListener("keydown", key);
      document.removeEventListener("focusin", focus);
      mq.removeEventListener("change", resize);
    };
  }, [open, close]);
  return (
    <div className="page-frame" data-menu-open={open}>
      <header className="site-header" inert={open}>
        <div className="container nav-inner">
          <Link
            href="/"
            className="brand-link"
            aria-label="YELS 2026 — home"
          >
            <Image
              className="header-logo"
              src="/images/logo.png"
              alt="YELS 2026"
              width={150}
              height={60}
              priority
            />
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            {navigation.map((item) => (
              <a key={item.href} href={item.href.startsWith("/") ? item.href : pathname === "/" ? item.href : `/${item.href}`}>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="desktop-registration">
            <RegistrationCTA />
          </div>
        </div>
      </header>
      <button
        ref={trigger}
        className={`menu-toggle ${open ? "is-open" : ""}`}
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => (open ? close() : setOpen(true))}
        inert={open}
      >
        <span />
        <span />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panel}
            id="mobile-navigation"
            className="mobile-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: reduced ? 0 : 0.5, ease }}
          >
            <div className="panel-heading">
              <Link href="/" className="brand-link" aria-label="YELS 2026 — home">
                <Image
                  className="header-logo"
                  src="/images/logo.png"
                  alt="YELS 2026"
                  width={150}
                  height={60}
                />
              </Link>
              <button
                className="panel-close"
                aria-label="Close navigation"
                onClick={close}
              >
                <motion.span
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 45 }}
                  transition={{ duration: reduced ? 0 : 0.3 }}
                />
                <motion.span
                  initial={{ rotate: 0 }}
                  animate={{ rotate: -45 }}
                  transition={{ duration: reduced ? 0 : 0.3 }}
                />
              </button>
            </div>
            <p className="eyebrow">YOUR NEXT CHAPTER</p>
            <motion.nav
              aria-label="Mobile navigation"
              initial="closed"
              animate="open"
              variants={{
                closed: {},
                open: {
                  transition: {
                    staggerChildren: reduced ? 0 : 0.055,
                    delayChildren: reduced ? 0 : 0.1,
                  },
                },
              }}
            >
              {navigation.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href.startsWith("/") ? item.href : pathname === "/" ? item.href : `/${item.href}`}
                  variants={{
                    closed: { opacity: 0, x: -18 },
                    open: { opacity: 1, x: 0 },
                  }}
                  transition={{ duration: reduced ? 0 : 0.35 }}
                  onClick={(e) => {
                    if (pathname !== "/" || !item.href.startsWith("#")) return;
                    e.preventDefault();
                    pendingAnchor.current = item.href;
                    close();
                  }}
                >
                  <small>0{i + 1}</small>
                  {item.label}
                  <span aria-hidden="true">↗</span>
                </motion.a>
              ))}
            </motion.nav>
            <div
              className="panel-registration"
              onClick={(e) => {
                if ((e.target as HTMLElement).closest("a")) close();
              }}
            >
              <RegistrationCTA />
            </div>
            <p className="panel-note">
              {event.location}
              <br />
              {event.dateLabel} · Venue to be announced
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        ref={shell}
        id="page-shell"
        onAnimationComplete={() => {
          if (open || !pendingAnchor.current) return;
          const href = pendingAnchor.current;
          pendingAnchor.current = null;
          window.history.pushState(null, "", href);
          document.querySelector(href)?.scrollIntoView({
            behavior: reduced ? "instant" : "smooth",
            block: "start",
          });
        }}
        className="page-shell"
        inert={open}
        animate={{
          x: open ? "min(82vw, 380px)" : "0px",
          scale: open ? 0.97 : 1,
          borderRadius: 0,
        }}
        transition={{ duration: reduced ? 0 : 0.5, ease }}
        style={{ transformOrigin: "left top" }}
      >
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </motion.div>
      <AnimatePresence>
        {open && (
          <motion.div
            className="page-overlay"
            aria-hidden="true"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.3 }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {scrolled && !open && !footerVisible && (
          <motion.button
            className="back-to-top"
            aria-label="Back to top"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
            onClick={() => {
              window.scrollTo({
                top: 0,
                behavior: reduced ? "instant" : "smooth",
              });
              document.getElementById("top")?.focus({ preventScroll: true });
            }}
          >
            ↑
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SiteFooter() {
  return <footer className="site-footer"><div className="container"><div className="footer-top"><a href="https://www.instagram.com/yali_networkedo/" target="_blank" rel="noreferrer" className="footer-partner-logos" aria-label="Visit YALI Network Edo on Instagram"><Image src="/us-diplomatic-mission-nigeria.jpg" alt="United States Diplomatic Mission in Nigeria" width={119} height={91} /><Image src="/yali-network-edo.jpg" alt="YALI Network Edo" width={135} height={118} /></a><nav aria-label="Footer navigation">{navigation.map((item) => <a href={item.href.startsWith("/") ? item.href : `/${item.href}`} key={item.href}>{item.label}</a>)}</nav></div><div className="footer-bottom"><p>YOUTH EMPOWERMENT &amp; LEADERSHIP SUMMIT</p><p>BENIN CITY, EDO STATE · 2026</p><a className="footer-credit" href="https://mreseosa.com" target="_blank" rel="noreferrer">Built by Mreseosa</a></div></div></footer>;
}
