import { animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  value: number;
  /** Formats the interpolated number for display, e.g. adding a ₹ prefix. */
  format?: (value: number) => string;
  duration?: number;
  className?: string;
}

/**
 * Counts up from its previous value to `value` whenever it changes, instead of the
 * number just appearing — used for the admin dashboard's headline stat tiles.
 */
export function AnimatedCounter({ value, format, duration = 1, className }: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    const controls = animate(prevValue.current, value, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(latest),
    });
    prevValue.current = value;
    return () => controls.stop();
  }, [value, duration]);

  const rounded = Math.round(display);
  return <span className={className}>{format ? format(rounded) : rounded.toLocaleString()}</span>;
}
