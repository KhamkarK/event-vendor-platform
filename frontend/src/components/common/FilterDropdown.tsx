import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/common/Button";

interface FilterDropdownProps {
  label?: string;
  /** Shown on the button, and as the first list entry, when nothing is picked (value ""). */
  placeholder: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  triggerClassName?: string;
}

/** Single-choice filter dropdown: picking an item only highlights it — the
 * filter is applied, and the list closed, when the user presses OK. Clicking
 * outside discards an unapplied pick. Same look as the multi-select Category
 * dropdown in features/vendors/VendorFilters.tsx. */
export function FilterDropdown({
  label,
  placeholder,
  options,
  value,
  onChange,
  triggerClassName = "h-[42px]",
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(value);
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

  const toggleDropdown = () => {
    if (!open) setPending(value);
    setOpen((v) => !v);
  };

  const apply = () => {
    onChange(pending);
    setOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative flex-1">
      {label && <label className="mb-1.5 block text-sm font-medium text-neutral-700">{label}</label>}
      <button
        type="button"
        onClick={toggleDropdown}
        className={`flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition-all duration-150 hover:border-brand-300 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 ${triggerClassName}`}
      >
        <span className="truncate text-neutral-700">{value || placeholder}</span>
        <ChevronDown size={16} className={`shrink-0 text-neutral-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-20 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-neutral-100 bg-white py-1.5 shadow-2xl"
          >
            {["", ...options].map((option) => {
              const active = pending === option;
              return (
                <button
                  key={option || "__all"}
                  type="button"
                  onClick={() => setPending(option)}
                  className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50"
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                      active ? "border-brand-500 bg-brand-500 text-white" : "border-neutral-300"
                    }`}
                  >
                    {active && <Check size={11} />}
                  </span>
                  {option || placeholder}
                </button>
              );
            })}
            <div className="sticky bottom-0 border-t border-neutral-100 bg-white px-3 pb-1 pt-2">
              <Button type="button" fullWidth onClick={apply}>
                OK
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
