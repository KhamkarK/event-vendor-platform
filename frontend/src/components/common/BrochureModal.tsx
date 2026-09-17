import { motion } from "framer-motion";
import clsx from "clsx";
import {
  CalendarCheck,
  Download,
  FileText,
  Heart,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";

import { DiyaIcon } from "@/assets/DiyaIcon";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { useAuthStore } from "@/store/authStore";
import type { UserRole } from "@/types/user";

const BROCHURE_PDF_PATH = "/brochure/EventKarma-Brochure.pdf";

const roleCopy: Record<UserRole, { greeting: string; tagline: string }> = {
  customer: {
    greeting: "Let's plan something memorable",
    tagline: "Set a budget, shortlist vendors, and book your event — all from one dashboard.",
  },
  vendor: {
    greeting: "Grow your business with EventKarma",
    tagline: "List your packages, respond to quotations, and manage bookings in one place.",
  },
  admin: {
    greeting: "Welcome back, Admin",
    tagline: "Approve vendors, monitor commissions, and keep the platform running smoothly.",
  },
};

const steps = [
  { icon: Wallet, label: "Set your budget", description: "Allocate spend across categories before you commit to anything." },
  { icon: Sparkles, label: "Discover vendors", description: "Browse curated caterers, decorators, photographers & more." },
  { icon: FileText, label: "Request quotations", description: "Compare offers from shortlisted vendors side by side." },
  { icon: CalendarCheck, label: "Confirm & track", description: "Bookings, ledger and status — always in view." },
];

const featureHighlights = [
  { icon: LayoutDashboard, label: "One dashboard for every event" },
  { icon: Heart, label: "Save favourites to your wishlist" },
  { icon: ShieldCheck, label: "Verified, admin-approved vendors" },
];

export function BrochureModal() {
  const user = useAuthStore((s) => s.user);
  const showBrochure = useAuthStore((s) => s.showBrochure);
  const dismissBrochure = useAuthStore((s) => s.dismissBrochure);

  if (!user) return null;
  const copy = roleCopy[user.role];

  return (
    <Modal isOpen={showBrochure} onClose={dismissBrochure} maxWidthClassName="max-w-2xl">
      <div className="accent-bar-top -m-6 mb-0 overflow-hidden rounded-t-2xl">
        <div className="hero-surface px-8 pb-8 pt-9 text-white">
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 shadow-glow">
            <DiyaIcon className="h-[22px] w-[22px]" />
          </span>
          <h2 className="font-display text-2xl font-bold leading-tight sm:text-3xl">
            {copy.greeting}, {user.full_name.split(" ")[0]}!
          </h2>
          <p className="mt-2 max-w-md text-sm text-white/85">{copy.tagline}</p>
        </div>
      </div>

      <div className="px-2 pt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-600">How EventKarma works</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.3 }}
              className="rounded-xl border border-neutral-100 bg-surface-soft p-3 text-center"
            >
              <span className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-white">
                <step.icon size={16} />
              </span>
              <p className="text-xs font-semibold text-neutral-800">{step.label}</p>
              <p className="mt-1 text-[11px] leading-snug text-neutral-500">{step.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {featureHighlights.map((feature) => (
            <span
              key={feature.label}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1.5 text-xs font-medium text-accent-700"
            >
              <feature.icon size={13} className="text-accent-600" />
              {feature.label}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button onClick={dismissBrochure} fullWidth className="sm:flex-1">
            Get started
          </Button>
          <motion.a
            href={BROCHURE_PDF_PATH}
            download="EventKarma-Brochure.pdf"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className={clsx(
              "inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white",
              "px-4 py-2.5 text-sm font-semibold text-neutral-700 transition-colors duration-200",
              "hover:border-brand-300 hover:text-brand-600"
            )}
          >
            <Download size={16} />
            Download brochure
          </motion.a>
        </div>
      </div>
    </Modal>
  );
}
