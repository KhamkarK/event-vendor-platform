import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { VENDOR_CATEGORIES } from "@/constants/vendorCategories";
import { EVENT_TYPES } from "@/features/events/eventTypes";
import { EVENT_TYPE_CATEGORY_MAP } from "@/features/events/eventTypeCategoryMap";

interface VendorChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEventTypeSlugs: string[];
}

/** Opens after the customer picks occasion(s) on the Event Types screen and taps
 * "Find Vendors". Pre-checks the vendor categories relevant to those occasions
 * (from eventTypeCategoryMap.ts) against the full category list, lets the
 * customer fine-tune the selection, then hands the chosen categories off to
 * Find Vendors — mirrors the "Your Vendor Checklist" screen design. */
export function VendorChecklistModal({ isOpen, onClose, selectedEventTypeSlugs }: VendorChecklistModalProps) {
  const navigate = useNavigate();
  const [checked, setChecked] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const merged = new Set<string>();
    selectedEventTypeSlugs.forEach((slug) => EVENT_TYPE_CATEGORY_MAP[slug]?.forEach((category) => merged.add(category)));
    setChecked(Array.from(merged));
  }, [isOpen, selectedEventTypeSlugs]);

  const title = EVENT_TYPES.filter((eventType) => selectedEventTypeSlugs.includes(eventType.slug))
    .map((eventType) => eventType.label)
    .join(", ");

  const toggleCategory = (category: string) => {
    setChecked((current) => (current.includes(category) ? current.filter((c) => c !== category) : [...current, category]));
  };

  const selectAll = () => setChecked([...VENDOR_CATEGORIES]);

  const handleSearchVendors = () => {
    navigate("/vendors", { state: { categories: checked } });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidthClassName="max-w-3xl">
      <div className="mb-4 -mt-2">
        <h2 className="text-xl font-extrabold text-neutral-900">{title || "Your occasions"}</h2>
        <p className="mt-1 text-sm text-neutral-500">Select all the vendors you need for your event.</p>
      </div>

      <div className="border-t border-neutral-100 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-900">Your Vendor Checklist</h3>
          <span className="text-xs font-medium text-neutral-500">{checked.length} Selected</span>
        </div>

        <div className="grid max-h-96 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
          {VENDOR_CATEGORIES.map((category) => {
            const active = checked.includes(category);
            return (
              <label
                key={category}
                className="flex cursor-pointer items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-100"
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    active ? "border-brand-500 bg-brand-500 text-white" : "border-neutral-300 bg-white"
                  }`}
                >
                  {active && <Check size={11} />}
                </span>
                <input type="checkbox" checked={active} onChange={() => toggleCategory(category)} className="sr-only" />
                {category}
              </label>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4">
          <Button variant="outline" size="sm" onClick={selectAll}>
            Select All
          </Button>
          <Button size="sm" onClick={handleSearchVendors} disabled={checked.length === 0}>
            Search Vendors
          </Button>
        </div>
      </div>
    </Modal>
  );
}
