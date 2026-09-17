import { ShieldCheck } from "lucide-react";

/**
 * A notched ribbon-banner badge (clip-path, no image asset) for admin-approved
 * vendors — reads as a trust seal rather than a generic rounded pill.
 */
export function VerifiedRibbon({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 bg-gradient-to-r from-accent-500 to-accent-400 font-bold text-white shadow ${
        compact ? "gap-1 py-1 pl-2.5 pr-3 text-[10px]" : "gap-1.5 py-1.5 pl-3 pr-4 text-xs"
      } ${className}`}
      style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 8% 100%, 0% 50%)" }}
    >
      <ShieldCheck size={compact ? 11 : 13} />
      Verified
    </span>
  );
}
