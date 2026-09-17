/**
 * Original decorative illustration — a marigold garland strung between two diyas —
 * used on the homepage hero instead of a stock photograph. Hand-built inline SVG so
 * it ships with no external asset requests and no licensing questions.
 */
export function HeroIllustration({ className }: { className?: string }) {
  const marigold = (cx: number, cy: number, scale = 1) => (
    <g transform={`translate(${cx} ${cy}) scale(${scale})`} key={`${cx}-${cy}`}>
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <ellipse
          key={angle}
          cx="0"
          cy="-6"
          rx="4.2"
          ry="6.5"
          fill="#FDBA3B"
          fillOpacity="0.92"
          transform={`rotate(${angle})`}
        />
      ))}
      <circle r="3.2" fill="#B4530A" />
    </g>
  );

  return (
    <svg viewBox="0 0 480 220" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* garland string */}
      <path
        d="M20 30 C 120 110, 360 110, 460 30"
        stroke="#FDE68A"
        strokeOpacity="0.5"
        strokeWidth="2"
        fill="none"
      />
      {Array.from({ length: 9 }).map((_, i) => {
        const t = i / 8;
        const x = 20 + t * 440;
        const y = 30 + Math.sin(Math.PI * t) * 78;
        return marigold(x, y, 0.9 + (i % 2) * 0.15);
      })}

      {/* two diyas anchoring the garland ends */}
      {[40, 440].map((cx) => (
        <g key={cx} transform={`translate(${cx} 150)`}>
          <ellipse cx="0" cy="18" rx="26" ry="7" fill="#ffffff" fillOpacity="0.18" />
          <path d="M-24 10c0 10 10.7 17 24 17s24-7 24-17c-6.6 3-15.2 4.6-24 4.6S-17.4 13-24 10Z" fill="#ffffff" fillOpacity="0.85" />
          <path d="M-24 8c0-4.6 10.7-8.2 24-8.2s24 3.6 24 8.2S13.3 16 0 16-24 12.6-24 8Z" fill="#ffffff" />
          <path
            className="origin-bottom animate-flicker"
            d="M0-24c2.6 3.8 4.4 6.9 4.4 10 0 2.9-2 5-4.4 5s-4.4-2.1-4.4-5c0-3.1 1.8-6.2 4.4-10Z"
            fill="#FDBA3B"
          />
        </g>
      ))}
    </svg>
  );
}
