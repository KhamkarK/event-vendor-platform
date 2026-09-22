import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { MehendiCorner } from "@/assets/MehendiCorner";
import { EVENT_TYPES } from "@/features/events/eventTypes";

/** A browsable "shop by occasion" gallery — pick an occasion, then narrow
 * down to the vendor categories relevant to it (EventTypeCategoriesPage),
 * before landing on Find Vendors. */
export function EventTypesPage() {
  return (
    <div>
      <div className="relative mb-6">
        <MehendiCorner className="pointer-events-none absolute -right-1 -top-2 h-10 w-10 text-brand-200" />
        <h1 className="text-2xl font-extrabold text-neutral-900">What are you planning?</h1>
        <p className="mt-1 text-sm text-neutral-500">Pick the occasion — we&apos;ll help you find the right vendors for it.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {EVENT_TYPES.map((eventType, idx) => {
          const Icon = eventType.icon;
          return (
            <motion.div
              key={eventType.slug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              whileHover={{ y: -4 }}
            >
              <Link
                to={`/event-types/${eventType.slug}`}
                className="flex flex-col items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-5 text-center shadow-card transition-shadow hover:shadow-glow"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
                  <Icon size={26} />
                </span>
                <span className="text-sm font-semibold text-neutral-800">{eventType.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
