/**
 * SohalaSetu brand mark: a diya flame (sohala — the celebration) resting on the
 * arch of a bridge (setu). Original hand-built glyph, drawn with currentColor
 * like DiyaIcon so it inherits the surrounding text colour.
 */
export function SetuLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        className="origin-bottom animate-flicker"
        d="M12 1.8c1.1 1.5 1.8 2.7 1.8 3.8 0 1.1-.8 1.9-1.8 1.9s-1.8-.8-1.8-1.9c0-1.1.7-2.3 1.8-3.8Z"
        fill="currentColor"
      />
      <path d="M3 15.5c0-4 4-6.5 9-6.5s9 2.5 9 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7.5 11.2v4.3M12 9.2v6.3M16.5 11.2v4.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M1.8 15.5h20.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M2 19.2c2 0 2-1.4 4-1.4s2 1.4 4 1.4 2-1.4 4-1.4 2 1.4 4 1.4 2-1.4 4-1.4"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
