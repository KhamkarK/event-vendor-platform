import { Search, SlidersHorizontal } from "lucide-react";

import { Input } from "@/components/common/Input";
import type { VendorSearchFilters } from "@/features/vendors/vendorsApi";

interface VendorFiltersProps {
  filters: VendorSearchFilters;
  onChange: (filters: VendorSearchFilters) => void;
}

export function VendorFilters({ filters, onChange }: VendorFiltersProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-neutral-100 bg-white p-5 shadow-card sm:flex-row sm:items-end">
      <div className="flex-1">
        <Input
          label="Category"
          placeholder="e.g. Catering, Photography"
          icon={<Search size={16} />}
          value={filters.category ?? ""}
          onChange={(e) => onChange({ ...filters, category: e.target.value || undefined })}
        />
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
