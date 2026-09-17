import { motion } from "framer-motion";
import { ArrowRight, LogIn, Sparkles, Store, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

import { DiyaIcon } from "@/assets/DiyaIcon";
import { HeroIllustration } from "@/assets/HeroIllustration";
import { ScallopEdge } from "@/assets/ScallopEdge";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { useAuthStore } from "@/store/authStore";

const features = [
  {
    icon: Wallet,
    title: "Smart Budget Allocation",
    description: "Auto-generated categories, drag-and-drop reallocation, and real-time over-budget alerts.",
  },
  {
    icon: Store,
    title: "Curated Vendor Marketplace",
    description: "Search by budget, rating and location. View packages, photos and verified reviews.",
  },
  {
    icon: Sparkles,
    title: "Vendor Khatabook",
    description: "Vendors track advances, dues and invoices with a familiar ledger-style accounting view.",
  },
];

export function HomePage() {
  const { isAuthenticated, user } = useAuthStore();
  const primaryCta = isAuthenticated
    ? user?.role === "vendor"
      ? "/vendor-dashboard"
      : user?.role === "admin"
        ? "/admin"
        : "/events/new"
    : "/signup";

  return (
    <div>
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="hero-surface relative overflow-hidden rounded-3xl px-8 py-16 text-white shadow-glow sm:px-14"
      >
        <HeroIllustration className="pointer-events-none absolute inset-x-0 top-0 h-28 w-full opacity-90 sm:h-36" />

        <span className="mb-4 mt-10 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide sm:mt-16">
          <DiyaIcon className="h-3.5 w-3.5" /> Plan smarter, celebrate better
        </span>
        <h1 className="max-w-2xl text-3xl font-extrabold leading-tight sm:text-5xl">
          Budget your big day. Book the right vendors. Every time.
        </h1>
        <p className="mt-4 max-w-xl text-white/85">
          EventKarma turns event planning chaos into a clear budget, a curated vendor marketplace, and one place to track
          every booking — for weddings, birthdays, and corporate events alike.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to={primaryCta}>
            <Button size="lg" variant="secondary" className="!bg-white !text-brand-700 hover:!bg-white/90">
              Get started <ArrowRight size={16} />
            </Button>
          </Link>
          {!isAuthenticated && (
            <Link to="/login">
              <Button size="lg" variant="outline" className="!border-white/60 !bg-transparent !text-white hover:!bg-white/10">
                <LogIn size={16} /> Log in
              </Button>
            </Link>
          )}
          <Link to="/vendors">
            <Button size="lg" variant="ghost" className="!text-white hover:!bg-white/10">
              Browse vendors
            </Button>
          </Link>
        </div>

        <ScallopEdge className="pointer-events-none absolute inset-x-0 bottom-0 h-5 w-full" fill="#faf7f2" />
      </motion.section>

      <section className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <motion.div key={feature.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
              <Card hoverLift className="h-full">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
                  <Icon size={20} />
                </span>
                <h3 className="mt-4 text-base font-bold text-neutral-900">{feature.title}</h3>
                <p className="mt-1.5 text-sm text-neutral-500">{feature.description}</p>
              </Card>
            </motion.div>
          );
        })}
      </section>
    </div>
  );
}
