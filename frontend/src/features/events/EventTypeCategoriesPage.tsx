import { motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/common/Button";
import { VENDOR_CATEGORIES } from "@/constants/vendorCategories";
import { EVENT_TYPES } from "@/features/events/eventTypes";

export function EventTypeCategoriesPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);

  const eventType = EVENT_TYPES.find((e) => e.slug === slug);

  const toggleCategory = (category: string) => {
    setSelected((current) => (current.includes(category) ? current.filter((c) => c !== category) : [...current, category]));
  };

  const showVendors = () => {
    navigate("/vendors", { state: { categories: selected } });
  };

  if (!eventType) {
    return (
      <div className="text-center">
        <p className="text-sm text-neutral-500">We couldn&apos;t find that occasion.</p>
        <Link to="/event-types" className="mt-2 inline-block text-sm font-semibold text-brand-600 hover:underline">
          Back to Event Types
        </Link>
      </div>
    );
  }

  const Icon = eventType.icon;

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/event-types" className="mb-4 flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-800">
        <ArrowLeft size={15} /> Back to Event Types
      </Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
          <Icon size={22} />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900">{eventType.label}</h1>
          <p className="text-sm text-neutral-500">Select the kinds of vendors you&apos;re looking for — pick as many as you like.</p>
        </div>
      </motion.div>

      <div className="flex flex-wrap gap-2">
        {VENDOR_CATEGORIES.map((category) => {
          const active = selected.includes(category);
          return (
            <button
              key={category}
              type="button"
              onClick={() => toggleCategory(category)}
              className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                active
                  ? "border-brand-400 bg-brand-50 text-brand-700"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
              }`}
            >
              {active && <Check size={14} />}
              {category}
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between rounded-2xl border border-neutral-100 bg-white p-4 shadow-card">
        <p className="text-sm text-neutral-500">
          {selected.length === 0 ? "No categories selected yet" : `${selected.length} categor${selected.length === 1 ? "y" : "ies"} selected`}
        </p>
        <Button onClick={showVendors} disabled={selected.length === 0}>
          Show vendors
        </Button>
      </div>
    </div>
  );
}
