import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import clsx from "clsx";

interface CardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  hoverLift?: boolean;
  glass?: boolean;
  /** Adds a thin gold-to-maroon accent bar along the top edge, for an "invitation card" feel. */
  accent?: boolean;
}

export function Card({ children, className, hoverLift = false, glass = false, accent = false, ...props }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={hoverLift ? { y: -4, boxShadow: "0 16px 40px -12px rgba(169,29,67,0.25)" } : undefined}
      className={clsx(
        "rounded-2xl border border-neutral-100 bg-white p-5 shadow-card",
        glass && "glass-card",
        accent && "accent-bar-top",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
