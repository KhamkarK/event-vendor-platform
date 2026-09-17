/**
 * Original hand-built diya (oil lamp) glyph used as the brand mark in place of a
 * generic stock icon — a small, load-instantly SVG rather than a downloaded image.
 */
export function DiyaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 14c0 3.5 4 6 9 6s9-2.5 9-6c-2.5 1.2-5.7 1.8-9 1.8S5.5 15.2 3 14Z"
        fill="currentColor"
        fillOpacity="0.35"
      />
      <path
        d="M2.5 13.2C2.5 11.5 6.7 10 12 10s9.5 1.5 9.5 3.2S17.3 16 12 16s-9.5-1.1-9.5-2.8Z"
        fill="currentColor"
      />
      <path
        className="origin-bottom animate-flicker"
        d="M12 3.5c1.1 1.6 1.9 2.9 1.9 4.2 0 1.2-.85 2.1-1.9 2.1s-1.9-.9-1.9-2.1c0-1.3.8-2.6 1.9-4.2Z"
        fill="currentColor"
      />
    </svg>
  );
}
