import { useQuery } from "@tanstack/react-query";
import { SearchX } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";

import { EmptyState } from "@/components/common/EmptyState";
import { VendorCard } from "@/features/vendors/VendorCard";
import { VendorFilters } from "@/features/vendors/VendorFilters";
import { searchVendors, type VendorSearchFilters } from "@/features/vendors/vendorsApi";

export function VendorSearchPage() {
  // Arriving from the Event Types flow (EventTypeCategoriesPage) hands us the
  // customer's selected categories via router state, so Find Vendors opens
  // already filtered to them.
  const location = useLocation();
  const initialCategories = (location.state as { categories?: string[] } | null)?.categories;

  const [filters, setFilters] = useState<VendorSearchFilters>(
    initialCategories && initialCategories.length > 0 ? { categories: initialCategories } : {}
  );
  const { data: vendors, isLoading } = useQuery({
    queryKey: ["vendors", filters],
    queryFn: () => searchVendors(filters),
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-neutral-900">Find the perfect vendor</h1>
        <p className="mt-1 text-sm text-neutral-500">Filter by budget, rating, and location to match your event.</p>
      </div>

      <VendorFilters filters={filters} onChange={setFilters} />

      <div className="mt-6">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-neutral-100" />
            ))}
          </div>
        ) : !vendors || vendors.length === 0 ? (
          <EmptyState icon={SearchX} title="No vendors found" description="Try widening your filters — location, budget, or rating." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
