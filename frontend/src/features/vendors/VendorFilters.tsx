import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, SlidersHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/common/Input";
import { VENDOR_CATEGORIES } from "@/constants/vendorCategories";
import type { VendorSearchFilters } from "@/features/vendors/vendorsApi";

interface VendorFiltersProps {
  filters: VendorSearchFilters;
  onChange: (filters: VendorSearchFilters) => void;
}

export function VendorFilters({ filters, onChange }: VendorFiltersProps) {
  const selectedCategories = filters.categories ?? [];
  const [open, setOpen] = useState(false);
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

  const toggleCategory = (category: string) => {
    const next = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    onChange({ ...filters, categories: next.length > 0 ? next : undefined });
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-neutral-100 bg-white p-5 shadow-card sm:flex-row sm:items-end">
      <div ref={dropdownRef} className="relative flex-1">
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">Category</label>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-[42px] w-full items-center justify-between rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition-all duration-150 hover:border-brand-300 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
        >
          <span className="truncate text-neutral-700">
            {selectedCategories.length === 0
              ? "All categories"
              : `${selectedCategories.length} categor${selectedCategories.length === 1 ? "y" : "ies"} selected`}
          </span>
          <ChevronDown size={16} className={`shrink-0 text-neutral-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-neutral-100 bg-white py-1.5 shadow-2xl"
            >
              {VENDOR_CATEGORIES.map((category) => {
                const active = selectedCategories.includes(category);
                return (
                  <label
                    key={category}
                    className="flex cursor-pointer items-center gap-2.5 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        active ? "border-brand-500 bg-brand-500 text-white" : "border-neutral-300"
                      }`}
                    >
                      {active && <Check size={11} />}
                    </span>
                    <input type="checkbox" checked={active} onChange={() => toggleCategory(category)} className="sr-only" />
                    {category}
                  </label>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex-1">
        <Input
          label="Location"
          placeholder="City"
          value={filters.location ?? ""}
          onChange={(e) => onChange({ ...filters, location: e.target.value || undefined })}
        />
      </div>
      <div className="w-full sm:w-40">
        <Input
          label="Max budget (₹)"
          type="number"
          placeholder="Any"
          value={filters.max_budget ?? ""}
          onChange={(e) => onChange({ ...filters, max_budget: e.target.value ? Number(e.target.value) : undefined })}
        />
      </div>
      <div className="w-full sm:w-32">
        <Input
          label="Min rating"
          type="number"
          min={0}
          max={5}
          step={0.5}
          placeholder="Any"
          icon={<SlidersHorizontal size={16} />}
          value={filters.min_rating ?? ""}
          onChange={(e) => onChange({ ...filters, min_rating: e.target.value ? Number(e.target.value) : undefined })}
        />
      </div>
    </div>
  );
}
