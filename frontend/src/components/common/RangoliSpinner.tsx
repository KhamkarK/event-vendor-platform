import { motion } from "framer-motion";

interface RangoliSpinnerProps {
  size?: number;
  className?: string;
  /** Optional caption shown under the spinner. */
  label?: string;
}

/**
 * An eight-petal rangoli/mandala motif used as the loading indicator in place of a
 * generic spinner or gray skeleton block — small, cheap to render, and on-theme.
 */
export function RangoliSpinner({ size = 40, className = "", label }: RangoliSpinnerProps) {
  const petals = Array.from({ length: 8 });
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        animate={{ rotate: 360 }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
      >
        <g>
          {petals.map((_, i) => (
            <motion.path
              key={i}
              d="M20 20 L20 4 A5 5 0 0 1 20 12 Z"
              fill="url(#rangoli-gradient)"
              transform={`rotate(${i * 45} 20 20)`}
              initial={{ opacity: 0.25 }}
              animate={{ opacity: [0.25, 1, 0.25] }}
              transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
            />
          ))}
          <circle cx="20" cy="20" r="3.5" fill="#e08e0b" />
        </g>
        <defs>
          <linearGradient id="rangoli-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a91d43" />
            <stop offset="100%" stopColor="#e08e0b" />
          </linearGradient>
        </defs>
      </motion.svg>
      {label && <p className="text-xs font-medium text-neutral-400">{label}</p>}
    </div>
  );
}

/** Full-width block variant for replacing `h-40 animate-pulse` placeholders. */
export function RangoliLoadingBlock({ label = "Loading…", className = "" }: { label?: string; className?: string }) {
  return (
    <div className={`flex h-40 items-center justify-center rounded-2xl border border-neutral-100 bg-surface-soft ${className}`}>
      <RangoliSpinner label={label} />
    </div>
  );
}
