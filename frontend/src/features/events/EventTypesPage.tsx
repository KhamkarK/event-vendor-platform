import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { MehendiCorner } from "@/assets/MehendiCorner";
import { Button } from "@/components/common/Button";
import { EVENT_TYPES } from "@/features/events/eventTypes";
import { VendorChecklistModal } from "@/features/events/VendorChecklistModal";

/** The occasion photos are hotlinked (see eventTypes.ts) — some networks
 * (corporate proxies, ad/privacy blockers) can't reach that host, so this
 * falls back to the event type's own Lucide icon instead of a broken-image
 * glyph, matching the brand-tinted icon circle EmptyState already uses. */
function EventTypeThumbnail({ image, icon: Icon }: { image: string; icon: LucideIcon }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-500">
        <Icon size={14} />
      </span>
    );
  }

  return <img src={image} alt="" onError={() => setFailed(true)} className="h-7 w-7 shrink-0 rounded-full object-cover" />;
}

/** "Shop by occasion" — pick one or more occasions from the dropdown, then tap
 * Find Vendors to review/fine-tune the matching vendor categories in a
 * checklist modal (VendorChecklistModal) before landing on Find Vendors. */
export function EventTypesPage() {
  const [open, setOpen] = useState(false);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  // Ticks are held here until the customer presses OK; only then do they become selectedSlugs.
  const [pendingSlugs, setPendingSlugs] = useState<string[]>([]);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleEventType = (slug: string) => {
    setPendingSlugs((current) => (current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug]));
  };

  const toggleDropdown = () => {
    if (!open) setPendingSlugs(selectedSlugs);
    setOpen((v) => !v);
  };

  const applyEventTypes = () => {
    setSelectedSlugs(pendingSlugs);
    setOpen(false);
  };

  return (
    <div>
      <div className="relative mb-6">
        <MehendiCorner className="pointer-events-none absolute -right-1 -top-2 h-10 w-10 text-brand-200" />
        <h1 className="text-2xl font-extrabold text-neutral-900">What are you planning?</h1>
        <p className="mt-1 text-sm text-neutral-500">Select one or more occasions — we&apos;ll help you find the right vendors.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div ref={dropdownRef} className="relative w-full max-w-sm">
          <button
            type="button"
            onClick={toggleDropdown}
            className="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-card transition-colors hover:border-brand-300"
          >
            {selectedSlugs.length === 0
              ? "Select event type(s)"
              : `${selectedSlugs.length} event type${selectedSlugs.length === 1 ? "" : "s"} selected`}
            <ChevronDown size={16} className={`text-neutral-400 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute z-20 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-neutral-100 bg-white py-1.5 shadow-2xl"
              >
                {EVENT_TYPES.map((eventType) => {
                  const checked = pendingSlugs.includes(eventType.slug);
                  return (
                    <label
                      key={eventType.slug}
                      className="flex cursor-pointer items-center gap-2.5 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                          checked ? "border-brand-500 bg-brand-500 text-white" : "border-neutral-300"
                        }`}
                      >
                        {checked && <Check size={11} />}
                      </span>
                      <input type="checkbox" checked={checked} onChange={() => toggleEventType(eventType.slug)} className="sr-only" />
                      <EventTypeThumbnail image={eventType.image} icon={eventType.icon} />
                      {eventType.label}
                    </label>
                  );
                })}
                <div className="sticky bottom-0 border-t border-neutral-100 bg-white px-3 pb-1 pt-2">
                  <Button type="button" fullWidth onClick={applyEventTypes}>
                    OK
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Button onClick={() => setChecklistOpen(true)} disabled={selectedSlugs.length === 0}>
          Find Vendors
        </Button>
      </div>

      <VendorChecklistModal isOpen={checklistOpen} onClose={() => setChecklistOpen(false)} selectedEventTypeSlugs={selectedSlugs} />
    </div>
  );
}
