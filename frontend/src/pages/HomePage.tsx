import { motion } from "framer-motion";
import { ArrowRight, LogIn, Search, Sparkles, Store, Wallet } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { DiyaIcon } from "@/assets/DiyaIcon";
import { ScallopEdge } from "@/assets/ScallopEdge";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { VENDOR_CATEGORIES } from "@/constants/vendorCategories";
import { VENDOR_LOCATIONS } from "@/constants/vendorLocations";
import { useAuthStore } from "@/store/authStore";

/** Placeholder hero photo (swap this single URL for CEAT/EventKarma's own event
 * photography before a real launch). Layered under a gradient so the overlaid text
 * stays legible, and over a solid fallback color in case the image fails to load. */
const HERO_IMAGE_URL = "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=70";

const POPULAR_SEARCHES = [
  "Event Management Company",
  "Photography and Videography Services",
  "Marriage hall and Banquet Hall",
  "Outdoor Catering Services",
];

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
  const navigate = useNavigate();
  const [searchCategory, setSearchCategory] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  const primaryCta = isAuthenticated
    ? user?.role === "vendor"
      ? "/vendor-dashboard"
      : user?.role === "admin"
        ? "/admin"
        : "/events/new"
    : "/signup";

  // Hands the picked category/location to Find Vendors via router state — the
  // same mechanism the Event Types flow already uses to arrive pre-filtered.
  const goToVendors = (categories?: string[], location?: string) => {
    navigate("/vendors", { state: { categories, location } });
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    goToVendors(searchCategory ? [searchCategory] : undefined, searchLocation || undefined);
  };

  return (
    <div>
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-neutral-900 bg-cover bg-center px-6 py-16 text-white shadow-glow sm:px-14"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(20,12,10,0.55), rgba(20,12,10,0.78)), url(${HERO_IMAGE_URL})`,
        }}
      >
        <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
          <DiyaIcon className="h-3.5 w-3.5" /> Plan smarter, celebrate better
        </span>
        <h1 className="max-w-2xl text-3xl font-extrabold leading-tight sm:text-5xl">
          Budget your big day. Book the right vendors. Every time.
        </h1>
        <p className="mt-4 max-w-xl text-white/85">
          EventKarma turns event planning chaos into a clear budget, a curated vendor marketplace, and one place to track
          every booking — for weddings, birthdays, and corporate events alike.
        </p>

        <form
          onSubmit={handleSearch}
          className="mt-8 flex flex-col gap-2 rounded-2xl bg-white/95 p-3 shadow-xl backdrop-blur sm:flex-row sm:items-center"
        >
          <select
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            className="h-11 flex-1 rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          >
            <option value="">What are you looking for?</option>
            {VENDOR_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="h-11 flex-1 rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          >
            <option value="">All locations</option>
            {VENDOR_LOCATIONS.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
          <Button type="submit" size="md" fullWidth className="sm:w-auto">
            <Search size={16} /> Search
          </Button>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/70">
          <span className="font-semibold text-white/90">Popular:</span>
          {POPULAR_SEARCHES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => goToVendors([category])}
              className="underline-offset-2 hover:text-white hover:underline"
            >
              {category}
            </button>
          ))}
        </div>

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
