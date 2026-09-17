/**
 * A single hand-drawn paisley/mehendi corner flourish — used at low opacity on major
 * dashboard section headers so those pages read as designed rather than a stock
 * admin-panel template. `currentColor` so it can be tinted per-surface (white on the
 * brand gradient, brand-200 on light cards).
 */
export function MehendiCorner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 4C20 4 18 20 30 22C42 24 40 8 54 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M8 14C18 16 20 26 32 26C40 26 40 16 50 18"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.4"
      />
      <circle cx="30" cy="22" r="2.2" fill="currentColor" opacity="0.7" />
      <circle cx="12" cy="8" r="1.4" fill="currentColor" opacity="0.5" />
      <circle cx="50" cy="10" r="1.4" fill="currentColor" opacity="0.5" />
    </svg>
  );
}
