import { apiClient } from "@/lib/axios";
import type { VendorDetail, VendorSearchResult } from "@/types/vendor";

export interface VendorSearchFilters {
  category?: string;
  /** Multi-select category picklist (e.g. from the Event Types flow, or the
   * Find Vendors filter bar). Takes precedence over `category` server-side. */
  categories?: string[];
  location?: string;
  min_rating?: number;
  max_budget?: number;
}

export async function searchVendors(filters: VendorSearchFilters): Promise<VendorSearchResult[]> {
  // Built as URLSearchParams (rather than handed to axios as a plain object)
  // so `categories` is guaranteed to serialize as repeated `categories=A&categories=B`
  // params, which is what FastAPI's `list[str]` Query parameter expects.
  const params = new URLSearchParams();
  if (filters.category) params.append("category", filters.category);
  filters.categories?.forEach((category) => params.append("categories", category));
  if (filters.location) params.append("location", filters.location);
  if (filters.min_rating !== undefined) params.append("min_rating", String(filters.min_rating));
  if (filters.max_budget !== undefined) params.append("max_budget", String(filters.max_budget));

  const { data } = await apiClient.get<VendorSearchResult[]>("/vendors", { params });
  return data;
}

export async function getVendorDetail(vendorId: number): Promise<VendorDetail> {
  const { data } = await apiClient.get<VendorDetail>(`/vendors/${vendorId}`);
  return data;
}

export async function toggleWishlist(vendorId: number): Promise<{ wishlisted: boolean }> {
  const { data } = await apiClient.post<{ wishlisted: boolean }>("/wishlist/toggle", { vendor_id: vendorId });
  return data;
}

export async function addReview(vendorId: number, rating: number, comment?: string) {
  const { data } = await apiClient.post(`/vendors/${vendorId}/reviews`, { rating, comment });
  return data;
}

export async function createBooking(payload: { event_id: number; vendor_id: number; package_id?: number }) {
  const { data } = await apiClient.post("/bookings", payload);
  return data;
}

export async function getVendorAvailability(vendorId: number): Promise<string[]> {
  const { data } = await apiClient.get<string[]>(`/vendors/${vendorId}/availability`);
  return data;
}
