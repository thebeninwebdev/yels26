"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const items = [
  ["Attendees", "/admin/attendees", "users"],
  ["Bootcamp", "/admin/bootcamp", "bootcamp"],
  ["Check-in", "/admin/check-in", "scanner"],
  ["Settings", "/admin/settings", "settings"],
] as const;

export function Icon({ name }: { name: string }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true">
    {name === "users" ? <><circle cx="8" cy="8" r="3" /><path d="M2.5 20v-1.5A4.5 4.5 0 0 1 7 14h2a4.5 4.5 0 0 1 4.5 4.5V20M16 4.5a3.5 3.5 0 0 1 0 7M17 14a4.5 4.5 0 0 1 4.5 4.5V20" /></>
      : name === "scanner" ? <><path d="M4 9V5h4M16 5h4v4M20 15v4h-4M8 19H4v-4" /><path d="M8 12h8M12 8v8" /></>
      : name === "bootcamp" ? <><path d="M4 8.5 12 4l8 4.5-8 4.5-8-4.5Z" /><path d="M7 10.2V15c2.8 2.3 7.2 2.3 10 0v-4.8M20 9v6" /></>
      : name === "settings" ? <><circle cx="12" cy="12" r="3" /><path d="m12 2 1.2 2.5 2.7.7 2.3-1.4 1.7 1.7-1.4 2.3.7 2.7L22 12l-2.5 1.2-.7 2.7 1.4 2.3-1.7 1.7-2.3-1.4-2.7.7L12 22l-1.2-2.5-2.7-.7-2.3 1.4-1.7-1.7 1.4-2.3-.7-2.7L2 12l2.5-1.2.7-2.7-1.4-2.3 1.7-1.7 2.3 1.4 2.7-.7L12 2Z" /></>
      : <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>}
  </svg>;
}

function Links({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();
  return <nav className="admin-nav" aria-label="Admin navigation">
    {items.map(([label, href, icon]) => <Link href={href} key={href} className={pathname === href || pathname.startsWith(`${href}/`) ? "active" : ""} title={collapsed ? label : undefined}><Icon name={icon} /><span>{label}</span></Link>)}
  </nav>;
}

export function AdminNav({ fullName, email }: { fullName: string; email: string }) {
  const pathname = usePathname();
  const mobileMenu = useRef<HTMLDetailsElement>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (mobileMenu.current?.open && !mobileMenu.current.contains(event.target as Node)) mobileMenu.current.open = false;
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, []);

  const initials = fullName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const currentLabel = items.find(([, href]) => pathname === href || pathname.startsWith(`${href}/`))?.[0] ?? "Admin";

  return <>
    <aside className={`admin-sidebar${collapsed ? " is-collapsed" : ""}`}>
      <div>
        <div className="admin-sidebar-header">
          <Link className="admin-brand" href="/admin/attendees" aria-label="YELS 2026 Admin"><strong><span className="admin-brand-full">YELS </span><span>2026</span></strong><small>ADMIN PORTAL</small></Link>
          <button className="admin-sidebar-toggle" type="button" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!collapsed}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 6-6 6 6 6" /></svg>
          </button>
        </div>
        <Links collapsed={collapsed} />
      </div>
      <div className="admin-account">
        <span className="admin-avatar">{initials}</span>
        <div><b>{fullName}</b><small>{email}</small></div>
        <form action="/api/admin/logout" method="post"><button title="Sign out">Sign out</button></form>
      </div>
    </aside>

    <details ref={mobileMenu} className="admin-mobile-menu admin-scanner-menu">
      <summary><span className="admin-hamburger" aria-hidden="true"><i /><i /><i /></span><strong>{currentLabel === "Check-in" ? "Scan Attendee" : currentLabel}</strong><span className="admin-menu-spacer" /></summary>
      <div><Links /><form action="/api/admin/logout" method="post"><button>Sign out</button></form></div>
    </details>
  </>;
}
