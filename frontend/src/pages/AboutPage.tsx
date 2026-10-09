import { motion } from "framer-motion";
import { ShieldCheck, Sparkles, Store, Wallet } from "lucide-react";

import { Card } from "@/components/common/Card";

const pillars = [
  {
    icon: Wallet,
    title: "Smart Budget Allocation",
    description:
      "Auto-generated budget categories for your event, with drag-and-drop reallocation and real-time over-budget alerts.",
  },
  {
    icon: Store,
    title: "Curated Vendor Marketplace",
    description: "Search verified vendors by category, budget, rating and location. Compare packages, photos and reviews.",
  },
  {
    icon: Sparkles,
    title: "Vendor Khatabook",
    description: "Vendors track advances, dues and invoices with a familiar ledger-style accounting view.",
  },
  {
    icon: ShieldCheck,
    title: "Verified & Approved Vendors",
    description: "Every vendor on the platform is reviewed and approved before they can list packages or take bookings.",
  },
];

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold text-neutral-900">About SohalaSetu (सोहळासेतू)</h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600">
          SohalaSetu turns event planning chaos into a clear budget, a curated vendor marketplace, and one place to
          track every booking — for weddings, birthdays, and corporate events alike. Whether you&apos;re planning a
          wedding ceremony, a corporate conference, or a baby shower, SohalaSetu helps you set a realistic budget,
          discover the right vendors for your occasion and location, and keep every booking, payment and review
          organized in one place.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600">
          Vendors get their own dashboard to list packages, manage their calendar and blocked dates, send quotations,
          and track advances and dues through a simple ledger — no separate bookkeeping tools required.
        </p>
      </motion.div>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {pillars.map((pillar, idx) => {
          const Icon = pillar.icon;
          return (
            <motion.div key={pillar.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}>
              <Card hoverLift className="h-full">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
                  <Icon size={20} />
                </span>
                <h3 className="mt-4 text-base font-bold text-neutral-900">{pillar.title}</h3>
                <p className="mt-1.5 text-sm text-neutral-500">{pillar.description}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
