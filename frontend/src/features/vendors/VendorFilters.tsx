import { SlidersHorizontal } from "lucide-react";

import { Input } from "@/components/common/Input";
import { VENDOR_CATEGORIES } from "@/constants/vendorCategories";
import type { VendorSearchFilters } from "@/features/vendors/vendorsApi";

interface VendorFiltersProps {
  filters: VendorSearchFilters;
  onChange: (filters: VendorSearchFilters) => void;
}

export function VendorFilters({ filters, onChange }: VendorFiltersProps) {
  const selectedCategories = filters.categories ?? [];

  const handleCategoriesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(e.target.selectedOptions, (option) => option.value);
    onChange({ ...filters, categories: values.length > 0 ? values : undefined });
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-neutral-100 bg-white p-5 shadow-card sm:flex-row sm:items-end">
      <div className="flex-1">
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">Category</label>
        <select
          multiple
          value={selectedCategories}
          onChange={handleCategoriesChange}
          className="h-[42px] w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-all duration-150 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
        >
          {VENDOR_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-neutral-400">Ctrl/Cmd-click to select more than one</p>
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
