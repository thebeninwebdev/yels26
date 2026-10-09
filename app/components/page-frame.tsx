"use client";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { navigation } from "../event";
import { RegistrationCTA, Wordmark } from "./ui";
import { ease, useMotionPreference } from "./motion";
export function PageFrame({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const shell = useRef<HTMLDivElement>(null);
  const pendingAnchor = useRef<string | null>(null);
  const reduced = useMotionPreference();
  const navControls = useAnimationControls();
  const close = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() =>
      trigger.current?.focus({ preventScroll: true }),
    );
  }, []);
  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      void navControls.start({
        opacity: [0, 1],
        y: [-8, 0],
        transition: { duration: 0.45 },
      });
  }, [navControls]);
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
      <motion.header
        className="site-header"
        initial={false}
        animate={navControls}
        inert={open}
      >
        <div className="container nav-inner">
          <a
            href="#top"
            className="brand-link"
            aria-label="YALI Network Edo — home"
          >
            <Wordmark />
          </a>
          <nav className="desktop-nav" aria-label="Main navigation">
            {navigation.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="desktop-registration">
            <RegistrationCTA />
          </div>
        </div>
      </motion.header>
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
              <Wordmark />
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
                  href={item.href}
                  variants={{
                    closed: { opacity: 0, x: -18 },
                    open: { opacity: 1, x: 0 },
                  }}
                  transition={{ duration: reduced ? 0 : 0.35 }}
                  onClick={(e) => {
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
              Benin City, Edo State
              <br />
              December 2026 · Summit date TBA
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
          borderRadius: open ? "24px" : "0px",
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
