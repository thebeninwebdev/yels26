import Link from "next/link";
import { event } from "../event";
export function RegistrationCTA({ label = "Register for the Summit" }: { label?: string }) {
  return event.registrationUrl ? (
    <Link className="registration" href={event.registrationUrl}>
      {label} <span aria-hidden="true">↗</span>
    </Link>
  ) : (
    <span className="registration registration-pending">
      Registration opens soon <span aria-hidden="true">↗</span>
    </span>
  );
}
export function Wordmark() {
  return (
    <span className="wordmark">
      <strong>YALI</strong> NETWORK EDO
    </span>
  );
}
export function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    book: (
      <>
        <path d="M12 5C8 2 4 2 2 4v16c3-2 7-2 10 0 3-2 7-2 10 0V4c-2-2-6-2-10 1Z" />
        <path d="M12 5v15" />
      </>
    ),
    people: (
      <>
        <circle cx="12" cy="7" r="3" />
        <path d="M5 22v-3a7 7 0 0 1 14 0v3M4 4a3 3 0 0 0 0 6M20 4a3 3 0 0 1 0 6M1 19v-2a5 5 0 0 1 4-5M23 19v-2a5 5 0 0 0-4-5" />
      </>
    ),
    chart: <path d="M2 22h21M4 22V12h4v10M11 22V3h4v19M18 22V8h4v14" />,
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M7 2v6M17 2v6" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6v6l4 2" />
      </>
    ),
    document: <path d="M5 2h9l5 5v15H5ZM14 2v6h5M8 12h8M8 16h8" />,
    qr: (
      <path d="M2 2h7v7H2ZM15 2h7v7h-7ZM2 15h7v7H2ZM15 15h3v3h-3ZM19 19h3v3h-3ZM15 21v1M22 13v3M12 2v3M12 10v4H7M2 12h2M12 18v4" />
    ),
    check: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="m7 12 3 3 7-7" />
      </>
    ),
  };
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
