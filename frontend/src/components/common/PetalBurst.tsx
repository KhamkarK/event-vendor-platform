import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

const PETAL_COLORS = ["#e08e0b", "#f7a71e", "#a91d43", "#df5c7d", "#fcc242"];

interface Petal {
  id: number;
  x: number;
  rotate: number;
  delay: number;
  color: string;
  drift: number;
}

function makePetals(count: number): Petal[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 260,
    rotate: Math.random() * 360,
    delay: Math.random() * 0.15,
    color: PETAL_COLORS[i % PETAL_COLORS.length],
    drift: (Math.random() - 0.5) * 40,
  }));
}

/**
 * A brief burst of marigold petals — the celebratory payoff for a confirmed booking or
 * accepted quotation, in place of generic paper confetti. Self-dismisses; render it
 * conditionally from a parent `showBurst` boolean and flip that flag back to false
 * after `onDone` fires (or just after a couple seconds).
 */
export function PetalBurst({ show, onDone, originClassName = "" }: { show: boolean; onDone?: () => void; originClassName?: string }) {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => onDone?.(), 1400);
    return () => clearTimeout(timer);
  }, [show, onDone]);

  const petals = show ? makePetals(18) : [];

  return (
    <div className={`pointer-events-none fixed inset-x-0 top-24 z-[60] flex justify-center ${originClassName}`}>
      <AnimatePresence>
        {show &&
          petals.map((petal) => (
            <motion.span
              key={petal.id}
              initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 0.6 }}
              animate={{ opacity: 0, x: petal.x + petal.drift, y: 160, rotate: petal.rotate, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, delay: petal.delay, ease: "easeOut" }}
              className="absolute h-3 w-2.5 rounded-t-full rounded-bl-full"
              style={{ backgroundColor: petal.color }}
            />
          ))}
      </AnimatePresence>
    </div>
  );
}
