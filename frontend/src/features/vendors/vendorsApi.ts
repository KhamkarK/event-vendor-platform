import { apiClient } from "@/lib/axios";
import type { VendorDetail, VendorSearchResult } from "@/types/vendor";

export interface VendorSearchFilters {
  category?: string;
  location?: string;
  min_rating?: number;
  max_budget?: number;
}

export async function searchVendors(filters: VendorSearchFilters): Promise<VendorSearchResult[]> {
  const { data } = await apiClient.get<VendorSearchResult[]>("/vendors", { params: filters });
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
